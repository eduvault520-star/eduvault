const express = require('express');
const Subscription = require('../models/Subscription');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

console.log('🔍 Loading M-Pesa service...');
const mpesaService = require('../services/mpesaService');
console.log('✅ M-Pesa service loaded successfully');

const router = express.Router();

// @route   GET /api/subscription/test
// @desc    Test M-Pesa service initialization
// @access  Public (for testing)
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing M-Pesa service...');
    
    // Test access token generation
    const accessToken = await mpesaService.getAccessToken();
    
    // Test phone number formatting
    const testPhone = '254708374149';
    const formattedPhone = mpesaService.formatPhoneNumber(testPhone);
    
    res.json({
      message: 'M-Pesa service test successful',
      originalPhone: testPhone,
      formattedPhone: formattedPhone,
      serviceConfig: {
        baseURL: mpesaService.baseURL,
        shortcode: mpesaService.businessShortCode
      },
      accessTokenGenerated: !!accessToken,
      accessTokenLength: accessToken ? accessToken.length : 0
    });
  } catch (error) {
    console.error('❌ M-Pesa service test failed:', error);
    res.status(500).json({
      message: 'M-Pesa service test failed',
      error: error.message
    });
  }
});

// @route   POST /api/subscription/simulate-payment/:subscriptionId
// @desc    Simulate successful payment for development testing
// @access  Public (for development only)
router.post('/simulate-payment/:subscriptionId', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Only available in development mode' });
    }

    const { subscriptionId } = req.params;
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Simulate successful payment
    subscription.status = 'completed';
    subscription.isActive = true;
    subscription.paymentDate = new Date();
    subscription.mpesaReceiptNumber = `MOCK${Date.now()}`;
    
    await subscription.save();

    console.log('🧪 Simulated successful payment for subscription:', subscriptionId);

    res.json({
      message: 'Payment simulation successful',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        isActive: subscription.isActive
      }
    });

  } catch (error) {
    console.error('❌ Payment simulation error:', error);
    res.status(500).json({ message: 'Simulation failed' });
  }
});

// @route   POST /api/subscription/initiate
// @desc    Initiate premium subscription payment
// @access  Private (Students)
router.post('/initiate', auth, async (req, res) => {
  try {
    console.log('📱 Subscription initiation request received');
    console.log('📱 Request body:', req.body);
    console.log('📱 User from auth:', req.user);
    
    const { courseId, year, phoneNumber } = req.body;
    const userId = req.user?.id;

    console.log('📱 Extracted data:', { courseId, year, phoneNumber, userId });

    // Validate input
    if (!courseId || !year || !phoneNumber) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'Course ID, year, and phone number are required' 
      });
    }

    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    console.log('📱 Checking if course exists...');
    // Check if course exists
    const course = await Course.findById(courseId).populate('institution', 'name');
    console.log('📱 Course found:', course ? 'Yes' : 'No');
    if (!course) {
      console.log('❌ Course not found for ID:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('📱 Checking for existing subscription...');
    // Check if user already has active subscription for this course/year
    try {
      const existingSubscription = await Subscription.hasActiveSubscription(userId, courseId, year);
      console.log('📱 Existing subscription:', existingSubscription ? 'Yes' : 'No');
      if (existingSubscription) {
        console.log('❌ User already has active subscription');
        return res.status(400).json({ 
          message: 'You already have an active subscription for this course and year' 
        });
      }
    } catch (subscriptionCheckError) {
      console.error('❌ Error checking existing subscription:', subscriptionCheckError);
      // Continue anyway for now
    }

    console.log('📱 Getting user details...');
    // Get user details
    const user = await User.findById(userId).select('name email');
    console.log('📱 User found:', user ? 'Yes' : 'No');

    console.log('📱 Creating subscription record...');
    // Create subscription record
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    const subscription = new Subscription({
      userId,
      courseId,
      year,
      phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
      amount: 100,
      currency: 'KSH',
      paymentMethod: 'mpesa',
      status: 'pending',
      startDate,
      expiryDate,
      metadata: {
        courseName: course.name,
        institutionName: course.institution?.name,
        userEmail: user?.email,
        userName: user?.name
      }
    });

    console.log('📱 Saving subscription to database...');
    await subscription.save();
    console.log('✅ Subscription saved with ID:', subscription._id);

    console.log('📱 Initiating M-Pesa STK Push...');
    // Initiate M-Pesa STK Push
    const accountReference = `EDU-${subscription._id}`;
    const transactionDesc = `EduVault Premium - ${course.name} Year ${year}`;
    
    let mpesaResponse = null;
    
    try {
      mpesaResponse = await mpesaService.initiateSTKPush(
        phoneNumber,
        100,
        accountReference,
        transactionDesc
      );

      console.log('✅ M-Pesa response received:', mpesaResponse);

      // Store checkout request ID for tracking
      subscription.mpesaTransactionId = mpesaResponse.CheckoutRequestID;
      await subscription.save();
      console.log('✅ Subscription updated with M-Pesa transaction ID');
      
    } catch (mpesaError) {
      console.error('❌ M-Pesa STK Push failed:', mpesaError.message);
      
      // Update subscription status to failed
      subscription.status = 'failed';
      subscription.failureReason = mpesaError.message;
      await subscription.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate M-Pesa payment. Please try again.',
        error: mpesaError.message
      });
    }

    res.json({
      message: 'Payment initiated successfully',
      subscription: {
        id: subscription._id,
        amount: subscription.amount,
        currency: subscription.currency,
        courseId: subscription.courseId,
        year: subscription.year,
        expiryDate: subscription.expiryDate
      },
      payment: mpesaResponse
    });

  } catch (error) {
    console.error('❌ Subscription initiation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error initiating subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/subscription/callback
// @desc    M-Pesa payment callback
// @access  Public (M-Pesa callback)
router.post('/callback', async (req, res) => {
  try {
    console.log('📱 M-Pesa callback received:', JSON.stringify(req.body, null, 2));

    // Validate and extract callback data
    const transactionData = mpesaService.validateCallback(req.body);
    
    // Find subscription by checkout request ID
    const subscription = await Subscription.findOne({
      mpesaTransactionId: transactionData.CheckoutRequestID,
      status: 'pending'
    });

    if (!subscription) {
      console.log('❌ Subscription not found for CheckoutRequestID:', transactionData.CheckoutRequestID);
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (transactionData.success) {
      // Payment successful
      subscription.status = 'completed';
      subscription.isActive = true;
      subscription.paymentDate = new Date();
      subscription.mpesaReceiptNumber = transactionData.MpesaReceiptNumber;
      
      await subscription.save();

      console.log('✅ Subscription activated:', subscription._id);
      console.log('💰 Payment details:', {
        amount: transactionData.Amount,
        receipt: transactionData.MpesaReceiptNumber,
        phone: transactionData.PhoneNumber
      });
    } else {
      // Payment failed
      subscription.status = 'failed';
      await subscription.save();

      console.log('❌ Payment failed for subscription:', subscription._id);
      console.log('❌ Failure reason:', transactionData.ResultDesc);
    }

    // Always respond with success to M-Pesa
    res.json({ 
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully' 
    });

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    // Still respond with success to avoid M-Pesa retries
    res.json({ 
      ResultCode: 0,
      ResultDesc: 'Callback received' 
    });
  }
});

// @route   GET /api/subscription/status/:subscriptionId
// @desc    Check subscription payment status
// @access  Private (Students)
router.get('/status/:subscriptionId', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId
    }).populate('courseId', 'name code');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({
      subscription: {
        id: subscription._id,
        status: subscription.status,
        isActive: subscription.isCurrentlyActive,
        amount: subscription.amount,
        currency: subscription.currency,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        paymentDate: subscription.paymentDate,
        course: subscription.courseId,
        year: subscription.year,
        features: subscription.features
      }
    });

  } catch (error) {
    console.error('❌ Subscription status error:', error);
    res.status(500).json({ message: 'Server error checking subscription status' });
  }
});

// @route   GET /api/subscription/my-subscriptions
// @desc    Get user's active subscriptions
// @access  Private (Students)
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.find({
      userId,
      isActive: true,
      status: 'completed',
      expiryDate: { $gt: new Date() }
    }).populate('courseId', 'name code institution')
      .populate('courseId.institution', 'name')
      .sort({ createdAt: -1 });

    res.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub._id,
        course: sub.courseId,
        year: sub.year,
        amount: sub.amount,
        currency: sub.currency,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        features: sub.features,
        daysRemaining: Math.ceil((sub.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      }))
    });

  } catch (error) {
    console.error('❌ Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
});

// @route   GET /api/subscription/check/:courseId/:year
// @desc    Check if user has active subscription for specific course/year
// @access  Private (Students)
router.get('/check/:courseId/:year', auth, async (req, res) => {
  try {
    const { courseId, year } = req.params;
    const userId = req.user.id;

    const hasSubscription = await Subscription.hasActiveSubscription(userId, courseId, parseInt(year));
    const subscription = hasSubscription ? 
      await Subscription.getUserSubscription(userId, courseId, parseInt(year)) : null;

    res.json({
      hasSubscription,
      subscription: subscription ? {
        id: subscription._id,
        expiryDate: subscription.expiryDate,
        features: subscription.features,
        daysRemaining: Math.ceil((subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      } : null
    });

  } catch (error) {
    console.error('❌ Check subscription error:', error);
    res.status(500).json({ message: 'Server error checking subscription' });
  }
});

// @route   GET /api/subscription/query/:subscriptionId
// @desc    Query M-Pesa payment status directly
// @access  Private (Students)
router.get('/query/:subscriptionId', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (!subscription.mpesaTransactionId) {
      return res.status(400).json({ message: 'No M-Pesa transaction ID found' });
    }

    // Query M-Pesa for current status
    const mpesaStatus = await mpesaService.querySTKPushStatus(subscription.mpesaTransactionId);
    
    // Update subscription based on M-Pesa response
    if (mpesaStatus.ResultCode === '0') {
      subscription.status = 'completed';
      subscription.isActive = true;
      subscription.paymentDate = new Date();
      await subscription.save();
    } else if (mpesaStatus.ResultCode !== '1032') { // 1032 means still pending
      subscription.status = 'failed';
      await subscription.save();
    }

    res.json({
      subscription: {
        id: subscription._id,
        status: subscription.status,
        isActive: subscription.isCurrentlyActive
      },
      mpesaStatus
    });

  } catch (error) {
    console.error('❌ M-Pesa query error:', error);
    res.status(500).json({ message: 'Server error querying payment status' });
  }
});

module.exports = router;
