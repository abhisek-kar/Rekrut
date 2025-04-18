"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button, ButtonProps } from '../shadcn-ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  redirectTo?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  redirectTo = '/auth/login',
  onLogoutStart,
  onLogoutComplete,
  children,
  ...props
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onLogoutStart) onLogoutStart();
      
      await signOut({ 
        redirect: false,
        callbackUrl: redirectTo
      });
      
      toast.success('You have been logged out successfully');
      
      // Manually redirect to maintain consistent behavior
      window.location.href = redirectTo;
      
      if (onLogoutComplete) onLogoutComplete();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      {...props}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || 'Logout'}
        </>
      )}
    </Button>
  );
}
