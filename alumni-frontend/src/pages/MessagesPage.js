import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Grid, List, ListItem, ListItemText, Paper, TextField, Button, Typography, Avatar, Box, Card, CardContent, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';

/**
 * MessagesPage Component
 * Real-time messaging interface for connected users
 * Features WebSocket integration for instant messaging
 */
const MessagesPage = () => {
  const { user, token, unreadMessages, setUnreadMessages } = useContext(AuthContext);
  
  // Connection and messaging state
  const [connections, setConnections] = useState([]);           // List of connected users
  const [selectedConnection, setSelectedConnection] = useState(null); // Currently selected chat
  const [messages, setMessages] = useState([]);                 // Messages in current chat
  const [newMessage, setNewMessage] = useState('');             // New message input
  
  // WebSocket and UI refs
  const socket = useRef(null);                                  // WebSocket connection
  const messagesEndRef = useRef(null);                          // Auto-scroll to bottom

  useEffect(() => {
    api.get('/users/my-connections/')
      .then(res => {
        // Filter out self from connections
        setConnections(res.data.filter(conn => conn.id !== user.id));
      })
      .catch(err => {/* Error fetching connections - handled silently */});
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      // Mark messages as read when opening the conversation
      api.post(`/users/messages/with/${selectedConnection.id}/mark-read/`).then(() => {
        api.get('/users/messages/unread-count/').then(res => {
          setUnreadMessages(res.data.unread_count || 0);
        });
      }).catch(() => {});
      // Fetch message history
      api.get(`/users/messages/with/${selectedConnection.id}/`)
        .then(res => {
          // Ensure messages is always an array
          setMessages(Array.isArray(res.data) ? res.data : []);
        })
        .catch(err => {
          setMessages([]); // fallback to empty array on error
          // Error fetching messages - handled silently
        });

      // Create WebSocket connection
      const myId = user.id;
      const otherId = selectedConnection.id;
      const roomName = [myId, otherId].sort().join('_');
      // Ensure token is set
      let wsToken = token;
      if (!wsToken) {
        wsToken = localStorage.getItem('access');
      }
      socket.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${wsToken}`);

      socket.current.onopen = () => {/* WebSocket connected */};
      socket.current.onclose = () => {/* WebSocket disconnected */};
      socket.current.onerror = (err) => {/* WebSocket error - handled silently */};

      socket.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, data] : [data]);
      };

      return () => {
        socket.current.close();
      };
    }
  }, [selectedConnection, token, user.id]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (
      newMessage.trim() &&
      socket.current &&
      socket.current.readyState === 1 // 1 = OPEN
    ) {
      socket.current.send(JSON.stringify({ message: newMessage }));
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: user?.role === 'alumni' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : user?.role === 'student' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <MessageIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Messages
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Connect and communicate with your network
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Connections List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '75vh', borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              p: 3, 
              background: user?.role === 'alumni' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : user?.role === 'student' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Connections
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {connections.length} connected users
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
              {connections.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {connections.map(conn => (
                    <ListItem 
                      key={conn.id} 
                      onClick={() => setSelectedConnection(conn)}
                      sx={{ 
                        cursor: 'pointer',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: user?.role === 'alumni' ? 'primary.50' : user?.role === 'student' ? 'secondary.50' : 'warning.50',
                          transform: 'translateX(4px)'
                        },
                        bgcolor: selectedConnection?.id === conn.id 
                          ? (user?.role === 'alumni' ? 'primary.100' : user?.role === 'student' ? 'secondary.100' : 'warning.100')
                          : 'transparent',
                        transition: 'all 0.3s ease',
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5
                      }}
                    >
                      <Avatar 
                        src={conn.profile_picture} 
                        sx={{ 
                          mr: 2,
                          width: 48,
                          height: 48,
                          border: '2px solid',
                          borderColor: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main'
                        }}
                      >
                        {conn.username[0].toUpperCase()}
                      </Avatar>
                      <ListItemText 
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {conn.first_name} {conn.last_name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Chip 
                                label={conn.role === 'alumni' ? 'Alumni' : conn.role === 'student' ? 'Student' : 'Admin'}
                                color={conn.role === 'alumni' ? 'primary' : conn.role === 'student' ? 'secondary' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                              {conn.graduation_year && (
                                <Chip 
                                  icon={<SchoolIcon />}
                                  label={`Class of ${conn.graduation_year}`}
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
                              {conn.job_title ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WorkIcon fontSize="small" />
                                  {conn.job_title} {conn.company && `@ ${conn.company}`}
                                </Box>
                              ) : (
                                `@${conn.username}`
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No connections yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect with alumni and students to start messaging
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '75vh', borderRadius: 3, boxShadow: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedConnection ? (
              <>
                {/* Chat Header */}
                <Box sx={{ 
                  p: 3, 
                  background: user?.role === 'alumni' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : user?.role === 'student' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={selectedConnection.profile_picture} 
                      sx={{ 
                        width: 48,
                        height: 48,
                        border: '3px solid white'
                      }}
                    >
                      {selectedConnection.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedConnection.first_name} {selectedConnection.last_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={selectedConnection.role === 'alumni' ? 'Alumni' : selectedConnection.role === 'student' ? 'Student' : 'Admin'}
                          color={selectedConnection.role === 'alumni' ? 'primary' : selectedConnection.role === 'student' ? 'secondary' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                        {selectedConnection.graduation_year && (
                          <Chip 
                            icon={<SchoolIcon />}
                            label={`Class of ${selectedConnection.graduation_year}`}
                            variant="outlined"
                            size="small"
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto', 
                  p: 2,
                  background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
                }}>
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMine = msg.sender.id === user.id;
                      return (
                        <Box 
                          key={msg.id || msg.timestamp} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                            mb: 2 
                          }}
                        >
                          <Box sx={{
                            maxWidth: { xs: '85%', sm: '70%' },
                            p: 2,
                            borderRadius: 3,
                            bgcolor: isMine 
                              ? (user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main')
                              : 'grey.100',
                            color: isMine ? 'white' : 'text.primary',
                            boxShadow: 2,
                            position: 'relative',
                            '&::before': isMine ? {
                              content: '""',
                              position: 'absolute',
                              bottom: -8,
                              right: 20,
                              width: 0,
                              height: 0,
                              borderLeft: '8px solid transparent',
                              borderRight: '8px solid transparent',
                              borderTop: `8px solid ${user?.role === 'alumni' ? '#667eea' : user?.role === 'student' ? '#667eea' : '#f093fb'}`
                            } : {
                              content: '""',
                              position: 'absolute',
                              bottom: -8,
                              left: 20,
                              width: 0,
                              height: 0,
                              borderLeft: '8px solid transparent',
                              borderRight: '8px solid transparent',
                              borderTop: '8px solid #e0e0e0'
                            }
                          }}>
                            <Typography variant="body1" sx={{ mb: 0.5 }}>
                              {msg.content}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.7, 
                                display: 'block',
                                fontSize: '0.75rem'
                              }}
                            >
                              {isMine ? (msg.read ? 'Seen' : 'Sent') : ''}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Start the conversation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Send your first message to {selectedConnection.first_name}
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box component="form" onSubmit={handleSendMessage} sx={{ 
                  p: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  background: 'white'
                }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      autoComplete="off"
                      multiline
                      maxRows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'grey.50'
                        }
                      }}
                    />
                    <Tooltip title="Send Message">
                      <IconButton 
                        type="submit" 
                        sx={{ 
                          bgcolor: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main',
                          color: 'white',
                          borderRadius: 2,
                          p: 1.5,
                          '&:hover': {
                            bgcolor: user?.role === 'alumni' ? 'primary.dark' : user?.role === 'student' ? 'secondary.dark' : 'warning.dark',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
              }}>
                <MessageIcon sx={{ fontSize: 96, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                <Typography variant="h4" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Select a connection to start chatting
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                  Choose someone from your connections list to begin your conversation
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagesPage; 