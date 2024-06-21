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
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// ModalWrapper.js
// ... (imports)
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';

const ModalWrapper1 = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate =useNavigate();
  const { user } = useUserContext();

  const handleCloseClick = async() => {
    if (window.confirm("Are you sure you want to close? Note: Please save your resume before closing.")) {


      let resume;
      try {
       const profileIdResponse1 = await axios.get(`${apiUrl}/resume/pdf/${user.id}`); 
       
     } catch (error) { 
       resume=error.response.status; 
     }
     if(resume === 404){
      navigate('/applicant-basic-details-form/3');
     }else{
      navigate('/applicanthome');
     }


      onClose();
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
          <>
            <Button
              variant="contained"
              sx={{
                position: 'absolute',
                right: -10,
                top: 16,
                background: '#F97316',
                borderRadius: '8px',
                color: '#fff',
                '&:hover': {
                  background: '#F97316',
                },
                zIndex: 1,
              }}
              onClick={handleCloseClick}
            >
              Close
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCloseClick}
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

export default ModalWrapper1;