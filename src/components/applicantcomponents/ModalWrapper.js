import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import ResumeBuilder from './ResumeBuilder'; // Ensure the path is correct
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';

const ModalWrapper = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate =useNavigate();
  const { user } = useUserContext();

  const handleCloseClick = async () => {
    if (window.confirm("Please close this window only after saving your resume.")) {
      try {
        // Add a cache-busting parameter to the logout URL
        const logoutUrl = 'https://resume.bitlabs.in:5173/api/auth/logout?_=' + Date.now();
        const response = await fetch(logoutUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        onClose();
      } catch (error) {
        console.error('There was a problem with the logout request:', error);
        alert('Failed to close. Please try again.');
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseClick}
      fullScreen={true}
      aria-labelledby="responsive-dialog-title"
      maxWidth="xl" // Ensures the dialog can stretch to full width
      PaperProps={{
        style: {
          width: '100%',
          height: '100%',
          margin: 0,
          maxWidth: 'none',
          maxHeight: 'none',
          position: 'relative',
          paddingTop: '90px',
        },
      }}
    >
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        {isMobile ? (
          <Button
            //variant="contained"
            sx={{
              position: 'absolute',
              textTransform:'capitalize',
              right: 2,
              top: 16,
              //background: '#FFFFFF',
              border:'1px solid #F97316',
              borderRadius: '8px',
              color: '#F97316',
              '&:hover': {
                border:'1px solid #DA4D0B',
                color:'#DA4D0B'
              },
              zIndex: 1,
            }}
            onClick={handleCloseClick}
          >
            Close
          </Button>
        ) : (
          <Button
            onClick={handleCloseClick}
            sx={{
              position: 'absolute',
              textTransform:'capitalize',
              right: 16,
              top: 9,
              //background: '#FFFFFF',
              border:'1px solid #F97316',
              borderRadius: '8px',
              color: '#F97316',
              '&:hover': {
                border:'1px solid #DA4D0B',
                color:'#DA4D0B'
              },
              zIndex: 1,
            }}
          >
            Close
          </Button>
        )}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ResumeBuilder /> {/* Include ResumeBuilder component here */}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper;
