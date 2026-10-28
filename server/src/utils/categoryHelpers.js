import { CATEGORIES } from '../config/categories.js';
import { Category } from '../models/Category.js';

export const getAllCategoryNames = async () => {
  const custom = await Category.find().sort({ name: 1 }).select('name').lean();
  return [...new Set([...CATEGORIES, ...custom.map((category) => category.name)])];
};

export const isCategoryName = async (name) => {
  if (typeof name !== 'string') return false;
  if (CATEGORIES.includes(name)) return true;
  return !!(await Category.exists({ key: name.trim().toLowerCase() }));
};

export const getCanonicalCategoryName = async (name) => {
  if (typeof name !== 'string') return null;
  const builtIn = CATEGORIES.find((category) => category.toLowerCase() === name.trim().toLowerCase());
  if (builtIn) return builtIn;
  const custom = await Category.findOne({ key: name.trim().toLowerCase() }).select('name').lean();
  return custom?.name || null;
};
