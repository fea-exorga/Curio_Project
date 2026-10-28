/**
 * Curio – Make Admin Utility
 * ──────────────────────────
 * Promotes an existing user account to admin role.
 *
 * Usage:
 *   node src/utils/makeAdmin.js <username>
 *
 * OR set the env var ADMIN_USERNAME and run:
 *   ADMIN_USERNAME=myuser node src/utils/makeAdmin.js
 *
 * NEVER hardcode a production admin password.
 * This script must only be run in a trusted environment.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const makeAdmin = async () => {
  const targetUsername = process.argv[2] || process.env.ADMIN_USERNAME;

  if (!targetUsername) {
    console.error('❌ Usage: node src/utils/makeAdmin.js <username>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curio');
  console.log('[makeAdmin] Connected to MongoDB');

  const user = await User.findOne({ username: targetUsername.toLowerCase() });

  if (!user) {
    console.error(`❌ User "${targetUsername}" not found. Please register first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`ℹ️  User "${targetUsername}" is already an admin.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  user.role = 'admin';
  await user.save();

  console.log(`✅ Successfully promoted "${user.username}" (${user.email}) to admin role.`);
  await mongoose.disconnect();
  process.exit(0);
};

makeAdmin().catch((err) => {
  console.error('Fatal error in makeAdmin:', err.message);
  process.exit(1);
});
