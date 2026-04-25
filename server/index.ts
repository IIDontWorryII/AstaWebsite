import express, { type Request, type Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import type { HealthResponse } from '../shared/types.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.send('ASTAWebsite API is running')
})

app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({ status: 'ok', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
