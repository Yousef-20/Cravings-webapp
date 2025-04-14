import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Container,
  Stack
} from '@mui/material';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    re_password: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.re_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      await api.post('/auth/users/', payload);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}
          >
            Create Account
          </Typography>
          {error && (
            <Typography 
              color="error" 
              align="center" 
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            margin="normal"
            required
            value={formData.re_password}
            onChange={(e) => setFormData({ ...formData, re_password: e.target.value })}
          />
          
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
            >
              Register
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              size="large"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
