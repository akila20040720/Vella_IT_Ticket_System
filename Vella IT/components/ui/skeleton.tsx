import { cn } from '@/utils/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80', className)} {...props} />
}

export { Skeleton }