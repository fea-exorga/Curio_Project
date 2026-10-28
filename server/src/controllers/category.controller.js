import { Category } from '../models/Category.js';
import { getAllCategoryNames } from '../utils/categoryHelpers.js';

export const getCategories = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, categories: await getAllCategoryNames() });
  } catch (error) { next(error); }
};

export const createCategory = async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
    if (name.length < 2 || name.length > 40 || !/^[\p{L}\p{N}][\p{L}\p{N}\s&+'().-]*$/u.test(name)) {
      return res.status(400).json({ success: false, message: 'Use 2–40 characters: letters, numbers, spaces, and simple punctuation.' });
    }
    const key = name.toLowerCase();
    const existingNames = await getAllCategoryNames();
    if (existingNames.some((item) => item.toLowerCase() === key)) {
      return res.status(409).json({ success: false, message: 'That category already exists.' });
    }
    const category = await Category.create({ name, key, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Category created.', category: category.name, categories: await getAllCategoryNames() });
  } catch (error) { next(error); }
};
