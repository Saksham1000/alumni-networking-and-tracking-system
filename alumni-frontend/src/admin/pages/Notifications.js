import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'message', headerName: 'Message', width: 300 },
  { field: 'user', headerName: 'User', width: 180 },
  { field: 'date', headerName: 'Date', width: 180 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    renderCell: (params) => (
      <Box>
        <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }}>Mark as Read</Button>
        <Button size="small" variant="outlined" color="error">Delete</Button>
      </Box>
    ),
  },
];

const rows = [
  { id: 1, message: 'New user registered', user: 'Alice', date: '2025-07-01' },
  { id: 2, message: 'Event RSVP: Bob', user: 'Bob', date: '2025-07-01' },
  { id: 3, message: 'Job posted: Data Analyst', user: 'Carol', date: '2025-06-30' },
];

const Notifications = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3}>Notifications</Typography>
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
    </Box>
  </Box>
);

export default Notifications; 