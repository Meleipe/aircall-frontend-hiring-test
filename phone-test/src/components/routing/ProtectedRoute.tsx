import { useAuth } from '../../hooks';
import { useLocalStorage } from '../../hooks';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggingIn, logout } = useAuth();
  const [accessToken] = useLocalStorage('access_token', undefined);

  if (!isLoggingIn && !accessToken) {
    logout();
  }
  return <>{children}</>;
};
