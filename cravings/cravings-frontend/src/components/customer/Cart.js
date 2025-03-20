// src/components/customer/Cart.js
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  List, 
  ListItem, 
  Typography, 
  Button, 
  TextField 
} from '@mui/material';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('api/cart/');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      await api.post('/orders/', { delivery_address: address });
      setCart({ items: [], total: 0 });
      setAddress('');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Your Cart</Typography>
      <List>
        {cart.items.map((item) => (
          <ListItem key={item.id}>
            <Typography>
              {item.menu_item_name} x {item.quantity} - ${item.subtotal}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Typography variant="h6">Total: ${cart.total}</Typography>
      <TextField
        fullWidth
        label="Delivery Address"
        margin="normal"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button 
        variant="contained" 
        onClick={placeOrder}
        disabled={!cart.items.length || !address}
      >
        Place Order
      </Button>
    </div>
  );
};

export default Cart;