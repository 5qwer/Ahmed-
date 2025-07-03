import mongoose from 'mongoose';
import User from '../models/User.js';
const connect = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};
export default async function handler(req, res) {
  await connect();
  const { path } = req.query;
  if (req.method === 'POST') {
    if (path === 'login') return res.json({ message: "Login logic" });
    if (path === 'register') return res.json({ message: "Register logic" });
    return res.status(404).json({ error: "Invalid path" });
  }
  res.status(405).json({ error: "Method not allowed" });
}