import { useState, useEffect } from 'react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import DishCard from '../../components/DishCard';
import Loading from '../../components/Loading';

export default function FilterByPrice() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([300, 1500]);

  useEffect(() => {
    client.get('/restaurants').then(setRestaurants).catch(console.error);
  }, []);

  const fetchDishes = async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const data = await client.get(`/menu/${selectedRestaurant}?price_min=${priceRange[0]}&price_max=${priceRange[1]}`);
      setDishes(data.items || []);
    } catch { setDishes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedRestaurant) fetchDishes();
  }, [selectedRestaurant]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 pt-24 pb-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-2">Filter Dishes by Price</h1>
          <p className="text-sm text-outline font-['Manrope'] mb-6">Find dishes within your budget.</p>
        </div>

        {/* Restaurant selector */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <label className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 block font-['Manrope']">Select Restaurant</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full h-12 px-4 bg-surface-container rounded-xl text-sm font-['Manrope'] outline-none focus:ring-2 focus:ring-primary-container appearance-none cursor-pointer"
          >
            <option value="">Choose a restaurant...</option>
            {restaurants.map(r => (
              <option key={r.restaurant_id} value={r.restaurant_id}>{r.name} — {r.city}</option>
            ))}
          </select>

          {selectedRestaurant && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Min ₨</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <span className="text-outline mt-4">—</span>
                <div className="flex-1">
                  <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Max ₨</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[[0,500],[500,800],[800,1200],[1200,5000]].map(([min,max]) => (
                  <button
                    key={`${min}-${max}`}
                    onClick={() => setPriceRange([min, max])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      priceRange[0] === min && priceRange[1] === max
                        ? 'bg-primary-container text-on-primary border-primary-container'
                        : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {max >= 5000 ? `₨${min}+` : `₨${min}–${max}`}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchDishes}
                className="w-full h-11 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
              >
                Apply Price Filter
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <Loading text="Filtering dishes..." />
        ) : dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dishes.map(d => <DishCard key={d.dish_id} dish={d} />)}
          </div>
        ) : selectedRestaurant ? (
          <div className="text-center py-16 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">search_off</span>
            <p className="text-outline font-['Manrope']">No dishes in this price range.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
