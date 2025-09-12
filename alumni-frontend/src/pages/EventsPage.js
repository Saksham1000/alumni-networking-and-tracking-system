import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Grid } from '@mui/material';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { AuthContext } from '../context/AuthContext';

function EventsPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [formError, setFormError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/events/');
      setEvents(res.data);
    } catch (err) {
      let msg = 'Failed to fetch events';
      if (err.response) {
        if (typeof err.response.data === 'string' && err.response.data.startsWith('<')) {
          msg += ': Server error or permission denied.';
        } else if (typeof err.response.data === 'object') {
          msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRSVP = async (id, status) => {
    try {
      await api.post(`/events/${id}/rsvp/`, { status });
      await fetchEvents();
    } catch (err) {
      let msg = `Failed to update RSVP for event ${id}. Please try again.`;
      if (err.response && err.response.data && err.response.data.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
    }
  };

  const handleOpen = (event = null) => {
    setEditEvent(event);
    setForm(event ? { ...event, date: event.date?.slice(0, 16) } : { title: '', description: '', date: '', location: '' });
    setFormError('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editEvent) {
        await api.put(`/events/${editEvent.id}/`, form);
      } else {
        await api.post('/events/', form);
      }
      setOpen(false);
      fetchEvents();
    } catch {
      setFormError('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}/`);
      fetchEvents();
    } catch {}
  };

  return (
    <Container sx={{ mt: 8, minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4, borderRadius: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Events
      </Typography>
      {isAdmin && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Create Event</Button>
        </Box>
      )}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && events.length === 0 && <Typography align="center">No events found.</Typography>}
      <Box sx={{ mt: 2, maxWidth: 900, mx: 'auto' }}>
        <Grid container spacing={4}>
            {events.map(event => (
                <Grid item xs={12} md={6} lg={4} key={event.id}>
                    <EventCard 
                      event={event} 
                      onRSVP={handleRSVP} 
                      currentUser={user} 
                      onEdit={() => handleOpen(event)} 
                      onDelete={handleDelete}
                    />
                </Grid>
            ))}
        </Grid>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error">{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, minWidth: 350 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth margin="normal" required />
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth margin="normal" required multiline rows={2} />
            <TextField label="Date & Time" name="date" type="datetime-local" value={form.date} onChange={handleFormChange} fullWidth margin="normal" required />
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} fullWidth margin="normal" required />
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default EventsPage; 