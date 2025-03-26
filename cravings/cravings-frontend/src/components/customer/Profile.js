import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container,
  Paper,
  Stack,
  AppBar,
  Menu,
  MenuItem
} from '@mui/material';
import { AiOutlineUser } from 'react-icons/ai';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchProfile();
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

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/api/profile/', profile);
      alert('Profile updated successfully!');
      setIsEditing(false); // Switch back to preview mode after saving
    } catch (error) {
      console.error('Error updating profile:', error);
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

        {/* Centered Welcome Message */}
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
            Profile Management
          </Typography>
        </Box>
      </AppBar>

      {/* Profile Details */}
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 4, mb: 4 }}>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
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
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
              </Stack>
            </form>
          ) : (
            <Paper elevation={3} sx={{ p: 3 }}>
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
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                sx={{ mt: 2, backgroundColor: '#F56A48', '&:hover': { backgroundColor: '#e65a38' } }}
              >
                Edit Profile
              </Button>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Profile; 