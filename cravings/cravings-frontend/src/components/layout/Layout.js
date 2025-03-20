import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isLoginPage = location.pathname === '/login';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLoginPage && (
        <AppBar position="static">
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/restaurants')}
            >
              Cravings
            </Typography>
            {user ? (
              <>
                <Button color="inherit" onClick={() => navigate('/restaurants')}>
                  Restaurants
                </Button>
                <Button color="inherit" onClick={() => navigate('/cart')}>
                  Cart
                </Button>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
      )}
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
