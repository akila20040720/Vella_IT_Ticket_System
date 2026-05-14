import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

export function AppShell({
  title,
  description,
  children,
  action,
}: {
  title: string
  description: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-glow] text-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Asset 1.png"
              alt="Vella IT Support"
              width={160}
              height={60}
              className="h-10 w-auto"
              priority
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">VELLA IT SUPPORT</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise ticket management</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {action}
            <Button variant="outline" asChild>
              <Link href="/api/auth/logout">Sign out</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className={cn('mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8')}>
        <section className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">{description}</p>
        </section>
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Image
            src="/007e700b-0224-433c-b3b4-f0a9663e3aae.png"
            alt="Vella brand logos"
            width={2048}
            height={200}
            className="h-auto w-full"
            sizes="100vw"
          />
        </div>
      </footer>
    </div>
  )
}