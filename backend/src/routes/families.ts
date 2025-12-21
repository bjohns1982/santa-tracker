import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { geocodeAddress } from '../services/geocoding';
import { formatPhoneNumber, validatePhoneNumber } from '../services/phoneValidation';

const router = express.Router();

const childSchema = z.object({
  firstName: z.string().min(1),
  specialInstructions: z.string().optional(),
});

const createFamilySchema = z.object({
  streetNumber: z.string().min(1),
  streetName: z.string().min(1),
  familyName: z.string().min(1),
  children: z.array(childSchema).min(1),
  phoneNumber1: z.string().optional().nullable(),
  phoneNumber2: z.string().optional().nullable(),
  smsOptIn: z.boolean().optional().default(false),
});

// Create family (public via invite code)
router.post('/invite/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { streetNumber, streetName, familyName, children, phoneNumber1, phoneNumber2, smsOptIn } = createFamilySchema.parse(req.body);

    // Validate phone numbers if SMS opt-in is enabled
    if (smsOptIn) {
      if (!phoneNumber1) {
        return res.status(400).json({ error: 'Phone number is required when SMS opt-in is enabled' });
      }
      const formattedPhone1 = formatPhoneNumber(phoneNumber1);
      if (!formattedPhone1 || !validatePhoneNumber(formattedPhone1)) {
        return res.status(400).json({ error: 'Invalid phone number format. Please use format: +1XXXXXXXXXX' });
      }
      if (phoneNumber2) {
        const formattedPhone2 = formatPhoneNumber(phoneNumber2);
        if (!formattedPhone2 || !validatePhoneNumber(formattedPhone2)) {
          return res.status(400).json({ error: 'Invalid secondary phone number format. Please use format: +1XXXXXXXXXX' });
        }
      }
    }

    // Verify tour exists
    const tour = await prisma.tour.findUnique({
      where: { inviteCode },
      include: {
        families: true,
      },
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if family already exists (by family name and tour)
    const existingFamily = await prisma.family.findFirst({
      where: {
        tourId: tour.id,
        familyName,
        streetNumber,
        streetName,
      },
    });

    let family;
    if (existingFamily) {
      // Update existing family - re-geocode address in case it changed
      const geocodeResult = await geocodeAddress(
        streetNumber,
        streetName,
        tour.city,
        tour.state,
        tour.zipCode
      );

      await prisma.child.deleteMany({
        where: { familyId: existingFamily.id },
      });

      const formattedPhone1 = phoneNumber1 ? formatPhoneNumber(phoneNumber1) : null;
      const formattedPhone2 = phoneNumber2 ? formatPhoneNumber(phoneNumber2) : null;

      family = await prisma.family.update({
        where: { id: existingFamily.id },
        data: {
          streetNumber,
          streetName,
          latitude: geocodeResult?.latitude || null,
          longitude: geocodeResult?.longitude || null,
          phoneNumber1: formattedPhone1,
          phoneNumber2: formattedPhone2,
          smsOptIn: smsOptIn || false,
          children: {
            create: children,
          },
        },
        include: {
          children: true,
        },
      });
    } else {
      // Get next order number
      const maxOrder = tour.families.length > 0
        ? Math.max(...tour.families.map(f => f.order))
        : -1;

      // Geocode the address
      const geocodeResult = await geocodeAddress(
        streetNumber,
        streetName,
        tour.city,
        tour.state,
        tour.zipCode
      );

      const formattedPhone1 = phoneNumber1 ? formatPhoneNumber(phoneNumber1) : null;
      const formattedPhone2 = phoneNumber2 ? formatPhoneNumber(phoneNumber2) : null;

      // Create new family with children
      family = await prisma.family.create({
        data: {
          tourId: tour.id,
          streetNumber,
          streetName,
          familyName,
          order: maxOrder + 1,
          latitude: geocodeResult?.latitude || null,
          longitude: geocodeResult?.longitude || null,
          phoneNumber1: formattedPhone1,
          phoneNumber2: formattedPhone2,
          smsOptIn: smsOptIn || false,
          children: {
            create: children,
          },
        },
        include: {
          children: true,
        },
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${tour.id}`).emit('family-added', { family, tourId: tour.id });
    }

    res.status(201).json(family);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update family (public - families can edit their own info)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { streetNumber, streetName, familyName, children, phoneNumber1, phoneNumber2, smsOptIn } = createFamilySchema.parse(req.body);

    // Validate phone numbers if SMS opt-in is enabled
    if (smsOptIn) {
      if (!phoneNumber1) {
        return res.status(400).json({ error: 'Phone number is required when SMS opt-in is enabled' });
      }
      const formattedPhone1 = formatPhoneNumber(phoneNumber1);
      if (!formattedPhone1 || !validatePhoneNumber(formattedPhone1)) {
        return res.status(400).json({ error: 'Invalid phone number format. Please use format: +1XXXXXXXXXX' });
      }
      if (phoneNumber2) {
        const formattedPhone2 = formatPhoneNumber(phoneNumber2);
        if (!formattedPhone2 || !validatePhoneNumber(formattedPhone2)) {
          return res.status(400).json({ error: 'Invalid secondary phone number format. Please use format: +1XXXXXXXXXX' });
        }
      }
    }

    // Get family to find tour
    const existingFamily = await prisma.family.findUnique({
      where: { id },
      include: { tour: true },
    });

    if (!existingFamily) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Geocode the updated address
    const geocodeResult = await geocodeAddress(
      streetNumber,
      streetName,
      existingFamily.tour.city,
      existingFamily.tour.state,
      existingFamily.tour.zipCode
    );

    // Delete existing children and create new ones
    await prisma.child.deleteMany({
      where: { familyId: id },
    });

    const formattedPhone1 = phoneNumber1 ? formatPhoneNumber(phoneNumber1) : null;
    const formattedPhone2 = phoneNumber2 ? formatPhoneNumber(phoneNumber2) : null;

    const family = await prisma.family.update({
      where: { id },
      data: {
        streetNumber,
        streetName,
        familyName,
        latitude: geocodeResult?.latitude || null,
        longitude: geocodeResult?.longitude || null,
        phoneNumber1: formattedPhone1,
        phoneNumber2: formattedPhone2,
        smsOptIn: smsOptIn || false,
        children: {
          create: children,
        },
      },
      include: {
        children: true,
        tour: true,
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${family.tourId}`).emit('family-updated', { family, tourId: family.tourId });
    }

    res.json(family);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete family (public - families can remove themselves)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const family = await prisma.family.findUnique({
      where: { id },
      include: { tour: true },
    });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const tourId = family.tourId;

    await prisma.family.delete({
      where: { id },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`tour-${tourId}`).emit('family-removed', { familyId: id, tourId });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get family by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        children: true,
        tour: {
          select: {
            id: true,
            name: true,
            status: true,
            inviteCode: true,
            startedAt: true,
          },
        },
      },
    });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json(family);
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

