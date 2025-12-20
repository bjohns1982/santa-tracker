import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register tour guide - DISABLED (admin-only access)
router.post('/register', async (req, res) => {
  return res.status(403).json({ error: 'Registration is disabled. Admin access only.' });
});

// Login tour guide - Admin only (environment variable based)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Check if email matches admin email
    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (plain text comparison for simplicity)
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find or create admin user in database (for compatibility with existing system)
    let tourGuide = await prisma.tourGuide.findUnique({
      where: { email: adminEmail },
    });

    // If admin user doesn't exist, create it
    if (!tourGuide) {
      // Hash password for storage (even though we check against env var)
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      tourGuide = await prisma.tourGuide.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: 'Admin', // You can customize this or add ADMIN_NAME env var
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: tourGuide.id },
      jwtSecret,
      { expiresIn } as any
    );

    res.json({
      tourGuide: {
        id: tourGuide.id,
        email: tourGuide.email,
        name: tourGuide.name,
        createdAt: tourGuide.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

