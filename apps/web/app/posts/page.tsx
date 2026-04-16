'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { Alert, Badge, Button, Card, Input, Label, Textarea } from '../../components/ui';

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const data = await apiFetch<Post[]>('/api/posts/mine', { token });
      setPosts(data);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        router.push('/login');
      } else {
        setError(err.message);
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch('/api/posts', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify({ title, content, published }),
      });
      setTitle('');
      setContent('');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await apiFetch(`/api/posts/${id}`, { method: 'DELETE', token: getToken() });
    await load();
  }

  async function togglePublished(p: Post) {
    await apiFetch(`/api/posts/${p.id}`, {
      method: 'PATCH',
      token: getToken(),
      body: JSON.stringify({ published: !p.published }),
    });
    await load();
  }

  return (
    <main className="space-y-10 py-6">
      <section className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink dark:text-slate-100">
          Your posts
        </h1>
        <p className="text-sm text-ink-muted dark:text-slate-400">
          Draft, publish, and manage everything you've written.
        </p>
      </section>

      <Card className="p-6">
        <h2 className="font-serif text-lg font-semibold text-ink dark:text-slate-100">
          New post
        </h2>
        <form onSubmit={create} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="A short, clear title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts…"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-ink-muted dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-border text-brand focus:ring-brand cursor-pointer"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publish immediately
            </label>
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              Create post
            </Button>
          </div>
          {error && <Alert>{error}</Alert>}
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-surface-border pb-3 dark:border-slate-800">
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-slate-100">
            All posts
          </h2>
          <span className="text-sm text-ink-subtle dark:text-slate-500">
            {posts?.length ?? 0} total
          </span>
        </div>

        {posts === null ? (
          <SkeletonList />
        ) : posts.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-10 text-center">
            <FileText className="h-8 w-8 text-ink-subtle" />
            <p className="text-sm text-ink-muted dark:text-slate-400">
              Nothing here yet — write your first post above.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Card className="p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg font-semibold leading-snug text-ink dark:text-slate-100">
                            {p.title}
                          </h3>
                          <Badge tone={p.published ? 'success' : 'muted'}>
                            {p.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
                          {p.content}
                        </p>
                        <time
                          dateTime={p.createdAt}
                          className="mt-3 block text-xs text-ink-subtle dark:text-slate-500"
                        >
                          {new Date(p.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => togglePublished(p)}>
                        {p.published ? (
                          <>
                            <EyeOff className="h-4 w-4" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" /> Publish
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={() => remove(p.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Card className="p-5">
            <div className="h-5 w-1/2 animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
          </Card>
        </li>
      ))}
    </ul>
  );
}
