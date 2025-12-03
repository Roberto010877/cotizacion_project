import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

/**
 * Hook para obtener el usuario actual desde Redux
 */
export const useCurrentUser = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return user;
};

export default useCurrentUser;
