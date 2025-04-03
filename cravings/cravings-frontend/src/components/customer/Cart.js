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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AiOutlineUser } from 'react-icons/ai';

const Cart = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);

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
      const response = await api.post('/api/orders/', { delivery_address: address });
      console.log('Order placed successfully:', response.data); // Log the response
      setCart({ items: [], total: 0 }); // Clear the cart
      setAddress(''); // Clear the address field
    } catch (error) {
      console.error('Error placing order:', error.response || error); // Log detailed error
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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/profile/');
      setProfile({
        username: response.data.username,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileClick = () => {
    fetchProfile();
    setOpenProfileModal(true);
    handleMenuClose();
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/api/profile/', profile);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleOrdersClick = () => {
    navigate('/orders');
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    logout();
    handleMenuClose();
    navigate('/login'); // Redirect to login page
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
        {/* Dropdown Menu Button */}
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 2
        }}>
          {user && (
            <>
              <Button
                color="inherit"
                onClick={handleMenuClick}
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  height: '48px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  color: '#F56A48',
                  minWidth: 'auto',
                  padding: '8px'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 106, 72, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(245, 106, 72, 0.2)',
                    }
                  }}
                >
                  <AiOutlineUser size={24} color="#F56A48" />
                </Box>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    width: '200px',
                    backgroundColor: '#FAF0E6',
                    '& .MuiMenuItem-root': {
                      color: '#F56A48',
                      '&:hover': {
                        backgroundColor: '#e65a38',
                        color: '#FAF0E6',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleOrdersClick}>Orders</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </>
          )}
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

      {/* Profile Modal */}
      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Profile Management</DialogTitle>
        <DialogContent>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                name="username"
                value={profile.username}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="First Name"
                name="first_name"
                value={profile.first_name}
                onChange={handleProfileChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="last_name"
                value={profile.last_name}
                onChange={handleProfileChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
              <DialogActions>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: '#F56A48', '&:hover': { backgroundColor: '#e65a38' } }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ color: '#F56A48', borderColor: '#F56A48' }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </form>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Username: {profile.username}
              </Typography>
              <Typography variant="h6" gutterBottom>
                First Name: {profile.first_name}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Last Name: {profile.last_name}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Email: {profile.email}
              </Typography>
              <DialogActions>
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  sx={{ backgroundColor: '#F56A48', '&:hover': { backgroundColor: '#e65a38' } }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenProfileModal(false)}
                  sx={{ color: '#F56A48', borderColor: '#F56A48' }}
                >
                  Close
                </Button>
              </DialogActions>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Cart;