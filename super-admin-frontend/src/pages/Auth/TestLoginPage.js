import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const TestLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClick = () => {
    console.log('🚀 BUTTON CLICKED - NO RELOAD SHOULD HAPPEN');
    console.log('Email:', email);
    console.log('Password:', password);
    alert('Button clicked! Check console for logs.');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Test Login (No Reload)
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <Button
        fullWidth
        variant="contained"
        onClick={handleClick}
        sx={{ mb: 2 }}
      >
        Test Button (Should NOT Reload)
      </Button>
      
      <Typography variant="body2" color="text.secondary">
        If this page reloads when you click the button, there's a fundamental issue with the React setup.
      </Typography>
    </Box>
  );
};

export default TestLoginPage;
