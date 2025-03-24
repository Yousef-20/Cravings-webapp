// src/components/customer/Cart.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Box, 
  AppBar, 
  Typography, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  Container,
  IconButton
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const Cart = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('api/cart/');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      await api.post('/orders/', { delivery_address: address });
      setCart({ items: [], total: 0 });
      setAddress('');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = async (itemId) => {
    try {
      const response = await api.patch(`/api/cart/items/${itemId}/`, { quantity: -1 });
      console.log('Decrease Quantity Response:', response.data); // Log response
      fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error decreasing quantity:', error.response || error); // Log detailed error
    }
  };

  // Handle increase quantity
  const handleIncreaseQuantity = async (itemId) => {
    try {
      const response = await api.patch(`/api/cart/items/${itemId}/`, { quantity: 1 });
      console.log('Increase Quantity Response:', response.data); // Log response
      fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error increasing quantity:', error.response || error); // Log detailed error
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/items/${itemId}/`);
      fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ 
        backgroundColor: '#FAF0E6',
        boxShadow: 'none',
        height: '150px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Logout Button */}
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 2
        }}>
          <Button 
            color="inherit" 
            onClick={logout}
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1rem',
              height: '48px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              color: '#F56A48'
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Cart Title */}
        <Typography 
          variant="h2" 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#F56A48'
          }}
        >
          Your Cart
        </Typography>
      </AppBar>

      {/* Main Content */}
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cart.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fff',
                maxWidth: '600px',
                width: '100%',
                mx: 'auto',
              }}
            >
              <Box>
                <Typography variant="h6" component="div">
                  {item.menu_item_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${item.price} each
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Remove Button */}
                <IconButton
                  onClick={() => handleRemoveItem(item.id)}
                  sx={{ 
                    color: '#F56A48',
                    '&:hover': {
                      backgroundColor: '#e65a38',
                      color: 'white'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                {/* Quantity Controls */}
                <IconButton
                  onClick={() => handleDecreaseQuantity(item.id)}
                  sx={{ 
                    backgroundColor: '#F56A48',
                    borderRadius: '8px',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    '&:hover': {
                      backgroundColor: '#e65a38'
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="body1" sx={{ minWidth: '24px', textAlign: 'center' }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  onClick={() => handleIncreaseQuantity(item.id)}
                  sx={{ 
                    backgroundColor: '#F56A48',
                    borderRadius: '8px',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    '&:hover': {
                      backgroundColor: '#e65a38'
                    }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: '600px', 
          width: '100%', 
          mx: 'auto' 
        }}>
          {/* Subtotal */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#F56A48' }}>
            Subtotal: ${cart.total}
          </Typography>

          {/* Delivery Address */}
          <TextField
            fullWidth
            label="Delivery Address"
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#F56A48',
                },
                '&:hover fieldset': {
                  borderColor: '#F56A48',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F56A48',
                },
              },
            }}
          />

          {/* Place Order Button */}
          <Button 
            variant="contained" 
            onClick={placeOrder}
            disabled={!cart.items.length || !address}
            sx={{ 
              backgroundColor: '#F56A48',
              mt: 2, // Add margin top to separate from the address field
              '&:hover': {
                backgroundColor: '#e65a38'
              }
            }}
          >
            Place Order
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;