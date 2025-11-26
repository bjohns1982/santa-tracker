import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Start tour - create visit records for all families
router.post('/:tourId/start', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tourId } = req.params;
    const tourGuideId = req.userId!;

    // Verify tour belongs to tour guide
    const tour = await prisma.tour.findFirst({
      where: {
        id: tourId,
        tourGuideId,
      },
      include: {
        families: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Delete existing visits
    await prisma.visit.deleteMany({
      where: { tourId },
    });

    // Create visit records for all families
    const visits = await Promise.all(
      tour.families.map((family, index) =>
        prisma.visit.create({
          data: {
            familyId: family.id,
            tourId,
            order: index,
            status: index === 0 ? 'ON_WAY' : 'PENDING',
          },
          include: {
            family: {
              include: {
                children: true,
              },
            },
          },
        })
      )
    );

    // Update tour status
    await prisma.tour.update({
      where: { id: tourId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${tourId}`).emit('tour-started', { tourId, visits });
    }

    res.json({ visits });
  } catch (error) {
    console.error('Start tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visit status (arrive, start visit, complete)
router.patch('/:visitId/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { visitId } = req.params;
    const { status } = req.body;
    const tourGuideId = req.userId!;

    if (!['PENDING', 'ON_WAY', 'VISITING', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get visit and verify tour belongs to tour guide
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        tour: true,
        family: {
          include: {
            children: true,
          },
        },
      },
    });

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (visit.tour.tourGuideId !== tourGuideId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData: any = { status };
    if (status === 'VISITING' && !visit.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
      include: {
        family: {
          include: {
            children: true,
          },
        },
      },
    });

    // If completing a visit, set next visit to ON_WAY
    if (status === 'COMPLETED') {
      const nextVisit = await prisma.visit.findFirst({
        where: {
          tourId: visit.tourId,
          order: { gt: visit.order },
          status: 'PENDING',
        },
        orderBy: {
          order: 'asc',
        },
      });

      if (nextVisit) {
        await prisma.visit.update({
          where: { id: nextVisit.id },
          data: { status: 'ON_WAY' },
        });
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${visit.tourId}`).emit('visit-updated', {
        visit: updatedVisit,
        tourId: visit.tourId,
      });
    }

    res.json(updatedVisit);
  } catch (error) {
    console.error('Update visit status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Requeue a completed visit back into the active roster
router.post('/:visitId/requeue', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { visitId } = req.params;
    const tourGuideId = req.userId!;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { tour: true },
    });

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (visit.tour.tourGuideId !== tourGuideId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const maxOrder = await prisma.visit.aggregate({
      where: { tourId: visit.tourId },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? 0) + 1;

    const requeuedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'PENDING',
        order: newOrder,
        startedAt: null,
        completedAt: null,
      },
      include: {
        family: true,
      },
    });

    // Update family order so the drag-and-drop list stays in sync
    await prisma.family.update({
      where: { id: visit.familyId },
      data: { order: newOrder },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${visit.tourId}`).emit('visit-requeued', {
        tourId: visit.tourId,
        visit: requeuedVisit,
      });
    }

    res.json(requeuedVisit);
  } catch (error) {
    console.error('Requeue visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Santa location (real-time)
router.post('/:tourId/location', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tourId } = req.params;
    const { latitude, longitude } = req.body;
    const tourGuideId = req.userId!;

    // Verify tour belongs to tour guide
    const tour = await prisma.tour.findFirst({
      where: {
        id: tourId,
        tourGuideId,
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Emit location to all clients watching this tour
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${tourId}`).emit('santa-location', {
        tourId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current visit status for a tour
router.get('/tour/:tourId/current', async (req, res) => {
  try {
    const { tourId } = req.params;

    const visits = await prisma.visit.findMany({
      where: { tourId },
      include: {
        family: {
          include: {
            children: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const currentVisit = visits.find(v => v.status === 'ON_WAY' || v.status === 'VISITING');
    const nextVisit = visits.find(v => v.status === 'PENDING');

    res.json({
      visits,
      currentVisit,
      nextVisit,
      completedCount: visits.filter(v => v.status === 'COMPLETED').length,
      totalCount: visits.length,
    });
  } catch (error) {
    console.error('Get current visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

