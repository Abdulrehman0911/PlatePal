import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import RestaurantCard from '../../components/RestaurantCard';
import Loading from '../../components/Loading';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resData, favData] = await Promise.all([
          client.get('/restaurants'),
          client.get('/favorites')
        ]);
        setRestaurants(resData);
        setFavorites(new Set(favData.map((f) => f.restaurant_id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFavoriteToggle = (id, isFav) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const totalPages = Math.ceil(restaurants.length / perPage);
  const visible = restaurants.slice((page - 1) * perPage, page * perPage);

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 pt-24 pb-12">
        {/* Greeting + Search */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-3xl md:text-4xl text-on-surface mb-1">
            {greetingTime()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-outline text-sm font-['Manrope'] mb-6">
            Discover restaurants, track nutrition, and live healthier.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              className="w-full h-14 pl-12 pr-14 bg-white border border-outline-variant/40 rounded-2xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none shadow-sm transition-all"
              id="home-search"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-container text-on-primary rounded-xl flex items-center justify-center hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button onClick={() => navigate('/filter-calories')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-all">
            <span className="material-symbols-outlined text-lg">local_fire_department</span>
            Filter by Calories
          </button>
          <button onClick={() => navigate('/filter-price')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-all">
            <span className="material-symbols-outlined text-lg">payments</span>
            Filter by Price
          </button>
          <button onClick={() => navigate('/log-health')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-all">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Log Health
          </button>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['Epilogue'] font-bold text-xl text-on-surface">All Restaurants</h2>
          <span className="text-xs text-outline font-['Manrope']">{restaurants.length} places</span>
        </div>

        {/* Grid */}
        {loading ? (
          <Loading text="Loading restaurants..." />
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">restaurant</span>
            <p className="text-outline font-['Manrope']">No restaurants found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((r, i) => (
                <div key={r.restaurant_id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <RestaurantCard
                    restaurant={r}
                    isFavorited={favorites.has(r.restaurant_id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      page === p
                        ? 'bg-primary-container text-on-primary shadow-sm'
                        : 'border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
