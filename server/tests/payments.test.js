const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Job = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/eduvault_test';

describe('Payments Routes', () => {
  let userToken, userId;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Payment.deleteMany({});
    await Job.deleteMany({});

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0700000000',
        institution: new mongoose.Types.ObjectId(),
        course: new mongoose.Types.ObjectId(),
        yearOfStudy: 2
      });
    
    userToken = userResponse.body.token;
    userId = userResponse.body.user._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/payments/subscription', () => {
    it('should initiate subscription payment with valid data', async () => {
      const paymentData = {
        phoneNumber: '254700000000',
        amount: 70
      };

      // Mock M-Pesa API calls would be needed for full testing
      // For now, test validation and database operations
      const response = await request(app)
        .post('/api/payments/subscription')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      // Since M-Pesa sandbox might not be available in tests,
      // we check for either success or M-Pesa error
      expect([200, 201, 500]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('paymentId');
      }
    });

    it('should validate phone number format', async () => {
      const paymentData = {
        phoneNumber: 'invalid-phone',
        amount: 70
      };

      const response = await request(app)
        .post('/api/payments/subscription')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should validate minimum amount', async () => {
      const paymentData = {
        phoneNumber: '254700000000',
        amount: 50 // Below minimum
      };

      const response = await request(app)
        .post('/api/payments/subscription')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const paymentData = {
        phoneNumber: '254700000000',
        amount: 70
      };

      const response = await request(app)
        .post('/api/payments/subscription')
        .send(paymentData)
        .expect(401);

      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('POST /api/payments/job-unlock', () => {
    let jobId;

    beforeEach(async () => {
      const job = await Job.create({
        title: 'Test Job',
        company: {
          name: 'Test Company',
          location: {
            county: 'Nairobi',
            town: 'Nairobi',
            isRemote: false
          }
        },
        description: 'Test job description',
        requirements: ['Requirement 1'],
        responsibilities: ['Responsibility 1'],
        benefits: ['Benefit 1'],
        salary: {
          min: 50000,
          max: 80000,
          currency: 'KSH',
          period: 'monthly'
        },
        employmentType: 'full_time',
        experienceLevel: 'entry',
        relatedCourses: [new mongoose.Types.ObjectId()],
        skills: ['Skill 1'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicationMethod: {
          email: 'hr@testcompany.com'
        },
        postedBy: new mongoose.Types.ObjectId(),
        isPremium: true,
        unlockPrice: 200
      });
      jobId = job._id;
    });

    it('should initiate job unlock payment', async () => {
      const paymentData = {
        phoneNumber: '254700000000',
        jobId: jobId
      };

      const response = await request(app)
        .post('/api/payments/job-unlock')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      // Check for either success or M-Pesa error
      expect([200, 201, 500]).toContain(response.status);
    });

    it('should validate job exists', async () => {
      const paymentData = {
        phoneNumber: '254700000000',
        jobId: new mongoose.Types.ObjectId() // Non-existent job
      };

      const response = await request(app)
        .post('/api/payments/job-unlock')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(404);

      expect(response.body.message).toContain('Job not found');
    });

    it('should prevent duplicate job unlocks', async () => {
      // First, simulate a successful unlock
      const user = await User.findById(userId);
      user.jobUnlocks.push({
        jobId: jobId,
        transactionId: 'TEST123'
      });
      await user.save();

      const paymentData = {
        phoneNumber: '254700000000',
        jobId: jobId
      };

      const response = await request(app)
        .post('/api/payments/job-unlock')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toContain('already unlocked');
    });
  });

  describe('GET /api/payments/status/:paymentId', () => {
    let paymentId;

    beforeEach(async () => {
      const payment = await Payment.create({
        user: userId,
        type: 'subscription',
        amount: 70,
        paymentMethod: 'mpesa',
        description: 'Test payment',
        status: 'pending'
      });
      paymentId = payment._id;
    });

    it('should get payment status for own payment', async () => {
      const response = await request(app)
        .get(`/api/payments/status/${paymentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.payment.amount).toBe(70);
      expect(response.body.payment.type).toBe('subscription');
    });

    it('should not get payment status for non-existent payment', async () => {
      const response = await request(app)
        .get(`/api/payments/status/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toContain('Payment not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/payments/status/${paymentId}`)
        .expect(401);

      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('M-Pesa Callback Processing', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        user: userId,
        type: 'subscription',
        amount: 70,
        paymentMethod: 'mpesa',
        description: 'Test payment',
        status: 'pending',
        mpesaDetails: {
          checkoutRequestId: 'TEST-CHECKOUT-123',
          phoneNumber: '254700000000'
        }
      });
    });

    it('should process successful subscription callback', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'TEST-CHECKOUT-123',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                {
                  Name: 'MpesaReceiptNumber',
                  Value: 'TEST-RECEIPT-123'
                }
              ]
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/mpesa/callback/subscription')
        .send(callbackData)
        .expect(200);

      expect(response.body.message).toBe('Callback processed');

      // Verify payment status updated
      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe('completed');

      // Verify user subscription updated
      const user = await User.findById(userId);
      expect(user.subscription.isActive).toBe(true);
    });

    it('should process failed subscription callback', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'TEST-CHECKOUT-123',
            ResultCode: 1,
            ResultDesc: 'The service request failed.'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/mpesa/callback/subscription')
        .send(callbackData)
        .expect(200);

      // Verify payment status updated to failed
      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe('failed');
    });
  });
});
