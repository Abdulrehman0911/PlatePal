import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import RestaurantCard from '../../components/RestaurantCard';
import Loading from '../../components/Loading';

const cuisines = ['All', 'Pakistani', 'Fast Food', 'BBQ', 'Continental', 'Chinese', 'Italian', 'Thai', 'American', 'Pathan'];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState('All');

  const search = useCallback(async (q, cuisine) => {
    setLoading(true);
    try {
      let data;
      if (cuisine && cuisine !== 'All') {
        data = await client.get(`/restaurants/cuisine/${cuisine}`);
        if (q.trim()) data = data.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
      } else if (q.trim()) {
        data = await client.get(`/restaurants/search?query=${encodeURIComponent(q)}`);
      } else {
        data = await client.get('/restaurants');
      }
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    client.get('/favorites').then((d) => setFavorites(new Set(d.map((f) => f.restaurant_id)))).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query, activeCuisine);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeCuisine, search]);

  const handleFavoriteToggle = (id, isFav) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.add(id) : next.delete(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 pt-24 pb-12">
        {/* Search */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-4">Search Restaurants</h1>
          <div className="relative max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
              placeholder="Search by name or cuisine..."
              className="w-full h-14 pl-12 pr-12 bg-white border border-outline-variant/40 rounded-2xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none shadow-sm transition-all"
              autoFocus
              id="search-input"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchParams({}); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Cuisine pills */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCuisine(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCuisine === c
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-white border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <Loading text="Searching..." />
        ) : results.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search_off</span>
            <p className="text-lg font-['Epilogue'] font-semibold text-on-surface mb-1">No results found</p>
            <p className="text-sm text-outline font-['Manrope']">Try different keywords or cuisine filters</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-outline mb-4 font-['Manrope']">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((r) => (
                <RestaurantCard
                  key={r.restaurant_id}
                  restaurant={r}
                  isFavorited={favorites.has(r.restaurant_id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
