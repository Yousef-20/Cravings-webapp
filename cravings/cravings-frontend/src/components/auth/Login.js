// src/components/auth/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Container,
  Stack
} from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const user = await login(credentials.username, credentials.password);
      
      // Redirect based on role
      if (user.role === 'Restaurant Owner') {
        navigate('/restaurant-manager');
      } else if (user.role === 'Delivery Crew') {
        navigate('/delivery-crew');
      } else {
        navigate('/customer');
      }
    } catch (error) {
      if (error.response) {
        // Handle API errors
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
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
            Welcome to Cravings
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
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            required
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              size="large"
              onClick={handleRegister}
            >
              Register
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;