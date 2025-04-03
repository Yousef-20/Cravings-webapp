import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';

const CustomerHome = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/api/restaurants/');
        setRestaurants(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

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

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    fetchProfile();
    setOpenProfileModal(true);
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

        {/* Centered Welcome Message and Search Bar */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography 
            variant="h2" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#F56A48'
            }}
          >
            Welcome to Cravings
          </Typography>
          <TextField
            placeholder="Search restaurants..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              width: '300px',
              backgroundColor: 'white',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                height: '40px',
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
              '& .MuiInputBase-input': {
                padding: '8px 14px',
              },
            }}
          />
        </Box>
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
            {filteredRestaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
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
                  onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={`/logos/${restaurant.id}.png`}
                    alt={restaurant.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {restaurant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Hours: {restaurant.opening_time} - {restaurant.closing_time}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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

export default CustomerHome;
