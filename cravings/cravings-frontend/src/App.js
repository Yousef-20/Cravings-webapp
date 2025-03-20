import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import RestaurantList from './components/restaurant/RestaurantList';
import Cart from './components/customer/Cart';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomerHome from './components/customer/CustomerHome';
import RetaurantManagerHome from './components/restaurant/RetaurantManagerHome';
import DeliveryCrewHome from './components/delivery/DeliveryCrewHome';
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
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/restaurants" element={<RestaurantList />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/restaurant-manager" element={<RetaurantManagerHome />} />
                <Route path="/delivery-crew" element={<DeliveryCrewHome />} />
              </Route>
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
