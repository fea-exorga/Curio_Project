import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import 'dotenv/config';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

describe('Auth Flow: Registration and Login', () => {
  const timestamp = Date.now();
  const testUser = {
    displayName: 'Test Scientist',
    username: `scientist_${timestamp}`,
    email: `scientist_${timestamp}@curio.test`,
    password: 'superSecretPassword123!',
  };

  beforeAll(async () => {
    await connectDB();
    // Clean up in case
    await User.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });
  });

  afterAll(async () => {
    // Clean up created test users
    await User.deleteMany({ email: testUser.email, username: testUser.username });
    await mongoose.connection.close();
  });

  it('fails with 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'missing_fields' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/provide username, display name, email, and password/i);
  });

  it('fails with 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Short Pass',
        username: `shortpass_${timestamp}`,
        email: `shortpass_${timestamp}@curio.test`,
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  it('fails with 400 when username contains invalid characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Invalid User',
        username: `invalid user!`,
        email: `invaliduser_${timestamp}@curio.test`,
        password: 'validPassword123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/letters, numbers, and underscores/i);
  });

  it('successfully registers a new user with 201 and token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe(testUser.username.toLowerCase());
    expect(res.body.user.displayName).toBe(testUser.displayName);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined(); // Safe object does not return password
  });

  it('confirms the user in MongoDB has a hashed password and role "user"', async () => {
    const dbUser = await User.findOne({ username: testUser.username.toLowerCase() }).select('+password');
    expect(dbUser).toBeDefined();
    expect(dbUser.password).not.toBe(testUser.password);
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // Valid bcrypt hash pattern
    expect(dbUser.role).toBe('user');

    // Confirm comparePassword works
    const isMatch = await dbUser.comparePassword(testUser.password);
    expect(isMatch).toBe(true);
  });

  it('returns 409 when attempting to register with duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Another Person',
        username: testUser.username, // duplicate
        email: `different_email_${timestamp}@curio.test`,
        password: 'somePassword123',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Username is already taken/i);
  });

  it('returns 409 when attempting to register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Another Person',
        username: `different_user_${timestamp}`,
        email: testUser.email, // duplicate
        password: 'somePassword123',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email address is already registered/i);
  });

  it('does not allow registration to assign admin role even if requested in body', async () => {
    const adminAttemptUsername = `hacker_admin_${timestamp}`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Hacker',
        username: adminAttemptUsername,
        email: `hacker_${timestamp}@curio.test`,
        password: 'secretPassword123!',
        role: 'admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');

    const dbUser = await User.findOne({ username: adminAttemptUsername });
    expect(dbUser.role).toBe('user');
  });

  it('allows the newly registered user to log in with username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: testUser.username,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(testUser.username.toLowerCase());
  });

  it('allows the newly registered user to log in with email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with an incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: testUser.username,
        password: 'wrongPassword!@#',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Password incorrect|Invalid credentials/i);
  });
});

