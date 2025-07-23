import React, { createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useUserQuery } from '../hooks/useUserQuery';

enum Gender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'MALE',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'FEMALE',
  // eslint-disable-next-line no-unused-vars
  OTHER = 'OTHER',
}

export interface UserDetails {
  id?: number;
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  enabled?: boolean;
  gender: Gender;
  roles: string[];
}

interface UserContextType {
  user: UserDetails | null;
  isLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  login: (user: UserDetails) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUserQuery(); // Use data directly here

  const login = (userData: UserDetails) => {
    queryClient.setQueryData(['user'], userData);
  };

  const logout = () => {
    console.log('UserContext: Executing logout function.');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
      console.log('UserContext: refresh_token cleared from localStorage.');
    }

    Cookies.remove('auth_token', { path: '/' });
    console.log('UserContext: auth_token cookie explicitly removed.');

    queryClient.cancelQueries({ queryKey: ['user'] });
    console.log('UserContext: user queries cancelled.');

    queryClient.removeQueries({ queryKey: ['user'] });
    console.log('UserContext: user data removed from react-query cache.');

    queryClient.setQueryData(['user'], null);
    console.log('UserContext: user data explicitly set to null in cache.');
    if (typeof window !== 'undefined') {
      console.log('UserContext: Forcing full page reload to /login.');
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    console.log('UserContext: Invalidating user query to refresh user data.');
    await queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <UserContext.Provider value={{ user: user ?? null, isLoading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
