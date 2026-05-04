import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsersForAdminList, toggleUserStatus } from '../services/UserService';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserManagemenetDTO {
  id: number;
  userName: string;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
}
interface UserTableProps {
  currentUserId?: number;
}

function UserTable({ currentUserId }: UserTableProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    },
    onError: (error: any) => {
      console.error('Failed to toggle user status:', error);
      alert(t('error.toggle_user_status'));
    },
  });
  return (
    <Paper sx={{ bgcolor: '#1e1e1e', mt: 4, overflow: 'hidden' }}>
      <Box
        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {t('admin.user_management')}
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('searchUsers') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            input: { color: 'white' },
            bgcolor: '#2c2c2c',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
            minWidth: '250px',
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#aaaaaa' }} />
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
          <TableHead sx={{ bgcolor: '#2c2c2c' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('username')}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('fullName')}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('email')}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('role')}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('status')}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
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
                  <TableCell sx={{ color: 'white' }}>{user.userName}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{user.name}</TableCell>
                  <TableCell sx={{ color: '#aaaaaaa' }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" sx={{ bgcolor: '#333', color: '#90caf9' }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.enabled ? t('active') : t('banned')}
                      color={user.enabled ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color={user.enabled ? 'error' : 'success'}
                      size="small"
                      disabled={user.id === currentUserId || toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(user.id)}
                    >
                      {user.enabled ? t('disable') : t('enable')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#aaaaaa', py: 3 }}>
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default UserTable;
