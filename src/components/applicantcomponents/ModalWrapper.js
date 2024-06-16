// ModalWrapper.js
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

const ModalWrapper = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
          paddingTop: '90px'
        },
      }}
    >
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        {isMobile ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: -10,
              top: -10,
              color: '#F97316',
              zIndex: 1,
              
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : (
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 9,
              background: '#F97316',
              borderRadius: '8px',
              color: '#fff',
              '&:hover': {
                background: '#F97316',
              },
              zIndex: 1, // Ensure the button is above other content
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
