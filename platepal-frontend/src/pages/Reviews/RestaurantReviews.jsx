import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// This page redirects to the restaurant page which has reviews integrated
export default function RestaurantReviews() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/restaurant/${restaurantId}`, { replace: true });
  }, [restaurantId, navigate]);

  return null;
}
