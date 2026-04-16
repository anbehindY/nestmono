'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { saveToken } from '../../lib/auth';
import { Alert, Button, Card, Input, Label } from '../../components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name: name || undefined, password }),
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
            Create your account
          </h1>
          <p className="text-sm text-ink-muted dark:text-slate-400">
            It takes less than a minute.
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
            <Label htmlFor="name">
              Display name <span className="text-ink-subtle">(optional)</span>
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading} className="w-full">
            <UserPlus className="h-4 w-4" />
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
