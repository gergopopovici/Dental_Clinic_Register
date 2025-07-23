import React, { useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signOut } from '../services/AuthorisationService'; // Assuming signOut is your logout API call
import { useUser } from '../context/UserContext'; // Your UserContext hook

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout } = useUser();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Appointments', path: '/appointments', icon: <EventNoteIcon /> },
    { label: 'My Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'Logout', icon: <LogoutIcon />, action: () => logoutMutation.mutate() },
  ];

  useEffect(() => {
    console.log('DashboardLayout useEffect: isLoading:', isLoading, 'user:', user);
    if (!isLoading && !user) {
      console.log('DashboardLayout: User is null and not loading, navigating to /login');
      navigate('/login');
    }
  }, [user, navigate, isLoading]);

  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      console.log('DashboardLayout: Logout mutation (API call) successful. Triggering frontend logout.');
      logout();
    },
    onError: (error) => {
      console.error('DashboardLayout: Logout failed (mutation onError):', error);
      logout();
    },
  });

  if (!isLoading && !user) {
    console.log('DashboardLayout: User is not authenticated or session expired. Redirecting immediately.');
    navigate('/login');
    return null;
  }

  if (isLoading) {
    console.log('DashboardLayout: User data is loading...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  const fullName = [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ');
  console.log('DashboardLayout: User found:', fullName);
  console.log('DashboardLayout: User middleName:', user?.middleName);

  const userRolesDisplay =
    user?.roles && user.roles.length > 0
      ? user.roles.map((role) => role.replace('ROLE_', '').replace(/_/g, ' ')).join(', ')
      : 'No Roles';

  const userInitials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#212121',
            color: '#ffffff',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton sx={{ p: 0 }}>
            <Avatar alt="Patient Name" sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.light' }}>
              {userInitials}
            </Avatar>
          </IconButton>
          <Typography variant="h6" sx={{ color: 'white', mb: 0.5, textAlign: 'center' }}>
            {fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {userRolesDisplay}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <List>
          {menuItems.map(({ label, path, icon, action }) => {
            const isActive = path ? location.pathname === path : false;

            const handleClick = () => {
              if (action) {
                action();
              } else if (path) {
                navigate(path);
              }
            };

            return (
              <ListItem key={label} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={handleClick}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width:600px)': {
            marginLeft: 0,
          },
          overflowY: 'auto',
          minHeight: '100%',
        }}
      >
        {logoutMutation.isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, flexGrow: 1 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
