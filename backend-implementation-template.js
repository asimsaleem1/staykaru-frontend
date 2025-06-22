/**
 * Backend Implementation Template for Admin Approval System
 * StayKaru - Admin Approval Workflow
 * 
 * This file provides the complete backend implementation needed
 * to support the admin approval workflow in the frontend.
 */

// ================================
// ACCOMMODATION APPROVAL ROUTES
// ================================

const express = require('express');
const router = express.Router();
const Accommodation = require('../models/Accommodation');
const { authenticateAdmin } = require('../middleware/auth');

// Admin approves accommodation
router.post('/admin/accommodations/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        isActive: true,
        adminApproved: true,
        visibleToStudents: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        $unset: { rejectedBy: 1, rejectedAt: 1, rejectionReason: 1 }
      },
      { new: true }
    );

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Optional: Send notification to landlord
    // await sendNotification(accommodation.owner, 'accommodation_approved');

    res.status(200).json({
      message: 'Accommodation approved successfully',
      accommodation
    });
  } catch (error) {
    console.error('Error approving accommodation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin rejects accommodation
router.post('/admin/accommodations/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        isActive: false,
        adminApproved: false,
        visibleToStudents: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
        $unset: { approvedBy: 1, approvedAt: 1 }
      },
      { new: true }
    );

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Optional: Send notification to landlord
    // await sendNotification(accommodation.owner, 'accommodation_rejected', rejectionReason);

    res.status(200).json({
      message: 'Accommodation rejected successfully',
      accommodation
    });
  } catch (error) {
    console.error('Error rejecting accommodation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// General admin update for accommodations
router.put('/admin/accommodations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;

    // Add admin metadata if approving
    if (updateData.approvalStatus === 'approved') {
      updateData.adminApproved = true;
      updateData.visibleToStudents = true;
      updateData.isActive = true;
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    } else if (updateData.approvalStatus === 'rejected') {
      updateData.adminApproved = false;
      updateData.visibleToStudents = false;
      updateData.isActive = false;
      updateData.rejectedBy = adminId;
      updateData.rejectedAt = new Date();
    }

    const accommodation = await Accommodation.findByIdAndUpdate(id, updateData, { new: true });

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.status(200).json({
      message: 'Accommodation updated successfully',
      accommodation
    });
  } catch (error) {
    console.error('Error updating accommodation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================================
// FOOD PROVIDER APPROVAL ROUTES
// ================================

const FoodProvider = require('../models/FoodProvider');

// Admin approves food provider
router.post('/admin/food-providers/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const foodProvider = await FoodProvider.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        isActive: true,
        adminApproved: true,
        visibleToStudents: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        $unset: { rejectedBy: 1, rejectedAt: 1, rejectionReason: 1 }
      },
      { new: true }
    );

    if (!foodProvider) {
      return res.status(404).json({ message: 'Food provider not found' });
    }

    // Optional: Send notification to food provider owner
    // await sendNotification(foodProvider.owner, 'food_provider_approved');

    res.status(200).json({
      message: 'Food provider approved successfully',
      foodProvider
    });
  } catch (error) {
    console.error('Error approving food provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin rejects food provider
router.post('/admin/food-providers/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const foodProvider = await FoodProvider.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        isActive: false,
        adminApproved: false,
        visibleToStudents: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
        $unset: { approvedBy: 1, approvedAt: 1 }
      },
      { new: true }
    );

    if (!foodProvider) {
      return res.status(404).json({ message: 'Food provider not found' });
    }

    // Optional: Send notification to food provider owner
    // await sendNotification(foodProvider.owner, 'food_provider_rejected', rejectionReason);

    res.status(200).json({
      message: 'Food provider rejected successfully',
      foodProvider
    });
  } catch (error) {
    console.error('Error rejecting food provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// General admin update for food providers
router.put('/admin/food-providers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;

    // Add admin metadata if approving
    if (updateData.approvalStatus === 'approved') {
      updateData.adminApproved = true;
      updateData.visibleToStudents = true;
      updateData.isActive = true;
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    } else if (updateData.approvalStatus === 'rejected') {
      updateData.adminApproved = false;
      updateData.visibleToStudents = false;
      updateData.isActive = false;
      updateData.rejectedBy = adminId;
      updateData.rejectedAt = new Date();
    }

    const foodProvider = await FoodProvider.findByIdAndUpdate(id, updateData, { new: true });

    if (!foodProvider) {
      return res.status(404).json({ message: 'Food provider not found' });
    }

    res.status(200).json({
      message: 'Food provider updated successfully',
      foodProvider
    });
  } catch (error) {
    console.error('Error updating food provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================================
// STUDENT-FACING ROUTES (FILTERED)
// ================================

// Get approved accommodations for students
router.get('/accommodations', async (req, res) => {
  try {
    const { status, adminApproved, visibleToStudents } = req.query;
    
    let filter = {};
    
    // If specific filters are requested
    if (status === 'approved') {
      filter.approvalStatus = 'approved';
    }
    if (adminApproved === 'true') {
      filter.adminApproved = true;
    }
    if (visibleToStudents === 'true') {
      filter.visibleToStudents = true;
    }
    
    // Default filter for students - only show approved, active accommodations
    if (Object.keys(filter).length === 0) {
      filter = {
        approvalStatus: 'approved',
        adminApproved: true,
        visibleToStudents: true,
        isActive: true
      };
    }

    const accommodations = await Accommodation.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      accommodations,
      count: accommodations.length
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approved food providers for students
router.get('/food-providers', async (req, res) => {
  try {
    const { status, adminApproved, visibleToStudents } = req.query;
    
    let filter = {};
    
    // If specific filters are requested
    if (status === 'approved') {
      filter.approvalStatus = 'approved';
    }
    if (adminApproved === 'true') {
      filter.adminApproved = true;
    }
    if (visibleToStudents === 'true') {
      filter.visibleToStudents = true;
    }
    
    // Default filter for students - only show approved, active food providers
    if (Object.keys(filter).length === 0) {
      filter = {
        approvalStatus: 'approved',
        adminApproved: true,
        visibleToStudents: true,
        isActive: true
      };
    }

    const foodProviders = await FoodProvider.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      foodProviders,
      count: foodProviders.length
    });
  } catch (error) {
    console.error('Error fetching food providers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================================
// ADMIN DASHBOARD ROUTES
// ================================

// Get all accommodations for admin (including pending)
router.get('/admin/accommodations', authenticateAdmin, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({})
      .populate('owner', 'name email phone')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: accommodations.length,
      pending: accommodations.filter(acc => acc.approvalStatus === 'pending').length,
      approved: accommodations.filter(acc => acc.approvalStatus === 'approved').length,
      rejected: accommodations.filter(acc => acc.approvalStatus === 'rejected').length,
      active: accommodations.filter(acc => acc.isActive).length
    };

    res.status(200).json({
      accommodations,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin accommodations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all food providers for admin (including pending)
router.get('/admin/food-providers', authenticateAdmin, async (req, res) => {
  try {
    const foodProviders = await FoodProvider.find({})
      .populate('owner', 'name email phone')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: foodProviders.length,
      pending: foodProviders.filter(fp => fp.approvalStatus === 'pending').length,
      approved: foodProviders.filter(fp => fp.approvalStatus === 'approved').length,
      rejected: foodProviders.filter(fp => fp.approvalStatus === 'rejected').length,
      active: foodProviders.filter(fp => fp.isActive).length
    };

    res.status(200).json({
      foodProviders,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin food providers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// ================================
// DATABASE SCHEMA UPDATES
// ================================

/*
Add these fields to your Accommodation and FoodProvider models:

// Add to Accommodation Schema
approvalStatus: {
  type: String,
  enum: ['pending', 'approved', 'rejected'],
  default: 'pending'
},
isActive: {
  type: Boolean,
  default: false
},
adminApproved: {
  type: Boolean,
  default: false
},
visibleToStudents: {
  type: Boolean,
  default: false
},
approvedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
approvedAt: {
  type: Date
},
rejectedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
rejectedAt: {
  type: Date
},
rejectionReason: {
  type: String
}

// Add the same fields to FoodProvider Schema
*/
