// Authentication hook
// This is a placeholder file for the hook structure

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;
  
  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut
  };
}

export default useAuth;
