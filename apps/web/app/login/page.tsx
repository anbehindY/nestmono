'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { saveToken } from '../../lib/auth';
import { Alert, Button, Card, Input, Label } from '../../components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveToken(accessToken);
      router.push('/posts');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm py-12">
      <Card className="p-8">
        <div className="mb-6 space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">
            Welcome back
          </h1>
          <p className="text-sm text-ink-muted dark:text-slate-400">
            Log in to manage your posts.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading} className="w-full">
            <LogIn className="h-4 w-4" />
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted dark:text-slate-400">
          No account?{' '}
          <Link href="/register" className="font-medium text-brand hover:text-brand-hover">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
