import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import Navbar from '../../components/Navbar';
import DishCard from '../../components/DishCard';
import Loading from '../../components/Loading';

const cuisineImages = {
  Pakistani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&h=400&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&h=400&fit=crop',
  BBQ: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&h=400&fit=crop',
  Continental: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=400&fit=crop',
  Chinese: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=900&h=400&fit=crop',
  Italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=400&fit=crop',
};

export default function RestaurantMenu() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({ items: [], grouped: {} });
  const [reviews, setReviews] = useState({ reviews: [], avgRating: 0, totalReviews: 0, ratingDistribution: {} });
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resData, menuData, revData, favData] = await Promise.all([
          client.get(`/restaurants/${id}`),
          client.get(`/menu/${id}`),
          client.get(`/reviews/restaurant/${id}`),
          client.get(`/favorites/check/${id}`)
        ]);
        setRestaurant(resData);
        setMenu(menuData);
        setReviews(revData);
        setIsFav(favData.is_favorited);
        const cats = Object.keys(menuData.grouped);
        if (cats.length) setActiveTab(cats[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const toggleFav = async () => {
    try {
      if (isFav) {
        await client.delete(`/favorites/${id}`);
        addToast('Removed from favorites', 'info');
      } else {
        await client.post(`/favorites/${id}`);
        addToast('Added to favorites!', 'success');
      }
      setIsFav(!isFav);
    } catch { addToast('Could not update favorite', 'error'); }
  };

  const handlePriceFilter = async () => {
    try {
      const data = await client.get(`/menu/${id}?price_min=${priceRange[0]}&price_max=${priceRange[1]}`);
      setMenu(data);
      const cats = Object.keys(data.grouped);
      if (cats.length) setActiveTab(cats[0]);
    } catch { addToast('Filter failed', 'error'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return addToast('Please select a rating', 'error');
    if (reviewComment && (reviewComment.length < 10 || reviewComment.length > 500)) {
      return addToast('Comment must be 10-500 characters', 'error');
    }
    setReviewLoading(true);
    try {
      if (editingReview) {
        await client.put(`/reviews/${editingReview.review_id}`, { rating: reviewRating, comment: reviewComment });
        addToast('Review updated!', 'success');
      } else {
        await client.post('/reviews', { restaurant_id: parseInt(id), rating: reviewRating, comment: reviewComment });
        addToast('Review posted!', 'success');
      }
      const revData = await client.get(`/reviews/restaurant/${id}`);
      setReviews(revData);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      setEditingReview(null);
    } catch (err) {
      addToast(err?.error || 'Failed to submit review', 'error');
    } finally { setReviewLoading(false); }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await client.delete(`/reviews/${reviewId}`);
      const revData = await client.get(`/reviews/restaurant/${id}`);
      setReviews(revData);
      addToast('Review deleted', 'info');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
    setShowReviewForm(true);
  };

  if (loading) return <><Navbar /><div className="pt-20"><Loading text="Loading restaurant..." /></div></>;
  if (!restaurant) return <><Navbar /><div className="pt-24 text-center"><p className="text-outline">Restaurant not found.</p></div></>;

  const img = cuisineImages[restaurant.cuisine_type] || cuisineImages.default;
  const categories = Object.keys(menu.grouped);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={img} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-['Epilogue'] font-bold text-3xl md:text-4xl mb-2">{restaurant.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">{restaurant.cuisine_type}</span>
                <span className="flex items-center gap-1 text-sm"><span className="material-symbols-outlined text-sm">location_on</span>{restaurant.city}</span>
                {restaurant.phone && <span className="flex items-center gap-1 text-sm"><span className="material-symbols-outlined text-sm">phone</span>{restaurant.phone}</span>}
              </div>
            </div>
            <button
              onClick={toggleFav}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors shrink-0"
            >
              <span className={`material-symbols-outlined text-2xl ${isFav ? 'filled text-red-400' : 'text-white'}`}>favorite</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Rating overview */}
        <div className="flex items-center gap-6 mb-8 p-5 bg-white rounded-2xl shadow-[var(--shadow-card)] animate-fade-in-up">
          <div className="text-center">
            <div className="font-['Epilogue'] font-bold text-4xl text-on-surface">{reviews.avgRating || '—'}</div>
            <div className="flex items-center gap-0.5 my-1">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={`material-symbols-outlined text-lg ${i <= Math.round(reviews.avgRating) ? 'filled text-secondary-container' : 'text-outline-variant'}`}>star</span>
              ))}
            </div>
            <p className="text-xs text-outline">{reviews.totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(s => {
              const count = reviews.ratingDistribution?.[s] || 0;
              const pct = reviews.totalReviews ? (count / reviews.totalReviews * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-outline">{s}</span>
                  <span className="material-symbols-outlined text-xs text-secondary-container filled">star</span>
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-outline">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price filter */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter by Price
            <span className="material-symbols-outlined text-lg">{showPriceFilter ? 'expand_less' : 'expand_more'}</span>
          </button>
          {showPriceFilter && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-outline-variant/30 animate-slide-down">
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
              <button onClick={handlePriceFilter} className="w-full h-10 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
                Apply Filter
              </button>
            </div>
          )}
        </div>

        {/* Menu tabs */}
        <h2 className="font-['Epilogue'] font-bold text-xl text-on-surface mb-4">Menu</h2>
        {categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 mb-5 pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === cat ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-white border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Dishes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {(menu.grouped[activeTab] || []).map(dish => (
            <DishCard key={dish.dish_id} dish={dish} />
          ))}
          {menu.items.length === 0 && (
            <p className="col-span-2 text-center text-outline py-10 font-['Manrope']">No dishes found for this filter.</p>
          )}
        </div>

        {/* Reviews section */}
        <div className="border-t border-outline-variant/30 pt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-['Epilogue'] font-bold text-xl text-on-surface">Reviews</h2>
            <button
              onClick={() => { setShowReviewForm(!showReviewForm); setEditingReview(null); setReviewRating(0); setReviewComment(''); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-lg">rate_review</span>
              Write a Review
            </button>
          </div>

          {/* Review form */}
          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] mb-6 animate-slide-down">
              <p className="text-sm font-semibold text-on-surface mb-3 font-['Epilogue']">{editingReview ? 'Edit Review' : 'Your Review'}</p>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i)}
                    className="p-0.5"
                  >
                    <span className={`material-symbols-outlined text-2xl transition-colors ${i <= reviewRating ? 'filled text-secondary-container' : 'text-outline-variant'}`}>star</span>
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience (10-500 chars)..."
                rows={3}
                className="w-full p-3 bg-surface-container rounded-xl text-sm font-['Manrope'] outline-none focus:ring-2 focus:ring-primary-container resize-none mb-3"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-outline">{reviewComment.length}/500</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-sm text-outline hover:text-on-surface transition-colors">Cancel</button>
                  <button type="submit" disabled={reviewLoading} className="px-5 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition-all">
                    {reviewLoading ? 'Posting...' : editingReview ? 'Update' : 'Post Review'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.reviews.length === 0 ? (
              <p className="text-center text-outline py-8 font-['Manrope']">No reviews yet. Be the first!</p>
            ) : reviews.reviews.map(rev => (
              <div key={rev.review_id} className="bg-white rounded-xl p-4 shadow-[var(--shadow-card)] animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-container text-on-surface font-['Epilogue'] font-bold text-sm flex items-center justify-center">
                      {rev.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{rev.user_name}</p>
                      <p className="text-[11px] text-outline">{new Date(rev.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`material-symbols-outlined text-sm ${i <= rev.rating ? 'filled text-secondary-container' : 'text-outline-variant'}`}>star</span>
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-sm text-on-surface-variant font-['Manrope'] mt-2">{rev.comment}</p>}
                {rev.user_id === user?.user_id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant/20">
                    <button onClick={() => startEdit(rev)} className="text-xs text-primary-container hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">edit</span>Edit
                    </button>
                    <button onClick={() => deleteReview(rev.review_id)} className="text-xs text-error hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">delete</span>Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
