import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationToken } from '../utils/sendVerificationToken.js';


// Register User
// Register User
export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email }  });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 min

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    },
  });

  try {
    await sendVerificationToken(email, token); // ✅ correct call
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send verification email' });
  }

  return res.status(200).json({
    message: 'User created. Verification code sent.',
    status: 'pending',
    email,
  });
};


// Verify Email
export const verifyEmail = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ message: 'All fields are required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.isVerified) {
    return res.status(200).json({ message: 'User already verified' });
  }

  const now = new Date();
  if (
    user.emailVerificationToken !== token ||
    !user.emailVerificationTokenExpiresAt ||
    now > user.emailVerificationTokenExpiresAt
  ) {
    return res.status(400).json({ message: 'Incorrect or expired token' });
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      isVerified: true,
    },
  });

  // IMPORTANT: Pass full user object to generateToken
  const JWTtoken = generateToken(user);

  res.cookie('token', JWTtoken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    message: 'Email verified successfully',
    user: {
      name: user.name,
      email: user.email,
      isVerified: true,
    },
  });
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Incorrect credentials' });
  }

  // IMPORTANT: Pass full user object to generateToken
  const JWTtoken = generateToken(user);

  res.cookie('token', JWTtoken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: 'Login successful',
    token: JWTtoken,
    user: {
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
};

// Logout
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};
