import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../services/UserService';
import { sendDoctorInvite } from '../services/DoctorInviteService';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { t } = useTranslation();

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError,
  } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    enabled: !!user && user.roles.includes('ROLE_ADMIN'),
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, isLoading]);

  useEffect(() => {
    if (user && !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await sendDoctorInvite({ email: inviteEmail });
      setSnackbar({
        open: true,
        message: t('success.invite.sent'),
        severity: 'success',
      });
      setInviteEmail('');
    } catch (error: any) {
      const backendErrorKey = error.response?.data?.message || error.response?.data?.error || 'error.unknown';
      setSnackbar({
        open: true,
        message: t(backendErrorKey),
        severity: 'error',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        bgcolor: 'black',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          color: 'white',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
          {t('adminPanel')}
        </Typography>
        {isStatsLoading && <CircularProgress sx={{ color: 'white' }} />}
        {isError && <Typography color="error">{t('failedToFetchAdminStats')}</Typography>}
        {stats && (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#1e1e1e', color: 'primary.main', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#90caf9', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ color: '#aaaaaa' }}>
                    {t('totalPatients')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.totalPatients || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#1e1e1e', color: 'primary.main', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <LocalHospitalIcon sx={{ fontSize: 40, color: '#90caf9', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ color: '#aaaaaa' }}>
                    {t('totalDoctors')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.totalDoctors || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#1e1e1e', color: 'primary.main', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <BlockIcon sx={{ fontSize: 40, color: '#90caf9', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ color: '#aaaaaa' }}>
                    {t('totalBannedUsers')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.bannedUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Invite Doctor Section */}
        <Paper sx={{ mt: 4, p: 3, bgcolor: '#1e1e1e', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('inviteNewDoctor')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('doctorEmailAddress')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={isInviting}
              sx={{
                input: { color: 'white' },
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendInvite}
              disabled={!inviteEmail || isInviting}
              sx={{ px: 4, whiteSpace: 'nowrap' }}
            >
              {isInviting ? <CircularProgress size={24} color="inherit" /> : t('sendInviteLink')}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;
