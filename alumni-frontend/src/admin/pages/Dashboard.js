import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Users', value: 1200, icon: <PeopleIcon color="primary" /> },
  { label: 'Events', value: 34, icon: <EventIcon color="primary" /> },
  { label: 'Jobs', value: 18, icon: <WorkIcon color="info" /> },
  { label: 'RSVPs', value: 210, icon: <BarChartIcon color="warning" /> },
];

const data = [
  { name: 'Jan', users: 200, events: 5 },
  { name: 'Feb', users: 300, events: 8 },
  { name: 'Mar', users: 400, events: 12 },
  { name: 'Apr', users: 300, events: 7 },
  { name: 'May', users: 500, events: 10 },
];

const Dashboard = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3}>Overview</Typography>
    <Grid container spacing={3} mb={4}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.label}>
          <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 2 }}>
            <Box sx={{ mr: 2 }}>{stat.icon}</Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{stat.label}</Typography>
              <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card sx={{ p: 3, boxShadow: 2 }}>
      <Typography variant="h6" mb={2}>User & Event Growth</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#1976d2" name="Users" />
          <Bar dataKey="events" fill="#00b4d8" name="Events" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </Box>
);

export default Dashboard; 