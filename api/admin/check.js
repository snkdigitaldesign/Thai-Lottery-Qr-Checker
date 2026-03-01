export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: "Missing number" });
  }

  // ตัวอย่าง mock data (ทดสอบก่อน)
  return res.status(200).json({
    success: true,
    number: number,
    result: "ยังไม่ถูกรางวัล",
    prize: null
  });
}
