import { dbConnection } from '../../database/dbConnection.js';
import { User } from '../../models/userSchema.js';
import { sendEmail } from '../../utils/sendEmail.js';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please fill full registration form!' });
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return res.status(400).json({ success: false, message: 'Email already registered!' });
  }
  const user = await User.create({ name, email, phone, password, role });
  const subject = `Welcome to Job Portal, ${user.name}!`;
  let message;
  if (user.role === 'Job Seeker') {
    message = `<h1>Hi ${user.name},</h1><p>Welcome to Job Portal! We're excited to have you as a Job Seeker.</p><p>Start exploring thousands of job opportunities tailored for you.</p><p>Best of luck with your job search!</p><p>Regards,</p><p>Job Portal Team</p>`;
  } else if (user.role === 'Employer') {
    message = `<h1>Hi ${user.name},</h1><p>Welcome to Job Portal! We're thrilled to have you as an Employer.</p><p>Post job openings and find the best talent for your organization.</p><p>We look forward to helping you build a great team!</p><p>Regards,</p><p>Job Portal Team</p>`;
  }
  try {
    await sendEmail({ email: user.email, subject, message });
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
  const token = user.getJWTToken();
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=None; Secure`);
  return res.status(201).json({ success: true, user, message: 'User Registered!', token });
} 