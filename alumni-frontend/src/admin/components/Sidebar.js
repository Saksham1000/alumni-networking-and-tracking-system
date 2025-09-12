import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Users', icon: <PeopleIcon />, to: '/users' },
  { label: 'Events', icon: <EventIcon />, to: '/events' },
  { label: 'Jobs', icon: <WorkIcon />, to: '/jobs' },
  { label: 'Notifications', icon: <NotificationsIcon />, to: '/notifications' },
];

const Sidebar = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: 220,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', bgcolor: '#212b36', color: 'white' },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: 'auto', mt: 2 }}>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
            component={NavLink}
            to={item.to}
            sx={{
              '&.active': { bgcolor: 'primary.main', color: 'white' },
              borderRadius: 2,
              mb: 1,
              mx: 1,
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  </Drawer>
);

export default Sidebar; 