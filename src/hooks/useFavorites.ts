import { useState, useEffect } from 'react';

interface FavoritesData {
  topics: string[];
  companies: string[];
  problems: string[];
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesData>({
    topics: [],
    companies: [],
    problems: []
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dsa-favorites');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dsa-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (type: keyof FavoritesData, id: string) => {
    setFavorites(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  };

  const removeFromFavorites = (type: keyof FavoritesData, id: string) => {
    setFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== id)
    }));
  };

  const isFavorite = (type: keyof FavoritesData, id: string) => {
    return favorites[type].includes(id);
  };

  const toggleFavorite = (type: keyof FavoritesData, id: string) => {
    if (isFavorite(type, id)) {
      removeFromFavorites(type, id);
    } else {
      addToFavorites(type, id);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};