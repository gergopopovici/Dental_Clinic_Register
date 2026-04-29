import { Box, Button, Card, CardContent, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../services/UserService';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { t } = useTranslation();
  const [inviteEmail, setInviteEmail] = useState('');
  const handleSendInviteMock = () => {
    alert(t('inviteSentTo') + ` ${inviteEmail}`);
    setInviteEmail('');
  };

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
              onClick={handleSendInviteMock}
              disabled={!inviteEmail}
              sx={{ px: 4, whiteSpace: 'nowrap' }}
            >
              {t('sendInviteLink')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
export default AdminDashboard;
