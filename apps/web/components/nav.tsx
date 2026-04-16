'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, LogIn, LogOut, PenSquare, UserPlus } from 'lucide-react';
import { clearToken, getToken } from '../lib/auth';
import { cn } from './ui';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  function logout() {
    clearToken();
    setAuthed(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-surface/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 w-full max-w-container items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-ink transition-colors hover:text-brand dark:text-slate-100">
          <FileText className="h-5 w-5" />
          <span className="font-serif text-lg font-semibold tracking-tight">nestmono</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/" active={pathname === '/'} icon={<FileText className="h-4 w-4" />}>
            Feed
          </NavLink>
          {authed ? (
            <>
              <NavLink href="/posts" active={pathname === '/posts'} icon={<PenSquare className="h-4 w-4" />}>
                Write
              </NavLink>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" active={pathname === '/login'} icon={<LogIn className="h-4 w-4" />}>
                Login
              </NavLink>
              <NavLink href="/register" active={pathname === '/register'} icon={<UserPlus className="h-4 w-4" />} primary>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  primary,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  primary?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer',
        primary
          ? 'bg-brand text-white hover:bg-brand-hover'
          : active
            ? 'bg-surface-muted text-ink dark:bg-slate-800 dark:text-slate-100'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
