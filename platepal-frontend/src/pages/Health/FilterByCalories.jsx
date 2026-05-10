import { useState, useEffect } from 'react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import DishCard from '../../components/DishCard';
import Loading from '../../components/Loading';

export default function FilterByCalories() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calorieRange, setCalorieRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('calories_asc');
  const [searched, setSearched] = useState(false);

  const fetchDishes = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await client.get(`/dishes/search?calories_min=${calorieRange[0]}&calories_max=${calorieRange[1]}`);
      setDishes(data);
    } catch { setDishes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const sorted = [...dishes].sort((a, b) => {
    switch (sortBy) {
      case 'calories_asc': return (a.calories || 0) - (b.calories || 0);
      case 'protein_desc': return (b.protein_g || 0) - (a.protein_g || 0);
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      default: return 0;
    }
  });

  const presets = [
    { label: '<300 cal', min: 0, max: 300, color: 'bg-cal-green/10 text-cal-green border-cal-green/30' },
    { label: '300-400 cal', min: 300, max: 400, color: 'bg-cal-yellow/10 text-cal-yellow border-cal-yellow/30' },
    { label: '400-500 cal', min: 400, max: 500, color: 'bg-cal-red/10 text-cal-red border-cal-red/30' },
    { label: '500+ cal', min: 500, max: 9999, color: 'bg-cal-red/10 text-cal-red border-cal-red/30' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 pt-24 pb-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">
            <span className="material-symbols-outlined text-primary-container align-middle mr-2">local_fire_department</span>
            Filter Dishes by Calories
          </h1>
          <p className="text-sm text-outline font-['Manrope'] mb-6">Find meals that fit your dietary goals.</p>
        </div>

        {/* Filter controls */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => { setCalorieRange([p.min, p.max]); }}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  calorieRange[0] === p.min && calorieRange[1] === p.max
                    ? p.color + ' shadow-sm'
                    : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Range inputs */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Min Calories</label>
              <input
                type="number"
                value={calorieRange[0]}
                onChange={(e) => setCalorieRange([+e.target.value, calorieRange[1]])}
                className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <span className="text-outline mt-4">—</span>
            <div className="flex-1">
              <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Max Calories</label>
              <input
                type="number"
                value={calorieRange[1]}
                onChange={(e) => setCalorieRange([calorieRange[0], +e.target.value])}
                className="w-full h-10 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          <button
            onClick={fetchDishes}
            className="w-full h-11 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            Search Dishes
          </button>
        </div>

        {/* Sort */}
        {dishes.length > 0 && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <p className="text-xs text-outline font-['Manrope']">{dishes.length} dish{dishes.length !== 1 ? 'es' : ''} found</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 bg-white border border-outline-variant/40 rounded-lg text-xs font-['Manrope'] outline-none focus:ring-2 focus:ring-primary-container appearance-none cursor-pointer pr-8"
            >
              <option value="calories_asc">Lowest Calories</option>
              <option value="protein_desc">Highest Protein</option>
              <option value="price_asc">Lowest Price</option>
            </select>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <Loading text="Finding healthy options..." />
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((d, i) => (
              <DishCard key={`${d.dish_id}-${d.restaurant_id || i}`} dish={d} showRestaurant={true} />
            ))}
          </div>
        ) : searched ? (
          <div className="text-center py-20 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search_off</span>
            <p className="font-['Epilogue'] font-semibold text-lg text-on-surface mb-1">No dishes found</p>
            <p className="text-sm text-outline font-['Manrope']">Try widening your calorie range.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
