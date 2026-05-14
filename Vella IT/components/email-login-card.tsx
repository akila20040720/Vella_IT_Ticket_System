'use client'

import { useState, useTransition } from 'react'
import { Mail, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function EmailLoginCard() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [pending, startTransition] = useTransition()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const handleEmailLogin = () => {
		if (!email) {
			setErrorMessage('Please enter your email')
			return
		}

		startTransition(async () => {
			setErrorMessage(null)
			try {
				const response = await fetch('/api/auth/email-login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email }),
				})

				const data = await response.json()

				if (!response.ok) {
					const message = data.error || 'Email login failed'
					setErrorMessage(message)
					toast.error(message)
					return
				}

				toast.success('Email registered! Redirecting to dashboard...')
				setTimeout(() => {
					router.push('/dashboard')
				}, 1000)
			} catch (error) {
				const message = error instanceof Error ? error.message : 'An error occurred'
				setErrorMessage(message)
				toast.error(message)
			}
		})
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !pending) {
			handleEmailLogin()
		}
	}

	return (
		<Card className="border-white/10 bg-white/95 text-slate-950 shadow-soft backdrop-blur dark:bg-slate-950/90 dark:text-slate-50">
			<CardHeader>
				<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
					<Mail className="h-6 w-6" />
				</div>
				<CardTitle className="text-2xl">Quick Email Access</CardTitle>
				<CardDescription>Enter your email to get started - no password needed</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					<Input
						type="email"
						placeholder="your.email@company.com"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value)
							setErrorMessage(null)
						}}
						onKeyPress={handleKeyPress}
						disabled={pending}
						className="h-11 rounded-lg"
					/>
					{errorMessage && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
							{errorMessage}
						</div>
					)}
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
					<p className="font-medium text-slate-700 dark:text-slate-200">Quick access includes:</p>
					<ul className="mt-2 space-y-1">
						<li className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
							<span>Submit IT tickets</span>
						</li>
						<li className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
							<span>Track requests</span>
						</li>
					</ul>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					className="w-full bg-emerald-600 hover:bg-emerald-700"
					size="lg"
					onClick={handleEmailLogin}
					disabled={pending || !email}
				>
					{pending ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Registering...
						</>
					) : (
						<>
							<Mail className="mr-2 h-4 w-4" />
							Continue with Email
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	)
}
