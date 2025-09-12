import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'date', headerName: 'Date', width: 150 },
  { field: 'location', headerName: 'Location', width: 180 },
  { field: 'audience', headerName: 'Audience', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    renderCell: (params) => (
      <Box>
        <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }}>Edit</Button>
        <Button size="small" variant="outlined" color="error">Delete</Button>
      </Box>
    ),
  },
];

const rows = [
  { id: 1, title: 'Alumni Meetup', date: '2025-07-10', location: 'Main Hall', audience: 'Alumni' },
  { id: 2, title: 'Career Fair', date: '2025-08-15', location: 'Auditorium', audience: 'Both' },
  { id: 3, title: 'Student Orientation', date: '2025-09-01', location: 'Room 101', audience: 'Student' },
];

const Events = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3}>Event Management</Typography>
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
    </Box>
  </Box>
);

export default Events; 