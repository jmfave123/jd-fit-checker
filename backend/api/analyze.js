import { GoogleGenerativeAI } from '@google/generative-ai'
import { chromium } from 'playwright'
import profile from '../profile.json' with { type: 'json' }

const requestLog = new Map()
const RATE_LIMIT = 100
const WINDOW_MS = 60 * 60 * 1000

function getClientIp(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket?.remoteAddress || 'unknown'
}

function isRateLimited(ip) {
  const now = Date.now()
  const recentRequests = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS)
  if (recentRequests.length >= RATE_LIMIT) {
    requestLog.set(ip, recentRequests)
    return true
  }
  recentRequests.push(now)
  requestLog.set(ip, recentRequests)
  return false
}

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body))
}

async function scrapeJobPosting(url) {
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ userAgent: 'JD-Fit-Checker/1.0' })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    const content = await page.locator('body').innerText()
    const title = await page.title()
    if (!content || content.trim().length < 120) {
      throw new Error('The page did not contain enough readable job description text.')
    }
    console.log(`[JD-Fit-Checker] Scraped ${content.trim().length} chars from ${url}`)
    return { title, content: content.trim().slice(0, 30000) }
  } catch (error) {
    console.error('[JD-Fit-Checker] Scrape error for URL:', url, 'Error:', error.message)
    const scrapeError = new Error('We could not read that job posting. The site may block scraping, the URL may be invalid, or the page structure may be unexpected.')
    scrapeError.cause = error
    throw scrapeError
  } finally {
    await browser?.close()
  }
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  return {
    matched: Array.isArray(parsed.matched) ? parsed.matched.filter((item) => item?.requirement && item?.reason) : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter(Boolean) : [],
    suggestedOpener: typeof parsed.suggestedOpener === 'string' ? parsed.suggestedOpener : '',
  }
}

async function analyzeWithGemini(job) {
  // The API key and profile stay server-side; only the normalized result returns to the browser.
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' })
  const prompt = `You are an honest technical recruiter. Cross-reference the candidate profile against the job description. Do not overstate fit or invent experience. State gaps directly. Return strict JSON only with this exact shape: {"matched":[{"requirement":"string","reason":"one line"}],"gaps":["string"],"suggestedOpener":"string"}.\n\nCANDIDATE PROFILE:\n${JSON.stringify(profile)}\n\nJOB DESCRIPTION (${job.title}):\n${job.content}`
  const result = await model.generateContent(prompt)
  return parseGeminiJson(result.response.text())
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' })
  if (isRateLimited(getClientIp(request))) return sendJson(response, 429, { error: 'Too many analyses. Please try again in an hour.' })

  try {
    const { url } = request.body || {}
    if (!url) return sendJson(response, 400, { error: 'A job posting URL is required.' })
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.')
    const job = await scrapeJobPosting(parsedUrl.toString())
    const analysis = await analyzeWithGemini(job)
    return sendJson(response, 200, { ...analysis, jobTitle: job.title })
  } catch (error) {
    const message = error.message.includes('read that job posting')
      ? error.message
      : 'The analysis could not be completed. Please check the URL and try again.'
    return sendJson(response, 422, { error: message })
  }
}