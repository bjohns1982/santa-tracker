import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendTourStartMessages } from '../services/smsService';

const router = express.Router();

const createTourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter code'),
  zipCode: z.string().regex(/^\d{5}$/, 'Zip code must be exactly 5 digits'),
});

// Generate unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new tour
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, city, state, zipCode } = createTourSchema.parse(req.body);
    const tourGuideId = req.userId!;

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let exists = await prisma.tour.findUnique({ where: { inviteCode } });
    while (exists) {
      inviteCode = generateInviteCode();
      exists = await prisma.tour.findUnique({ where: { inviteCode } });
    }

    const tour = await prisma.tour.create({
      data: {
        name,
        tourGuideId,
        inviteCode,
        city,
        state,
        zipCode,
      },
      include: {
        families: {
          include: {
            children: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.status(201).json(tour);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tours for authenticated tour guide
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tourGuideId = req.userId!;

    const tours = await prisma.tour.findMany({
      where: { tourGuideId },
      include: {
        families: {
          include: {
            children: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            families: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(tours);
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tour by ID (authenticated)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tourGuideId = req.userId!;

    const tour = await prisma.tour.findFirst({
      where: {
        id,
        tourGuideId,
      },
      include: {
        families: {
          include: {
            children: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        visits: {
          include: {
            family: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tour by invite code (public)
router.get('/invite/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const tour = await prisma.tour.findUnique({
      where: { inviteCode },
      include: {
        families: {
          include: {
            children: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Get tour by invite code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tour status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tourGuideId = req.userId!;

    if (!['PLANNED', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (status === 'ACTIVE' && !req.body.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const tour = await prisma.tour.updateMany({
      where: {
        id,
        tourGuideId,
      },
      data: updateData,
    });

    if (tour.count === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // If tour is being activated, send SMS messages to families with opt-in
    if (status === 'ACTIVE') {
      // Send SMS asynchronously (don't wait for it)
      sendTourStartMessages(id).catch(err => {
        console.error('Failed to send tour start SMS messages:', err);
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${id}`).emit('tour-status-updated', { status, tourId: id });
      if (status === 'ACTIVE') {
        io.to(`tour-${id}`).emit('sms-sent', { tourId: id });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update tour status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tour
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tourGuideId = req.userId!;

    // Verify tour belongs to tour guide
    const tour = await prisma.tour.findFirst({
      where: {
        id,
        tourGuideId,
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Delete tour (cascade will delete families, children, and visits)
    await prisma.tour.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update family order
router.patch('/:id/families/order', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { familyOrders } = req.body; // Array of { familyId, order }
    const tourGuideId = req.userId!;

    // Verify tour belongs to tour guide
    const tour = await prisma.tour.findFirst({
      where: { id, tourGuideId },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Update all family orders
    await Promise.all(
      familyOrders.map(({ familyId, order }: { familyId: string; order: number }) =>
        prisma.family.updateMany({
          where: {
            id: familyId,
            tourId: id,
          },
          data: { order },
        })
      )
    );

    // If tour is active, also update visit orders
    if (tour.status === 'ACTIVE') {
      await Promise.all(
        familyOrders.map(({ familyId, order }: { familyId: string; order: number }) =>
          prisma.visit.updateMany({
            where: {
              familyId,
              tourId: id,
              status: { not: 'COMPLETED' }, // Only update non-completed visits
            },
            data: { order },
          })
        )
      );
    }

    // Also update SKIPPED visits if tour is active
    if (tour.status === 'ACTIVE') {
      await Promise.all(
        familyOrders.map(({ familyId, order }: { familyId: string; order: number }) =>
          prisma.visit.updateMany({
            where: {
              familyId,
              tourId: id,
              status: { notIn: ['COMPLETED', 'SKIPPED'] }, // Only update active visits
            },
            data: { order },
          })
        )
      );
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${id}`).emit('families-reordered', { tourId: id });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update family order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

