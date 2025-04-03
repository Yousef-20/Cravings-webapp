import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './components/auth/Login';
import RestaurantList from './components/restaurant/RestaurantList';
import Cart from './components/customer/Cart';
import Orders from './components/customer/Orders';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomerHome from './components/customer/CustomerHome';
import RestaurantManagerHome from './components/restaurant/RestaurantManagerHome';
import DeliveryCrewHome from './components/delivery/DeliveryCrewHome';
import RestaurantMenu from './components/customer/RestaurantMenu';
import Profile from './components/customer/Profile';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e28743',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/customer" element={<CustomerHome />} />
              <Route path="/restaurant-manager" element={<RestaurantManagerHome />} />
              <Route path="/delivery-crew" element={<DeliveryCrewHome />} />
            </Route>

            <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
