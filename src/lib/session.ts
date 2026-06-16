import { cookies } from 'next/headers';

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('next-auth.session-token') || 
                        cookieStore.get('__Secure-next-auth.session-token');
  
  if (!sessionCookie) {
    return { user: null };
  }

  // In production this would verify the JWT/session
  // For now return a placeholder
  return {
    user: {
      id: '1',
      name: 'Usuario',
      email: 'usuario@onenation.com',
      role: 'admin',
    },
  };
}
