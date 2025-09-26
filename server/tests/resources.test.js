const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Course = require('../models/Course');
const Resource = require('../models/Resource');

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/eduvault_test';

describe('Resources Routes', () => {
  let adminToken, studentToken, institution, course;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Institution.deleteMany({});
    await Course.deleteMany({});
    await Resource.deleteMany({});

    // Create test institution
    institution = await Institution.create({
      name: 'Test University',
      shortName: 'TU',
      type: 'university',
      location: {
        county: 'Nairobi',
        town: 'Nairobi'
      }
    });

    // Create test course
    course = await Course.create({
      name: 'Computer Science',
      code: 'CS',
      institution: institution._id,
      department: 'Computing',
      duration: { years: 4, semesters: 8 }
    });

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '0700000001',
        role: 'mini_admin'
      });
    adminToken = adminResponse.body.token;

    // Create student user
    const studentResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Student',
        lastName: 'User',
        phoneNumber: '0700000002',
        institution: institution._id,
        course: course._id,
        yearOfStudy: 2
      });
    studentToken = studentResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/resources', () => {
    beforeEach(async () => {
      await Resource.create({
        title: 'Test Resource',
        type: 'notes',
        institution: institution._id,
        course: course._id,
        unitCode: 'CS101',
        unitName: 'Introduction to Computing',
        year: 1,
        semester: 1,
        uploadedBy: new mongoose.Types.ObjectId(),
        approvalStatus: 'approved'
      });
    });

    it('should get all approved resources', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(200);

      expect(response.body.resources).toHaveLength(1);
      expect(response.body.resources[0].title).toBe('Test Resource');
    });

    it('should filter resources by institution', async () => {
      const response = await request(app)
        .get(`/api/resources?institution=${institution._id}`)
        .expect(200);

      expect(response.body.resources).toHaveLength(1);
    });

    it('should filter resources by year and semester', async () => {
      const response = await request(app)
        .get('/api/resources?year=1&semester=1')
        .expect(200);

      expect(response.body.resources).toHaveLength(1);
    });
  });

  describe('POST /api/resources', () => {
    it('should allow admin to upload resource', async () => {
      const resourceData = {
        title: 'New Resource',
        type: 'lecture_video',
        institution: institution._id,
        course: course._id,
        unitCode: 'CS102',
        unitName: 'Programming Fundamentals',
        year: 1,
        semester: 2,
        description: 'Test resource description'
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resourceData)
        .expect(201);

      expect(response.body.resource.title).toBe(resourceData.title);
      expect(response.body.resource.approvalStatus).toBe('pending');
    });

    it('should not allow student to upload resource', async () => {
      const resourceData = {
        title: 'New Resource',
        type: 'lecture_video',
        institution: institution._id,
        course: course._id,
        unitCode: 'CS102',
        unitName: 'Programming Fundamentals',
        year: 1,
        semester: 2
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(resourceData)
        .expect(403);

      expect(response.body.message).toContain('Access denied');
    });

    it('should validate required fields', async () => {
      const resourceData = {
        title: 'New Resource'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resourceData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/resources/:id/approve', () => {
    let resourceId;

    beforeEach(async () => {
      const resource = await Resource.create({
        title: 'Pending Resource',
        type: 'notes',
        institution: institution._id,
        course: course._id,
        unitCode: 'CS101',
        unitName: 'Introduction to Computing',
        year: 1,
        semester: 1,
        uploadedBy: new mongoose.Types.ObjectId(),
        approvalStatus: 'pending'
      });
      resourceId = resource._id;
    });

    it('should allow admin to approve resource', async () => {
      const response = await request(app)
        .put(`/api/resources/${resourceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.resource.approvalStatus).toBe('approved');
    });

    it('should not allow student to approve resource', async () => {
      const response = await request(app)
        .put(`/api/resources/${resourceId}/approve`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/resources/verify/:stampId', () => {
    let stampId;

    beforeEach(async () => {
      const resource = await Resource.create({
        title: 'Verified Resource',
        type: 'notes',
        institution: institution._id,
        course: course._id,
        unitCode: 'CS101',
        unitName: 'Introduction to Computing',
        year: 1,
        semester: 1,
        uploadedBy: new mongoose.Types.ObjectId(),
        approvalStatus: 'approved',
        isPremium: true,
        legitimacyStamp: {
          isVerified: true,
          stampId: 'EV-TEST-123',
          verifiedAt: new Date()
        }
      });
      stampId = resource.legitimacyStamp.stampId;
    });

    it('should verify valid stamp ID', async () => {
      const response = await request(app)
        .get(`/api/resources/verify/${stampId}`)
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.resource.title).toBe('Verified Resource');
    });

    it('should reject invalid stamp ID', async () => {
      const response = await request(app)
        .get('/api/resources/verify/INVALID-STAMP')
        .expect(404);

      expect(response.body.isValid).toBe(false);
    });
  });
});
