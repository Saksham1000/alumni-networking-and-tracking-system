import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Topbar = () => (
  <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'primary.main', borderBottom: 1, borderColor: 'divider' }}>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
        Admin Dashboard
      </Typography>
      <Box>
        {/* Future: Profile, notifications, settings, etc. */}
      </Box>
    </Toolbar>
  </AppBar>
);

export default Topbar; 