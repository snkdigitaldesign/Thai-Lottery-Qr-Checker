import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = req.body

    console.log("Received data:", data)

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: 'Server error' })
  }
}
