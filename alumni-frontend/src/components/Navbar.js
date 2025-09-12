import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, TextField, InputAdornment, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon, ListItemText, Badge, Avatar, Divider, Popover, CircularProgress, Chip } from '@mui/material';
import { Link, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIconIcon, Home as HomeIcon, People as PeopleIcon, Person as PersonIcon, ThumbUp as ThumbUpIcon, Message as MessageIcon, MoreVert as MoreVertIcon, School as SchoolIcon } from '@mui/icons-material';
import api from '../utils/api';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const mainNav = [
  { label: 'Home', icon: <HomeIcon />, to: '/' },
  { label: 'Search', icon: <SearchIcon />, to: '/search' },
  { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
  { label: 'Alumni', icon: <PeopleIcon />, to: '/alumni' },
  { label: 'Recommendations', icon: <ThumbUpIcon />, to: '/recommendations' },
];

const extraNav = [
  { label: 'Events', to: '/events' },
  { label: 'Job Board', to: '/jobs' },
  { label: 'Contact', to: '/contact' },
  { label: 'About', to: '/about' },
];

function Navbar({ toggleTheme, mode }) {
  const { user, logout, unreadMessages, setUnreadMessages } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch notifications on mount and poll every 30s
  useEffect(() => {
    let interval;
    const fetchNotifications = async () => {
      if (!user) return;
      setNotifLoading(true);
      try {
        const res = await api.getNotifications();
        setNotifications(res.data);
        setNotifUnread(res.data.filter(n => !n.read).length);
      } catch {}
      setNotifLoading(false);
    };
    const fetchUnreadMessages = async () => {
      if (!user) return;
      try {
        const res = await api.get('/users/messages/unread-count/');
        setUnreadMessages(res.data.unread_count || 0);
      } catch {
        setUnreadMessages(0);
      }
    };
    if (user) {
      fetchNotifications();
      fetchUnreadMessages();
      interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadMessages();
      }, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [user]);

  // Fetch pending connection requests count when drawer opens
  useEffect(() => {
    if (drawerOpen && user) {
      api.get('/users/connections/').then(res => {
        const pending = res.data.filter(r => r.status === 'pending' && r.to_user.id === user.id);
        setPendingCount(pending.length);
      }).catch(() => setPendingCount(0));
    }
  }, [drawerOpen, user]);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNotifIconClick = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);
  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await api.markNotificationRead(notif.id);
      setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setNotifUnread((prev) => Math.max(0, prev - 1));
    }
    if (notif.link) {
      if (notif.link.startsWith('/')) {
        navigate(notif.link);
      } else {
        window.location.href = notif.link;
      }
    }
    handleNotifClose();
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const navLinkStyle = {
    color: 'text.primary',
    textDecoration: 'none',
    fontWeight: 500,
    mx: 1.5,
    py: 1,
    '&:hover': {
      color: 'primary.main',
    }
  };
  
  const navButtonStyle = {
    ...navLinkStyle,
    color: 'primary.main',
    borderColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.light',
      borderColor: 'primary.dark',
      color: 'white',
    }
  };

  const handleRefreshNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
      setNotifUnread(res.data.filter(n => !n.read).length);
    } catch {}
    setNotifLoading(false);
  };

  const handleMarkAllRead = async () => {
    setNotifLoading(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      setNotifUnread(0);
    } catch {}
    setNotifLoading(false);
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 },
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }} 
          onClick={() => navigate('/')}
        >
          Alumni Networking System
        </Typography>
        {!user ? (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            alignItems: 'center',
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
            mt: { xs: 1, sm: 0 }
          }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/" 
              size="small"
              startIcon={<HomeIcon />}
              sx={{ 
                display: { xs: 'none', sm: 'inline-flex' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/about"
              size="small"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              About
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/contact"
              size="small"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Contact
            </Button>
            <Button 
              color="primary" 
              variant="contained" 
              component={Link} 
              to="/login" 
              size="small"
              sx={{ 
                ml: { xs: 0, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Login
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: { xs: 'none', lg: 'flex' }, 
            gap: 1, 
            alignItems: 'center',
            flexWrap: 'nowrap',
            minWidth: 0
          }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search alumni or students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  minWidth: { xs: 180, sm: 220 },
                  maxWidth: 300,
                  mr: 1,
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
            {mainNav.filter(item => item.label !== 'Search').map((item) => (
              <IconButton 
                key={item.label} 
                color="inherit" 
                component={Link} 
                to={item.to} 
                size="small"
                sx={{
                  flexDirection: 'column',
                  gap: 0.5,
                  minWidth: 'auto',
                  px: 1
                }}
              >
                {item.icon}
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>{item.label}</Typography>
              </IconButton>
            ))}
            <IconButton 
              color="inherit" 
              onClick={handleNotifIconClick} 
              size="small"
              sx={{ flexDirection: 'column', gap: 0.5 }}
            >
              <Badge badgeContent={notifUnread} color="error">
                <NotificationsIcon />
              </Badge>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Alerts</Typography>
            </IconButton>
            <IconButton 
              color="inherit" 
              component={Link} 
              to="/messages" 
              size="small"
              sx={{ flexDirection: 'column', gap: 0.5 }}
            >
              <Badge badgeContent={unreadMessages} color="error">
                <MessageIcon />
              </Badge>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Messages</Typography>
            </IconButton>
          </Box>
        )}
        {user && (
          <>
            <IconButton color="inherit" edge="end" sx={{ ml: 1 }} onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ 
                width: 280, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                bgcolor: 'background.default', 
                color: 'text.primary',
                position: 'relative',
                overflow: 'hidden'
              }} role="presentation" onClick={() => setDrawerOpen(false)}>
                {/* Role-based header background */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  background: user?.role === 'alumni' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : user?.role === 'student' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  opacity: 0.1,
                  zIndex: 0
                }} />
                
                {/* User profile section */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 3, 
                  borderBottom: 1, 
                  borderColor: 'divider', 
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1
                }} onClick={() => navigate('/profile')}>
                  {user && user.profile_picture ? (
                    <Avatar 
                      src={user.profile_picture} 
                      alt={user.username} 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        mr: 2,
                        border: '3px solid',
                        borderColor: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main'
                      }} 
                    />
                  ) : (
                    <AccountCircleIcon sx={{ width: 50, height: 50, mr: 2 }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={user?.role === 'alumni' ? 'Alumni' : user?.role === 'student' ? 'Student' : 'Admin'}
                        color={user?.role === 'alumni' ? 'primary' : user?.role === 'student' ? 'secondary' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {user?.graduation_year && (
                        <Chip 
                          icon={<SchoolIcon />}
                          label={`Class of ${user.graduation_year}`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        wordBreak: 'break-all',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {user ? user.email : ''}
                    </Typography>
                  </Box>
                </Box>
                <List sx={{ flexGrow: 1, px: 1 }}>
                  <ListItem 
                    button 
                    component={Link} 
                    to="/my-connections" 
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: user?.role === 'alumni' ? 'primary.50' : user?.role === 'student' ? 'secondary.50' : 'warning.50',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span>Connections</span>
                          {pendingCount > 0 && (
                            <Badge badgeContent={pendingCount} color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      } 
                      sx={{ 
                        color: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main',
                        fontWeight: 600
                      }}
                    />
                  </ListItem>
                  {extraNav.map((item) => (
                    <ListItem 
                      key={item.label} 
                      button 
                      component={Link} 
                      to={item.to} 
                      sx={{ 
                        cursor: 'pointer',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: user?.role === 'alumni' ? 'primary.50' : user?.role === 'student' ? 'secondary.50' : 'warning.50',
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <ListItemText 
                        primary={item.label}
                        sx={{ 
                          color: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main',
                          fontWeight: 600
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <List sx={{ px: 1 }}>
                  <ListItem 
                    button 
                    onClick={toggleTheme} 
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon>
                      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      sx={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={handleLogout} 
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'error.50',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemText 
                      primary="Logout"
                      sx={{ 
                        color: 'error.main',
                        fontWeight: 600
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { minWidth: 320, maxHeight: 400, overflowY: 'auto' } }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Notifications</Typography>
                  <Box>
                    <Tooltip title="Refresh">
                      <IconButton size="small" onClick={handleRefreshNotifications} disabled={notifLoading}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark all as read">
                      <IconButton size="small" onClick={handleMarkAllRead} disabled={notifLoading || notifUnread === 0}>
                        <DoneAllIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {notifLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                    <NotificationsIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>No notifications</Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>Unread</Typography>
                    {notifications.filter(n => !n.read).length === 0 && <Typography color="text.secondary" variant="body2">No unread notifications</Typography>}
                    {notifications.filter(n => !n.read).map(notif => (
                      <Box key={notif.id} sx={{ bgcolor: 'primary.light', borderRadius: 1, p: 1, mb: 1, cursor: 'pointer', boxShadow: 1, '&:hover': { bgcolor: 'primary.main', color: 'white' } }} onClick={() => handleNotifClick(notif)}>
                        <Typography variant="body2">{notif.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(notif.created_at).toLocaleString()}</Typography>
                      </Box>
                    ))}
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>Seen</Typography>
                    {notifications.filter(n => n.read).length === 0 && <Typography color="text.secondary" variant="body2">No seen notifications</Typography>}
                    {notifications.filter(n => n.read).map(notif => (
                      <Box key={notif.id} sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 1, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'grey.300' } }} onClick={() => handleNotifClick(notif)}>
                        <Typography variant="body2">{notif.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(notif.created_at).toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </>
                )}
              </Box>
            </Popover>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 