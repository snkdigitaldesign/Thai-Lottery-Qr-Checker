export default function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: "Missing number" });
  }

  res.status(200).json({
    success: true,
    number,
    prize: "Test response from Vercel Function"
  });
}
