import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Typography, 
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Modal,
  Paper,
  IconButton,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { AiOutlineUser } from 'react-icons/ai';

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuResponse = await api.get(`/api/restaurants/${id}/menu-items/`);
        setMenuItems(menuResponse.data);

        if (menuResponse.data.length > 0) {
          setRestaurant({
            name: menuResponse.data[0].restaurant_name,
            id: id
          });
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You are not authorized to view this content');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered menu items by category
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Handle item click
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle increase quantity
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Handle add to cart (updated to include quantity)
  const handleAddToCart = async () => {
    if (selectedItem) {
      try {
        // Make API call to add item to cart
        await api.post('/api/cart/items/', {
          menu_item: selectedItem.id,
          quantity: quantity
        });
        console.log('Added to cart:', selectedItem, 'Quantity:', quantity);
        setOpenModal(false); // Close the modal after adding to cart
        setQuantity(1); // Reset quantity to 1
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
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
        height: '350px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Dropdown Menu and Cart Button */}
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 2
        }}>
          {user && (
            <>
              {/* Cart Button */}
              <Button 
                color="inherit" 
                onClick={() => navigate('/cart')}
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
                <ShoppingCartIcon />
              </Button>

              {/* User Dropdown Button */}
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

        {/* Restaurant Logo, Name, and Search Bar */}
        {restaurant && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Box
              component="img"
              src={`${process.env.PUBLIC_URL}/logos/${restaurant.id}.png`}
              alt={restaurant.name}
              sx={{ 
                width: 120,
                height: 120,
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.src = `${process.env.PUBLIC_URL}/logos/default.png`;
              }}
            />
            <Typography 
              variant="h2" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#F56A48'
              }}
            >
              {restaurant.name}
            </Typography>
            {/* Search Bar */}
            <TextField
              placeholder="Search menu items..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                width: '300px',
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
          </Box>
        )}
      </AppBar>

      {/* Main Content */}
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="h6">
            Error: {error}
          </Typography>
        ) : (
          Object.entries(groupedMenuItems).map(([category, items]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 2, color: '#F56A48' }}>
                {category}
              </Typography>
              <Grid container spacing={3}>
                {items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Price: ${item.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Container>

      {/* Modal for Menu Item Details */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper sx={{ 
          width: 400,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {selectedItem && (
            <>
              <Typography variant="h5" component="div">
                {selectedItem.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedItem.description}
              </Typography>
              <Typography variant="body2" sx={{ color: 'black' }}>
                Price: ${(selectedItem.price * quantity).toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                {/* Quantity Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={handleDecreaseQuantity}
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
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={handleIncreaseQuantity}
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
                {/* Add to Cart Button */}
                <Button
                  variant="contained"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  sx={{ 
                    backgroundColor: '#F56A48',
                    '&:hover': {
                      backgroundColor: '#e65a38'
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default RestaurantMenu;
