import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 180 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    renderCell: (params) => (
      <Box>
        <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }}>Edit</Button>
        <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Delete</Button>
        <Button size="small" variant="contained" color="primary">Approve</Button>
      </Box>
    ),
  },
];

const rows = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Alumni', status: 'Approved' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Pending' },
  { id: 3, name: 'Carol Lee', email: 'carol@example.com', role: 'Alumni', status: 'Approved' },
];

const Users = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3}>User Management</Typography>
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
    </Box>
  </Box>
);

export default Users; 