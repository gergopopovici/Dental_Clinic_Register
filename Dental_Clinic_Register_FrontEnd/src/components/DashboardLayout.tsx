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
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signOut } from '../services/AuthorisationService';
import { useUser } from '../context/UserContext';
import { getAvatar } from '../services/UserService';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { ThemeToggleButton } from './ThemeToggleButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout } = useUser();
  const { t } = useTranslation();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isPatient = user?.roles?.includes('ROLE_PATIENT');
  const isDoctor = user?.roles?.includes('ROLE_DOCTOR');

  const menuItems = [
    {
      label: t('dashboard'),
      path: '/dashboard',
      icon: <DashboardIcon />,
      showForAdmin: false,
      showForPatient: true,
      showForDoctor: true,
    },
    {
      label: t('appointments'),
      path: '/appointments',
      icon: <EventNoteIcon />,
      showForAdmin: false,
      showForPatient: true,
      showForDoctor: true,
    },
    {
      label: t('treatmentPlans'),
      path: '/treatment-plans',
      icon: <AssignmentIcon />,
      showForAdmin: false,
      showForPatient: true,
      showForDoctor: true,
    },
    {
      label: t('schedules'),
      path: '/schedules',
      icon: <CalendarMonthIcon />,
      showForAdmin: true,
      showForPatient: false,
      showForDoctor: true,
    },
    {
      label: t('adminPanel'),
      path: '/admin',
      icon: <DashboardIcon />,
      showForAdmin: true,
      showForPatient: false,
      showForDoctor: false,
    },
    {
      label: t('myProfile'),
      path: '/profile',
      icon: <PersonIcon />,
      showForAdmin: true,
      showForPatient: true,
      showForDoctor: true,
    },
    {
      label: t('logout'),
      icon: <LogoutIcon />,
      action: () => logoutMutation.mutate(),
      showForAdmin: true,
      showForPatient: true,
      showForDoctor: true,
    },
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, isLoading]);

  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      logout();
    },
    onError: (error) => {
      logout();
    },
  });

  if (!isLoading && !user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const userRolesDisplay =
    user?.roles && user.roles.length > 0
      ? user.roles
          .map((role) => {
            const roleKey = role.replace('ROLE_', '').toLowerCase();
            return t(roleKey);
          })
          .join(', ')
      : t('noRoles');
  const userInitials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

  const avatarUrl = getAvatar(user?.profilePictureUrl);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton sx={{ p: 0 }}>
            <Avatar
              alt="Patient Name"
              src={avatarUrl || undefined}
              sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.main' }}
            >
              {userInitials}
            </Avatar>
          </IconButton>
          <Typography variant="h6" sx={{ mb: 0.5, textAlign: 'center' }}>
            {fullName}
          </Typography>
          <Typography variant="body2">{userRolesDisplay}</Typography>
        </Box>

        <Divider />

        <List>
          {menuItems
            .filter(
              (item) =>
                (isAdmin && item.showForAdmin) ||
                (isPatient && item.showForPatient) ||
                (isDoctor && item.showForDoctor),
            )
            .map(({ label, path, icon, action }) => {
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
                  <ListItemButton selected={isActive} onClick={handleClick}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
        <Box sx={{ mt: 'auto', p: 2, display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
          <ThemeToggleButton />
          <LanguageSelector />
        </Box>
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
