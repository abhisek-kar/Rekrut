import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  color?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ 
  className, 
  color = 'dark',
  size = 'md',
}: LogoProps) {
  const colorClass = color === 'light' ? 'text-white' : 'text-primary';
  
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <Link href="/" className={cn(
      'font-bold',
      colorClass,
      sizeClasses[size],
      className
    )}>
      <span className="font-extrabold">Rekrut</span>
      <span className="text-primary-500">ATS</span>
    </Link>
  );
}

export default Logo;
