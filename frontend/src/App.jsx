import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import Learning from './pages/Learning';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import BookForm from './pages/admin/BookForm';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageLearning from './pages/admin/ManageLearning';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* public */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="books" element={<Books />} />
        <Route path="books/:id" element={<BookDetails />} />

        {/* any signed-in user */}
        <Route element={<ProtectedRoute roles={['USER', 'ADMIN']} />}>
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* customers only */}
        <Route element={<ProtectedRoute roles={['USER']} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learning" element={<Learning />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* admins only */}
      <Route path="admin" element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="books/new" element={<BookForm />} />
          <Route path="books/:id/edit" element={<BookForm />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="learning" element={<ManageLearning />} />
        </Route>
      </Route>
    </Routes>
  );
}
