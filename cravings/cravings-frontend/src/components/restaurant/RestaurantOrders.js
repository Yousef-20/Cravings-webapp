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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryCrew, setDeliveryCrew] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders/');
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchDeliveryCrew = async () => {
      try {
        const response = await api.get('/api/users/delivery-crew/');
        setDeliveryCrew(response.data);
      } catch (err) {
        console.error('Error fetching delivery crew:', err);
      }
    };
    fetchDeliveryCrew();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHomeClick = () => {
    navigate('/restaurant-manager');
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setOpenAssignModal(true);
  };

  const handleAssignClose = () => {
    setOpenAssignModal(false);
    setSelectedOrder(null);
  };

  const handleAssignToCrew = async (crewMember) => {
    try {
      await api.patch(`/api/orders/${selectedOrder.id}/assign-delivery/`, {
        delivery_crew: crewMember.id
      });
      const response = await api.get('/api/orders/');
      setOrders(response.data);
      handleAssignClose();
    } catch (err) {
      console.error('Error assigning delivery:', err);
    }
  };

  const handleChangeCrewClick = (order) => {
    setSelectedOrder(order);
    setOpenAssignModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return '#FFA500';
      case 'out_for_delivery':
        return '#4169E1';
      case 'delivered':
        return '#32CD32';
      case 'cancelled':
        return '#DC143C';
      default:
        return '#000000';
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const filteredOrders = orders.filter(order => order.status === selectedStatus);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ 
        backgroundColor: '#E3F2FD',
        boxShadow: 'none',
        height: '350px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
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
                  color: '#1976D2',
                  minWidth: 'auto',
                  padding: '8px'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                  }
                }}>
                  <AiOutlineUser size={24} color="#1976D2" />
                </Box>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    width: '200px',
                    backgroundColor: '#E3F2FD',
                    '& .MuiMenuItem-root': {
                      color: '#1976D2',
                      '&:hover': {
                        backgroundColor: '#1565C0',
                        color: 'white',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleHomeClick}>Home</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography 
          variant="h2" 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1976D2'
          }}
        >
          Restaurant Orders
        </Typography>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={selectedStatus === 'pending' ? 'contained' : 'outlined'}
            onClick={() => handleStatusChange('pending')}
            sx={{
              backgroundColor: selectedStatus === 'pending' ? '#1976D2' : 'transparent',
              color: selectedStatus === 'pending' ? 'white' : '#1976D2',
              borderColor: '#1976D2',
              '&:hover': {
                backgroundColor: selectedStatus === 'pending' ? '#1565C0' : 'rgba(25, 118, 210, 0.1)',
                borderColor: '#1565C0'
              }
            }}
          >
            Preparing
          </Button>
          <Button
            variant={selectedStatus === 'out_for_delivery' ? 'contained' : 'outlined'}
            onClick={() => handleStatusChange('out_for_delivery')}
            sx={{
              backgroundColor: selectedStatus === 'out_for_delivery' ? '#1976D2' : 'transparent',
              color: selectedStatus === 'out_for_delivery' ? 'white' : '#1976D2',
              borderColor: '#1976D2',
              '&:hover': {
                backgroundColor: selectedStatus === 'out_for_delivery' ? '#1565C0' : 'rgba(25, 118, 210, 0.1)',
                borderColor: '#1565C0'
              }
            }}
          >
            Out for Delivery
          </Button>
          <Button
            variant={selectedStatus === 'delivered' ? 'contained' : 'outlined'}
            onClick={() => handleStatusChange('delivered')}
            sx={{
              backgroundColor: selectedStatus === 'delivered' ? '#1976D2' : 'transparent',
              color: selectedStatus === 'delivered' ? 'white' : '#1976D2',
              borderColor: '#1976D2',
              '&:hover': {
                backgroundColor: selectedStatus === 'delivered' ? '#1565C0' : 'rgba(25, 118, 210, 0.1)',
                borderColor: '#1565C0'
              }
            }}
          >
            Delivered
          </Button>
        </Box>

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
            {filteredOrders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer: {order.customer_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Crew Name: {order.delivery_crew_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: ${order.total}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getStatusColor(order.status),
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    >
                      Status: {order.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Delivery Address: {order.delivery_address}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Order Date: {new Date(order.order_date).toLocaleString()}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Order Items:
                    </Typography>
                    {order.items.map((item) => (
                      <Box key={item.id} sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          {item.quantity} {item.menu_item_name} - ${item.unit_price}
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                      {order.status === 'pending' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          sx={{
                            backgroundColor: '#1976D2',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#1565C0',
                            }
                          }}
                          onClick={() => handleAssignClick(order)}
                        >
                          Assign to Delivery
                        </Button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          sx={{
                            backgroundColor: '#1976D2',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#1565C0',
                            }
                          }}
                          onClick={() => handleChangeCrewClick(order)}
                        >
                          Change Crew
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={openAssignModal}
        onClose={handleAssignClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Order #{selectedOrder?.id} to Delivery Crew</DialogTitle>
        <DialogContent>
          <List>
            {deliveryCrew.length > 0 ? (
              deliveryCrew.map((crew) => (
                <ListItem 
                  button 
                  key={crew.id}
                  onClick={() => crew.assigned_orders <= 3 && handleAssignToCrew(crew)}
                  disabled={crew.assigned_orders > 3}
                  sx={{ opacity: crew.assigned_orders > 3 ? 0.5 : 1 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography>
                      {`${crew.username}`}
                    </Typography>
                    {crew.assigned_orders > 3 && (
                      <Typography color="error" sx={{ ml: 2 }}>
                        Unavailable
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No delivery crew members available" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantOrders;
