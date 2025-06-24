export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; SameSite=None; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return res.status(200).json({ success: true, message: 'Logged Out Successfully.' });
} 