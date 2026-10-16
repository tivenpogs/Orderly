import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Favorites from './pages/Favorites.jsx';
import Offers from './pages/Offers.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import AdminRestaurants from './pages/AdminRestaurants.jsx';
import AdminMenu from './pages/AdminMenu.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<AdminRestaurants />} />
          <Route path="/admin/restaurants/:id" element={<AdminMenu />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
