import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  AppBar, 
  Typography, 
  Button, 
  Container, 
  Menu, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';
import api from '../../services/api';

const DeliveryCrewHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders assigned to the delivery crew
  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/api/orders/');

      // Filter orders assigned to the current delivery crew member and with status 'out_for_delivery'
      const filteredOrders = response.data.filter(order => 
        order.delivery_crew_name === user?.username && order.status === 'out_for_delivery'
      );

      // Sort orders by order_date (oldest first)
      const sortedOrders = filteredOrders.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  // Mark an order as delivered
  const markAsDelivered = async (orderId) => {
    try {
      await api.patch(`/api/orders/${orderId}/mark-delivered/`, { status: 'delivered' });
      // Remove the delivered order from the list
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ 
        backgroundColor: '#E8F5E9',
        boxShadow: 'none',
        height: '350px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Dropdown Menu Button */}
        <Button
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ position: 'absolute', top: 16, right: 16, color: '#2E7D32' }}
        >
          <AiOutlineUser size={24} />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              width: '200px',
              backgroundColor: '#E8F5E9',
              '& .MuiMenuItem-root': {
                color: '#2E7D32',
                '&:hover': {
                  backgroundColor: '#2E7D32',
                  color: 'white',
                },
              },
            },
          }}
        >
          <MenuItem onClick={() => { setOpenProfileModal(true); setAnchorEl(null); }}>Profile</MenuItem>
          <MenuItem onClick={() => { logout(); navigate('/login'); }}>Logout</MenuItem>
        </Menu>

        {/* Centered Welcome Message */}
        <Typography 
          variant="h2" 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2E7D32'
          }}
        >
          Hello {user?.first_name || user?.username || 'Delivery Crew'}!
        </Typography>
      </AppBar>

      {/* Main Content */}
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2, color: '#2E7D32', textAlign: 'center' }}>
          Your Orders
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {orders.length > 0 ? (
              orders.map(order => (
                <ListItem key={order.id} sx={{ borderBottom: '1px solid #E8F5E9', py: 2 }}>
                  <ListItemText
                    primary={`Order #${order.id}`}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          Restaurant: {order.restaurant_name}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          Customer: {order.customer_name}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          Location: {order.delivery_address}
                        </Typography>
                      </>
                    }
                  />
                  {order.status !== 'Delivered' && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                      onClick={() => markAsDelivered(order.id)}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" sx={{ color: '#2E7D32', textAlign: 'center' }}>
                No orders assigned to you.
              </Typography>
            )}
          </List>
        )}
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
            <form onSubmit={(e) => { e.preventDefault(); /* Handle submit */ }}>
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
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="last_name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <DialogActions>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
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
                  sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenProfileModal(false)}
                  sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
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

export default DeliveryCrewHome;
