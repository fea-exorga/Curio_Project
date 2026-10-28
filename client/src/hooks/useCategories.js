import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/index.js';
import { CATEGORIES } from '../utils/index.js';

export const useCategories = () => {
  const [categories, setCategories] = useState(CATEGORIES);
  const refreshCategories = useCallback(async () => {
    try { setCategories(await categoryService.getCategories()); }
    catch { /* Keep the bundled defaults available if the API is offline. */ }
  }, []);

  useEffect(() => { refreshCategories(); }, [refreshCategories]);
  return { categories, setCategories, refreshCategories };
};
