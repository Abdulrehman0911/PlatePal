import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Protected pages
import HomeScreen from './pages/Home/HomeScreen';
import SearchResults from './pages/Search/SearchResults';
import RestaurantMenu from './pages/Restaurant/RestaurantMenu';
import DishDetail from './pages/Dish/DishDetail';
import FilterByPrice from './pages/Dish/FilterByPrice';
import RestaurantReviews from './pages/Reviews/RestaurantReviews';
import FavoritesScreen from './pages/Favorites/FavoritesScreen';
import LogHealth from './pages/Health/LogHealth';
import HealthHistory from './pages/Health/HealthHistory';
import FilterByCalories from './pages/Health/FilterByCalories';
import UserProfile from './pages/Profile/UserProfile';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantMenu /></ProtectedRoute>} />
            <Route path="/dish/:id" element={<ProtectedRoute><DishDetail /></ProtectedRoute>} />
            <Route path="/filter-price" element={<ProtectedRoute><FilterByPrice /></ProtectedRoute>} />
            <Route path="/reviews/:restaurantId" element={<ProtectedRoute><RestaurantReviews /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesScreen /></ProtectedRoute>} />
            <Route path="/log-health" element={<ProtectedRoute><LogHealth /></ProtectedRoute>} />
            <Route path="/health-history" element={<ProtectedRoute><HealthHistory /></ProtectedRoute>} />
            <Route path="/filter-calories" element={<ProtectedRoute><FilterByCalories /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
