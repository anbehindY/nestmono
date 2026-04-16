'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Heart, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { getToken } from '../lib/auth';
import { Alert, Badge, Card, cn } from '../components/ui';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author?: { id: number; email: string; name?: string | null };
  _count?: { likes: number };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Post[]>('/api/posts')
      .then(setPosts)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="space-y-12">
      <section className="space-y-4 py-10">
        <Badge tone="default">
          <Sparkles className="mr-1 h-3 w-3" /> MVP
        </Badge>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl dark:text-slate-50">
          A tiny content platform
        </h1>
        <p className="max-w-2xl text-base text-ink-muted sm:text-lg dark:text-slate-400">
          Write posts, publish or keep them as drafts. Built on NestJS, Next.js, and Postgres.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-surface-border pb-3 dark:border-slate-800">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">
            Latest posts
          </h2>
          <span className="text-sm text-ink-subtle dark:text-slate-500">
            {posts?.length ?? 0} published
          </span>
        </div>

        {error && <Alert>{error}</Alert>}

        {posts === null ? (
          <SkeletonList />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post._count?.likes ?? 0);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      const res = await apiFetch<{ likes: number }>(`/api/posts/${post.id}/like`, {
        method: next ? 'POST' : 'DELETE',
        token,
      });
      setCount(res.likes);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="h-full p-5 transition-shadow hover:shadow-pop">
      <article className="flex h-full flex-col gap-3">
        <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight text-ink dark:text-slate-100">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm text-ink-muted dark:text-slate-400">
          {post.content}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-ink-subtle dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span>{post.author?.name ?? post.author?.email}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>
          <button
            onClick={toggle}
            disabled={busy}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike post' : 'Like post'}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors cursor-pointer',
              liked
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              busy && 'opacity-60',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
            {count}
          </button>
        </div>
      </article>
    </Card>
  );
}

function SkeletonList() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <li key={i}>
          <Card className="p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-surface-muted dark:bg-slate-800" />
          </Card>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <FileText className="h-10 w-10 text-ink-subtle" />
      <p className="text-sm text-ink-muted dark:text-slate-400">
        No posts yet. Be the first to publish.
      </p>
      <Link
        href="/register"
        className="text-sm font-medium text-brand hover:text-brand-hover"
      >
        Create an account →
      </Link>
    </Card>
  );
}
