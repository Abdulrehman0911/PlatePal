import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';

function calorieColor(cal) {
  if (cal < 300) return { bg: 'bg-cal-green/10', text: 'text-cal-green', label: 'Low Calorie' };
  if (cal <= 400) return { bg: 'bg-cal-yellow/10', text: 'text-cal-yellow', label: 'Moderate' };
  return { bg: 'bg-cal-red/10', text: 'text-cal-red', label: 'High Calorie' };
}

const categoryImages = {
  'Main Course': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=400&fit=crop',
  'Starters': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&h=400&fit=crop',
  'Dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=400&fit=crop',
  'Drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=400&fit=crop',
  'Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop',
  'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=400&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop',
  'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=400&fit=crop',
  'Vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
};

export default function DishDetail() {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/dishes/${id}`)
      .then(setDish)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><Navbar /><div className="pt-20"><Loading text="Loading dish details..." /></div></>;
  if (!dish) return <><Navbar /><div className="pt-24 text-center"><p className="text-outline">Dish not found.</p></div></>;

  const cal = dish.calories || 0;
  const calInfo = calorieColor(cal);
  const img = categoryImages[dish.category] || categoryImages.default;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero image */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src={img} alt={dish.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${calInfo.bg} ${calInfo.text} mb-2`}>{calInfo.label}</span>
          <h1 className="font-['Epilogue'] font-bold text-3xl text-white">{dish.name}</h1>
          <p className="text-white/80 text-sm mt-1">{dish.category}</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Description */}
        {dish.description && (
          <div className="mb-6 animate-fade-in-up">
            <p className="text-on-surface-variant text-sm leading-relaxed font-['Manrope']">{dish.description}</p>
          </div>
        )}

        {/* Nutrition facts */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-['Epilogue'] font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">nutrition</span>
            Nutrition Facts
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Calories', value: `${cal}`, unit: 'kcal', color: calInfo.text },
              { label: 'Protein', value: dish.protein_g || '—', unit: 'g', color: 'text-primary-container' },
              { label: 'Carbs', value: dish.carbs_g || '—', unit: 'g', color: 'text-secondary' },
              { label: 'Fat', value: dish.fat_g || '—', unit: 'g', color: 'text-tertiary' },
              { label: 'Fiber', value: dish.fiber_g || '—', unit: 'g', color: 'text-cal-green' },
            ].map((n) => (
              <div key={n.label} className="text-center p-3 bg-surface-container rounded-xl">
                <div className={`font-['Epilogue'] font-bold text-xl ${n.color}`}>{n.value}</div>
                <div className="text-[10px] text-outline uppercase tracking-wider mt-1">{n.unit}</div>
                <div className="text-[10px] text-outline mt-0.5">{n.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Where to find */}
        {dish.restaurants && dish.restaurants.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-['Epilogue'] font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">storefront</span>
              Where to Find
            </h2>
            <div className="space-y-3">
              {dish.restaurants.map((r) => (
                <Link
                  key={r.restaurant_id}
                  to={`/restaurant/${r.restaurant_id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors">{r.restaurant_name}</p>
                    <p className="text-xs text-outline">{r.city}</p>
                  </div>
                  <span className="font-['Epilogue'] font-bold text-primary-container">₨{Math.round(r.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
