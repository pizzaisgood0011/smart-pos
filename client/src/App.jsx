import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Categories from './pages/Categories';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Navbar />
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute adminOnly={true}>
              <Navbar />
              <Products />
            </PrivateRoute>
          } />
          <Route path="/pos" element={
            <PrivateRoute>
              <Navbar />
              <POS />
            </PrivateRoute>
          } />
          <Route path="/categories" element={
            <PrivateRoute adminOnly={true}>
              <Navbar />
              <Categories />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute adminOnly={true}>
              <Navbar />
              <Users />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
