import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useToast } from './Toast';

const cuisineImages = {
  Pakistani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=250&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  BBQ: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=250&fit=crop',
  Continental: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
  Chinese: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=250&fit=crop',
  Italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=250&fit=crop',
  American: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=250&fit=crop',
  Pathan: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&h=250&fit=crop',
  default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
};

export default function RestaurantCard({ restaurant, isFavorited, onFavoriteToggle }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [fav, setFav] = useState(isFavorited);
  const [heartAnim, setHeartAnim] = useState(false);

  const img = cuisineImages[restaurant.cuisine_type] || cuisineImages.default;
  const rating = restaurant.avg_rating || 0;
  const stars = Math.round(rating);

  const handleFavClick = async (e) => {
    e.stopPropagation();
    try {
      if (fav) {
        await client.delete(`/favorites/${restaurant.restaurant_id}`);
        addToast('Removed from favorites', 'info');
      } else {
        await client.post(`/favorites/${restaurant.restaurant_id}`);
        addToast('Added to favorites!', 'success');
      }
      setFav(!fav);
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 400);
      onFavoriteToggle?.(restaurant.restaurant_id, !fav);
    } catch {
      addToast('Could not update favorites', 'error');
    }
  };

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant.restaurant_id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Cuisine badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold font-['Manrope'] text-primary-container rounded-full uppercase tracking-wider">
          {restaurant.cuisine_type}
        </span>

        {/* Favorite heart */}
        <button
          onClick={handleFavClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all ${heartAnim ? 'animate-heart' : ''}`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className={`material-symbols-outlined text-xl ${fav ? 'filled text-error' : 'text-outline'}`}>favorite</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-['Epilogue'] font-semibold text-on-surface text-base leading-snug mb-1 group-hover:text-primary-container transition-colors">
          {restaurant.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-sm ${i <= stars ? 'filled text-secondary-container' : 'text-outline-variant'}`}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-on-surface">{rating || '—'}</span>
          <span className="text-xs text-outline">({restaurant.review_count || 0})</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-outline">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {restaurant.city}
        </div>
      </div>
    </div>
  );
}
