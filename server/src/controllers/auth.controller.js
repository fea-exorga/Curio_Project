import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isCategoryName } from '../utils/categoryHelpers.js';
import { getJwtSecret } from '../config/security.js';

const generateToken = (userId) => {
  const secret = getJwtSecret();
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject ? user.toSafeObject() : user,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, displayName, email, password, interests } = req.body;

    if (
      !username ||
      !displayName ||
      !email ||
      !password ||
      typeof username !== 'string' ||
      typeof displayName !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !displayName.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, display name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (interests !== undefined) {
      if (!Array.isArray(interests) || interests.length > 30 || !interests.every((item) => typeof item === 'string')) return res.status(400).json({ success: false, message: 'Choose valid interests.' });
      for (const item of interests) if (!(await isCategoryName(item))) return res.status(400).json({ success: false, message: `Unknown interest category: ${item}` });
    }

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({ success: false, message: 'Email address is already registered.' });
      }
      return res.status(409).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const user = await User.create({
      username: cleanUsername,
      displayName: displayName.trim(),
      email: cleanEmail,
      password,
      interests: Array.isArray(interests) ? interests : [],
      role: 'user', // strictly default to user
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { login, password } = req.body; // Can be email or username

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your username/email and password.',
      });
    }

    const cleanLogin = login.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: cleanLogin }, { username: cleanLogin }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout current user / clear cookie
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interests (onboarding or settings)
// @route   PUT /api/auth/interests
export const updateInterests = async (req, res, next) => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests)) {
      return res.status(400).json({ success: false, message: 'Interests must be an array of category names.' });
    }
    if (interests.length > 30 || !interests.every((item) => typeof item === 'string')) return res.status(400).json({ success: false, message: 'Choose valid interests.' });
    for (const item of interests) if (!(await isCategoryName(item))) return res.status(400).json({ success: false, message: `Unknown interest category: ${item}` });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Interests updated successfully.',
      interests: user.interests,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
