/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserDetails } from '../services/UserService';
import axios from 'axios';

interface UserDetails {
  id?: number;
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  enabled?: boolean;
  roles: string[];
}

export const useUserQuery = () => {
  const hasRefreshToken = typeof window !== 'undefined' ? !!localStorage.getItem('refresh_token') : false;

  console.log('useUserQuery: Checking for refresh_token in localStorage. Found:', hasRefreshToken);
  console.log('useUserQuery: Query enabled state:', hasRefreshToken);

  const result = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUserDetails,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasRefreshToken,
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 401 or 403 errors - let the interceptor handle
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  if (result.isError) {
    console.error('useUserQuery: Error fetching user details:', result.error);
  } else if (result.isSuccess) {
    console.log('useUserQuery: User details fetched successfully:', result.data);
  }

  return result;
};
