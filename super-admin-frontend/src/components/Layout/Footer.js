import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.grey[900],
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              EduVault
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.300' }}>
              Empowering Kenyan students with access to quality educational resources, 
              past papers, lecture recordings, and career opportunities.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" variant="body2">
                Home
              </Link>
              <Link href="/resources" color="inherit" underline="hover" variant="body2">
                Resources
              </Link>
              <Link href="/jobs" color="inherit" underline="hover" variant="body2">
                Jobs
              </Link>
              <Link href="/about" color="inherit" underline="hover" variant="body2">
                About Us
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" underline="hover" variant="body2">
                Help Center
              </Link>
              <Link href="/contact" color="inherit" underline="hover" variant="body2">
                Contact Us
              </Link>
              <Link href="/privacy" color="inherit" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover" variant="body2">
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  eduvault520@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  +254 741 218 862
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  Nakuru, Njoro - Egerton University
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} EduVault. All rights reserved.
          </Typography>
          <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            <Typography variant="body2" color="grey.400">
              Created & Founded by Immanuel K. Ronoh
            </Typography>
            <Typography variant="body2" color="grey.500" sx={{ fontSize: '0.75rem' }}>
              Made with ❤️ for Kenyan students
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
