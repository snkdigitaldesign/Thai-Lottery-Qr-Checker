export default async function handler(req, res) {
  console.log("force new build");
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(200).json({
    success: true,
    message: "API ทำงานแล้ว"
  });
}
