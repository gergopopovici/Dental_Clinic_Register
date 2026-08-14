import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsersForAdminList, toggleUserStatus } from '../services/UserService';
import { UserManagemenetDTO } from '../models/User';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserTableProps {
  currentUserId?: number;
}

function UserTable({ currentUserId }: UserTableProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UserManagemenetDTO[]>({
    queryKey: ['adminUsers', debouncedSearch],
    queryFn: () => getAllUsersForAdminList(debouncedSearch),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setSnackbar({ open: true, message: t('success.user.status_toggled'), severity: 'success' });
    },
    onError: (error: any) => {
      console.error('Failed to toggle user status:', error);
      setSnackbar({ open: true, message: t('error.toggle_user_status'), severity: 'error' });
    },
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Paper sx={{ mt: 4, overflow: 'hidden' }}>
      <Box
        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('admin.user_management')}
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('searchUsers') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: '250px',
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          {t('error.fetch_users')}
        </Alert>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('username')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('fullName')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('email')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('role')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('status')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                {t('actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.accountNonLocked ? t('active') : t('banned')}
                      color={user.accountNonLocked ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color={user.accountNonLocked ? 'error' : 'success'}
                      size="small"
                      disabled={user.id === currentUserId || toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(user.id)}
                    >
                      {user.accountNonLocked ? t('disable') : t('enable')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="standard">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default UserTable;