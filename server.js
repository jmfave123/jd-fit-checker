import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import handler from './api/analyze.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Serve static files from the Vite output directory
const frontendDist = join(__dirname, 'frontend', 'dist')
app.use(express.static(frontendDist))

// API route
app.post('/api/analyze', (req, res) => {
  handler(req, res)
})

// Fallback: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'))
})

// Error handling
app.use((err, req, res) => {
  console.error('[Server Error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[JD-Fit-Checker] Server running on port ${PORT}`)
  console.log(`[JD-Fit-Checker] Serving frontend from ${frontendDist}`)
  console.log(`[JD-Fit-Checker] API endpoint: POST /api/analyze`)
})
