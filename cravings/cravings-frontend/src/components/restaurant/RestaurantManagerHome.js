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
  IconButton,
  Modal,
  TextField,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const RestaurantManagerHome = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
  });
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newItemFormData, setNewItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
    category: 'main'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openEditRestaurantModal, setOpenEditRestaurantModal] = useState(false);
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: '',
    description: '',
    opening_time: '',
    closing_time: ''
  });
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'appetizer', label: 'Appetizers' },
    { value: 'main', label: 'Main Courses' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'beverage', label: 'Beverages' }
  ];

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Fetch the restaurant owned by the current user
        const response = await api.get('/api/restaurants/');
        const userRestaurant = response.data.find(r => r.owner === user.id);
        
        if (userRestaurant) {
          // Fetch detailed information about the restaurant
          const detailedResponse = await api.get(`/api/restaurants/${userRestaurant.id}/`);
          setRestaurant(detailedResponse.data);

          // Fetch menu items for the restaurant
          const menuResponse = await api.get(`/api/restaurants/${userRestaurant.id}/menu-items/`);
          setMenuItems(menuResponse.data);
        } else {
          setError('No restaurant found for this user');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user]);

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
    navigate('/login');
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
    });
    setOpenModal(true);
  };

  const handleDeleteClick = (itemId) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/restaurants/${restaurant.id}/menu-items/${itemToDelete}/`);
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(
        `/api/restaurants/${restaurant.id}/menu-items/${selectedItem.id}/`,
        formData
      );
      setMenuItems(menuItems.map(item => 
        item.id === selectedItem.id ? response.data : item
      ));
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddItemClick = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewItemFormData({
      name: '',
      description: '',
      price: '',
      is_available: true,
      category: 'main'
    });
  };

  const handleNewItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItemFormData({ ...newItemFormData, [name]: value });
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/api/restaurants/${restaurant.id}/menu-items/`,
        newItemFormData
      );
      setMenuItems([...menuItems, response.data]);
      handleCloseAddModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRestaurantClick = () => {
    setRestaurantFormData({
      name: restaurant.name,
      description: restaurant.description,
      opening_time: restaurant.opening_time,
      closing_time: restaurant.closing_time
    });
    setOpenEditRestaurantModal(true);
    handleMenuClose();
  };

  const handleRestaurantInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurantFormData({ ...restaurantFormData, [name]: value });
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(
        `/api/restaurants/${restaurant.id}/`,
        restaurantFormData
      );
      setRestaurant(response.data);
      setOpenEditRestaurantModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ 
        backgroundColor: '#E3F2FD',
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
                  color: '#1976D2',
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
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    }
                  }}
                >
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
                <MenuItem onClick={handleEditRestaurantClick}>Edit Restaurant</MenuItem>
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleOrdersClick}>Orders</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Centered Restaurant Name */}
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
              color: '#1976D2'
            }}
          >
            {restaurant ? restaurant.name : 'Your Restaurant'}
          </Typography>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Add Menu Item Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleAddItemClick}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': {
                backgroundColor: '#1565C0',
              }
            }}
          >
            Add Menu Item
          </Button>
        </Box>

        {/* Category Filter Buttons */}
        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(category.value)}
              sx={{
                backgroundColor: selectedCategory === category.value ? '#1976D2' : 'transparent',
                color: selectedCategory === category.value ? 'white' : '#1976D2',
                borderColor: '#1976D2',
                '&:hover': {
                  backgroundColor: selectedCategory === category.value ? '#1565C0' : 'rgba(25, 118, 210, 0.1)',
                  borderColor: '#1565C0'
                }
              }}
            >
              {category.label}
            </Button>
          ))}
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
            {filteredMenuItems.map((item) => (
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
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Price: ${item.price}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditItem(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Edit Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="edit-menu-item-modal"
        aria-describedby="edit-menu-item-form"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Edit Menu Item
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Add Menu Item Modal */}
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        aria-labelledby="add-menu-item-modal"
        aria-describedby="add-menu-item-form"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Add New Menu Item
          </Typography>
          <form onSubmit={handleAddItemSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={newItemFormData.name}
                onChange={handleNewItemInputChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={newItemFormData.description}
                onChange={handleNewItemInputChange}
                fullWidth
                required
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={newItemFormData.price}
                onChange={handleNewItemInputChange}
                fullWidth
                required
              />
              <TextField
                label="Category"
                name="category"
                value={newItemFormData.category}
                onChange={handleNewItemInputChange}
                fullWidth
                select
                required
              >
                <MenuItem value="appetizer">Appetizer</MenuItem>
                <MenuItem value="main">Main Course</MenuItem>
                <MenuItem value="dessert">Dessert</MenuItem>
                <MenuItem value="beverage">Beverage</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseAddModal}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Add Item
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Edit Restaurant Modal */}
      <Modal
        open={openEditRestaurantModal}
        onClose={() => setOpenEditRestaurantModal(false)}
        aria-labelledby="edit-restaurant-modal"
        aria-describedby="edit-restaurant-form"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Edit Restaurant Details
          </Typography>
          <form onSubmit={handleRestaurantSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={restaurantFormData.name}
                onChange={handleRestaurantInputChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={restaurantFormData.description}
                onChange={handleRestaurantInputChange}
                fullWidth
                multiline
                rows={3}
              />
              <TextField
                label="Opening Time"
                name="opening_time"
                type="time"
                value={restaurantFormData.opening_time}
                onChange={handleRestaurantInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="Closing Time"
                name="closing_time"
                type="time"
                value={restaurantFormData.closing_time}
                onChange={handleRestaurantInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => setOpenEditRestaurantModal(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this menu item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
                  sx={{ backgroundColor: '#1976D2', '&:hover': { backgroundColor: '#1565C0' } }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ color: '#1976D2', borderColor: '#1976D2' }}
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
                  sx={{ backgroundColor: '#1976D2', '&:hover': { backgroundColor: '#1565C0' } }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenProfileModal(false)}
                  sx={{ color: '#1976D2', borderColor: '#1976D2' }}
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

export default RestaurantManagerHome;
