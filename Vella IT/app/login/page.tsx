import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginCard } from '@/components/login-card'
import { EmailLoginCard } from '@/components/email-login-card'
import { Badge } from '@/components/ui/badge'
import { supportHighlights } from '@/utils/ticket-options'

export default function LoginPage() {
	return (
		<main className="ticket-gradient min-h-screen">
			<div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
				<section className="space-y-8">
					<Badge variant="secondary" className="w-fit px-3 py-1 text-xs uppercase tracking-[0.3em]">
						VELLA IT SUPPORT
					</Badge>
					<div className="max-w-2xl space-y-4">
						<h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
							Vella IT Support built for fast action and clear accountability.
						</h1>
						<p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
							Microsoft Entra ID sign-in, secure Supabase data services, workflow-driven dashboards, and role-aware controls for employees and the IT team.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						{supportHighlights.map((highlight) => (
							<Card key={highlight} className="border-white/40 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm">{highlight}</CardTitle>
									<CardDescription>Designed for a production Vella ITSM workflow</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</section>

				<section className="lg:sticky lg:top-8 space-y-4">
					<LoginCard />
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-slate-200 dark:border-slate-700" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-slate-100 px-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">or</span>
						</div>
					</div>
					<EmailLoginCard />
				</section>
			</div>
		</main>
	)
}
