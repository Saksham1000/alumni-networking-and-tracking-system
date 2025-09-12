import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'company', headerName: 'Company', width: 180 },
  { field: 'posted', headerName: 'Posted', width: 150 },
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
  { id: 1, title: 'Software Engineer', company: 'TechCorp', posted: '2025-06-20' },
  { id: 2, title: 'Marketing Manager', company: 'Marketify', posted: '2025-06-18' },
  { id: 3, title: 'Data Analyst', company: 'DataWorks', posted: '2025-06-15' },
];

const Jobs = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3}>Job Management</Typography>
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
    </Box>
  </Box>
);

export default Jobs; 