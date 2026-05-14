'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, LogIn } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supportHighlights } from '@/utils/ticket-options'
import { toast } from 'sonner'

export function LoginCard() {
  const [pending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = () => {
    startTransition(async () => {
      setErrorMessage(null)
      const supabase = createSupabaseBrowserClient()
      const redirectTo = `${window.location.origin}/api/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo,
          scopes: 'openid profile email User.Read',
        },
      })

      if (error) {
        const message = error.message || 'Unable to start Microsoft sign-in.'
        setErrorMessage(message)
        toast.error(message)
      }
    })
  }

  return (
    <Card className="border-white/10 bg-white/95 text-slate-950 shadow-soft backdrop-blur dark:bg-slate-950/90 dark:text-slate-50">
      <CardHeader>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Sign in to VELLA IT SUPPORT</CardTitle>
        <CardDescription>
          Use your company Microsoft account to access ticket submission, tracking, and IT admin tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {supportHighlights.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={handleLogin} disabled={pending}>
          <LogIn className="mr-2 h-4 w-4" />
          {pending ? 'Redirecting to Microsoft...' : 'Continue with Microsoft'}
        </Button>
      </CardFooter>
    </Card>
  )
}