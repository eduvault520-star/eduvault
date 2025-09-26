import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  VideoLibrary
} from '@mui/icons-material';

// Authenticated Video Component for Students
function AuthenticatedVideo({ filename, backendUrl, isPremium = false, hasSubscription = false }) {
  console.log('🎥 Student AuthenticatedVideo component rendered with:', { filename, backendUrl, isPremium, hasSubscription });
  const [videoSrc, setVideoSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user can access premium content
    if (isPremium && !hasSubscription) {
      setError('Premium subscription required to access this content');
      setLoading(false);
      return;
    }

    const fetchVideoBlob = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please log in to access this content');
        }

        console.log('🎥 Fetching video blob for student:', filename);
        
        const response = await fetch(`${backendUrl}/api/upload/file/${filename}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to access this content');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to access this content');
          }
          throw new Error(`Error loading video: ${response.status}`);
        }

        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        console.log('🎥 Created student blob URL:', videoUrl);
        setVideoSrc(videoUrl);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoBlob();

    // Cleanup function to revoke object URL
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [filename, backendUrl, isPremium, hasSubscription]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 300,
        bgcolor: 'grey.900',
        color: 'white',
        borderRadius: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography variant="body2">Loading video...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 300,
        bgcolor: 'grey.900',
        color: 'white',
        borderRadius: 2,
        border: isPremium ? '2px solid #ffa726' : '1px solid #666'
      }}>
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <VideoLibrary sx={{ fontSize: 64, mb: 2, color: 'grey.500' }} />
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
          {isPremium && !hasSubscription && (
            <Typography variant="caption" color="warning.main">
              🔒 Premium Content - Subscription Required
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      border: isPremium ? '2px solid #ffa726' : '1px solid #ddd'
    }}>
      {/* Premium Badge */}
      {isPremium && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: 'rgba(255, 167, 38, 0.9)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          ⭐ PREMIUM
        </Box>
      )}
      
      <video
        controls
        width="100%"
        height="300"
        style={{ display: 'block' }}
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        onLoadStart={() => console.log('🎥 Student video loading started')}
        onCanPlay={() => console.log('🎥 Student video ready to play')}
        onError={(e) => console.error('🎥 Student video error:', e)}
        src={videoSrc}
      >
        Your browser does not support the video tag.
      </video>
    </Box>
  );
}

export default AuthenticatedVideo;
