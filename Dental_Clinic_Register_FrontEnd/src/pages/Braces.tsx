import { Box, Typography } from '@mui/material';

function BracesPage() {
  return (
    <Box sx={{ width: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Braces Managment Dummy
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Use the controls to select a placement mode, then click on the 3D model to add components.
      </Typography>
    </Box>
  );
}

export default BracesPage;
