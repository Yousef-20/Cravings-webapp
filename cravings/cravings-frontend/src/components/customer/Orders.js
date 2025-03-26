import React, { useState, useEffect } from 'react';
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
  Menu,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders/');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
    navigate('/login');
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
                        backgroundColor: '#e65A38',
                        color: '#FAF0E6',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Centered Title */}
        <Typography 
          variant="h2" 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#F56A48'
          }}
        >
          Your Orders
        </Typography>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: {order.status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total: ${order.total}
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

export default Orders;