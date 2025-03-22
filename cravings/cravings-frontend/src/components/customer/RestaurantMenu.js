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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only the menu items (assuming customers are allowed to access this)
        const menuResponse = await api.get(`/api/restaurants/${id}/menu-items/`);
        setMenuItems(menuResponse.data);

        // Get restaurant name from menu items response if available
        if (menuResponse.data.length > 0) {
          setRestaurant({
            name: menuResponse.data[0].restaurant_name, // Assuming the API returns restaurant_name
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
        {/* Cart and Logout Buttons */}
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
                onClick={() => navigate('/cart')}
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  height: '48px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  color: '#F56A48'
                }}
              >
                Cart
              </Button>
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
            </>
          )}
        </Box>

        {/* Restaurant Logo and Name */}
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
                e.target.src = `${process.env.PUBLIC_URL}/logos/default.png`; // Fallback image
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
          <Grid container spacing={3}>
            {menuItems.map((item) => (
              <Grid item xs="12" sm="6" md="4" key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        )}
      </Container>
    </Box>
  );
};

export default RestaurantMenu;
