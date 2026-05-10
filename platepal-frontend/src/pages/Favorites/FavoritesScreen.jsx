import { useState, useEffect } from 'react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import RestaurantCard from '../../components/RestaurantCard';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function FavoritesScreen() {
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [cuisineFilter, setCuisineFilter] = useState('All');

  useEffect(() => {
    client.get('/favorites')
      .then(setFavorites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFavoriteToggle = (id, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((f) => f.restaurant_id !== id));
      addToast('Removed from favorites', 'info');
    }
  };

  const cuisines = ['All', ...new Set(favorites.map((f) => f.cuisine_type))];

  let filtered = cuisineFilter === 'All' ? favorites : favorites.filter((f) => f.cuisine_type === cuisineFilter);

  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 pt-24 pb-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">My Favorites</h1>
          <p className="text-sm text-outline font-['Manrope'] mb-6">Your saved restaurants at a glance.</p>
        </div>

        {!loading && favorites.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 bg-white border border-outline-variant/40 rounded-xl text-sm font-['Manrope'] outline-none focus:ring-2 focus:ring-primary-container appearance-none cursor-pointer pr-8"
            >
              <option value="recent">Recently Saved</option>
              <option value="rating">Top Rated</option>
              <option value="name">A-Z</option>
            </select>

            {/* Cuisine filter */}
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisineFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    cuisineFilter === c
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-white border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <Loading text="Loading favorites..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">favorite_border</span>
            <p className="font-['Epilogue'] font-semibold text-lg text-on-surface mb-1">
              {favorites.length === 0 ? 'No favorites yet' : 'No matches'}
            </p>
            <p className="text-sm text-outline font-['Manrope']">
              {favorites.length === 0
                ? 'Tap the heart icon on any restaurant to save it here.'
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.restaurant_id}
                restaurant={r}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
