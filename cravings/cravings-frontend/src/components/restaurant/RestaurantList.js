// src/components/restaurant/RestaurantList.js
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Container,
  Box,
  CircularProgress 
} from '@mui/material';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/api/restaurants/');
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Restaurants
      </Typography>
      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {restaurant.name}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {restaurant.description}
                </Typography>
                <Typography variant="body2">
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

export default RestaurantList;