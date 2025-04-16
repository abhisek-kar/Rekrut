import { NextResponse } from 'next/server';
import { initializeServer } from '@/lib/server/init';

// Run seeder when the app starts
initializeServer().catch(error => {
  console.error('Failed to initialize server:', error);
});

// This route will just respond with OK and doesn't need to be called
export async function GET() {
  return NextResponse.json({ status: 'Server initialized' });
}
