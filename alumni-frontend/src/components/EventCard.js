import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, ButtonGroup } from '@mui/material';

function EventCard({ event, onRSVP, currentUser, onEdit, onDelete }) {
  const isRSVPed = currentUser && event.attendees?.some(a => a.id === currentUser.id);
  const isAdmin = currentUser?.role === 'admin';
  const isOutdated = new Date(event.date) < new Date();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {event.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {event.location}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {event.description}
        </Typography>
        <Chip label={`${event.attendees?.length || 0} going`} sx={{ mr: 1 }} />
      </CardContent>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isAdmin ? (
          <Box>
            <Button size="small" onClick={onEdit}>Edit</Button>
            <Button size="small" color="error" onClick={onDelete}>Delete</Button>
          </Box>
        ) : (
          ((event.audience === 'both' || (currentUser && event.audience === currentUser.role)) && !isOutdated) && (
            <ButtonGroup variant="contained">
              <Button 
                color={isRSVPed ? 'primary' : 'secondary'}
                onClick={() => onRSVP(event.id, 'going')}
                disabled={isRSVPed || isOutdated}
              >
                Going
              </Button>
              <Button 
                color={!isRSVPed ? 'error' : 'primary'}
                onClick={() => onRSVP(event.id, 'not going')}
                disabled={!isRSVPed || isOutdated}
              >
                Not Going
              </Button>
            </ButtonGroup>
          )
        )}
        {isOutdated && (
          <Typography variant="caption" color="error" sx={{ ml: 2 }}>
            Event has ended
          </Typography>
        )}
      </Box>
    </Card>
  );
}

export default EventCard; 