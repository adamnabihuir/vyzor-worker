'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'starter' | 'growth' | 'enterprise';
}

const DEMO_USER: User = {
  id: 'usr_01',
  name: 'Adam Bac',
  email: 'adam@vanguard.io',
  company: 'Vyzor Security',
  plan: 'growth',
};

export function login(email: string, password: string): User | null {
  if (!email || !password) return null;
  localStorage.setItem('vanguard_user', JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export function register(name: string, email: string, company: string, password: string): User | null {
  if (!name || !email || !password) return null;
  const user: User = { id: 'usr_' + Date.now(), name, email, company, plan: 'starter' };
  localStorage.setItem('vanguard_user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem('vanguard_user');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('vanguard_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getUser();
}
