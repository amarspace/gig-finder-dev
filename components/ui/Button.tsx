import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orange' | 'purple' | 'dark' | 'light';
  children: React.ReactNode;
}

export default function Button({
  variant = 'orange',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    orange: 'btn-orange',
    purple: 'btn-purple',
    dark: 'btn-dark',
    light: 'btn-light',
  };

  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
