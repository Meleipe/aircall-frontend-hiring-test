import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { LOGIN } from '../gql/mutations';
import { useLocalStorage } from './useLocalStorage';
import { useMutation } from '@apollo/client';

const AuthContext = createContext({
  login: ({ username, password }: { username: string; password: string }) => {},
  logout: () => {},
  user: {
    username: ''
  },
  isLoggingIn: undefined as boolean | typeof undefined
});

export interface AuthPRoviderProps {
  children: React.ReactNode;
}

export const AuthProvider = () => {
  const [storedUser, setStoredUser] = useLocalStorage('user', undefined);
  const [user, setUser] = useState(storedUser || { username: '' });
  const [isLoggingIn, setIsLoggingIn] = useState<boolean | typeof undefined>(undefined);
  const [accessToken, setAccessToken] = useLocalStorage('access_token', undefined);
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token', undefined);
  const [loginMutation] = useMutation(LOGIN);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = ({ username, password }: any) => {
    setIsLoggingIn(true);
    return loginMutation({
      variables: { input: { username, password } },
      onCompleted: ({ login }: any) => {
        const { access_token, refresh_token, user } = login;
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setStoredUser(user);
        setUser(user);
        setIsLoggingIn(false);
        navigate('/calls');
      }
    });
  };

  // call this function to sign out logged in user
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setStoredUser(null);
    setUser({
      username: ''
    });
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!refreshToken) {
      navigate('/login');
    }
  }, [refreshToken, navigate]);

  const value = useMemo(() => {
    return {
      user,
      login,
      logout,
      isLoggingIn
    };
  }, [user, accessToken, isLoggingIn]);

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
