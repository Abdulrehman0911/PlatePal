import { useNavigate } from 'react-router-dom';

function calorieColor(cal) {
  if (cal < 300) return 'bg-cal-green/10 text-cal-green';
  if (cal <= 400) return 'bg-cal-yellow/10 text-cal-yellow';
  return 'bg-cal-red/10 text-cal-red';
}

export default function DishCard({ dish, showRestaurant = false }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/dish/${dish.dish_id}`)}
      className="group bg-white rounded-xl p-4 shadow-[var(--shadow-card)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-['Epilogue'] font-semibold text-on-surface text-sm leading-snug mb-1 group-hover:text-primary-container transition-colors truncate">
            {dish.name}
          </h4>
          <p className="text-xs text-outline truncate mb-2">{dish.category}</p>
          {showRestaurant && dish.restaurant_name && (
            <p className="text-xs text-primary-container font-medium mb-1">
              <span className="material-symbols-outlined text-xs align-middle mr-0.5">storefront</span>
              {dish.restaurant_name}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {dish.price != null && (
            <span className="font-['Epilogue'] font-bold text-on-surface text-sm">₨{Math.round(dish.price)}</span>
          )}
          {dish.calories != null && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${calorieColor(dish.calories)}`}>
              {dish.calories} cal
            </span>
          )}
        </div>
      </div>

      {/* Macros row */}
      {(dish.protein_g != null || dish.carbs_g != null || dish.fat_g != null) && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-outline-variant/30">
          {dish.protein_g != null && (
            <div className="text-center flex-1">
              <div className="text-[11px] text-outline uppercase tracking-wide">Protein</div>
              <div className="text-xs font-bold text-on-surface">{dish.protein_g}g</div>
            </div>
          )}
          {dish.carbs_g != null && (
            <div className="text-center flex-1">
              <div className="text-[11px] text-outline uppercase tracking-wide">Carbs</div>
              <div className="text-xs font-bold text-on-surface">{dish.carbs_g}g</div>
            </div>
          )}
          {dish.fat_g != null && (
            <div className="text-center flex-1">
              <div className="text-[11px] text-outline uppercase tracking-wide">Fat</div>
              <div className="text-xs font-bold text-on-surface">{dish.fat_g}g</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
