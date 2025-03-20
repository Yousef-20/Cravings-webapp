import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Card, CardMedia, CardContent, TextField, InputAdornment, CircularProgress } from '@mui/material';
import api from '../../services/api';

const CustomerHome = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Welcome to Cravings!
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search Restaurant"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <span>🔍</span>
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredRestaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {restaurant.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={restaurant.image}
                  alt={restaurant.name}
                />
              )}
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
    </Container>
  );
};

export default CustomerHome;
