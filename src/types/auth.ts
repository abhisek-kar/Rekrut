// Auth types
// This is a placeholder file for the type structure

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'subadmin';
}

export interface Session {
  user: User;
  expires: string;
}
