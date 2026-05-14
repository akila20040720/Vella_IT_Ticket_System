import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const DATA_DIR = join(process.cwd(), 'data')
const EMAILS_FILE = join(DATA_DIR, 'emails.json')

interface EmailRecord {
	email: string
	timestamp: string
	sessionId?: string
}

async function ensureDataDir() {
	if (!existsSync(DATA_DIR)) {
		const { mkdir } = await import('fs/promises')
		await mkdir(DATA_DIR, { recursive: true })
	}
}

async function getEmails(): Promise<EmailRecord[]> {
	await ensureDataDir()
	try {
		const data = await readFile(EMAILS_FILE, 'utf-8')
		return JSON.parse(data)
	} catch {
		return []
	}
}

async function saveEmails(emails: EmailRecord[]): Promise<void> {
	await ensureDataDir()
	await writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json()

		if (!email || typeof email !== 'string') {
			return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
		}

		const emails = await getEmails()

		// Check if email already exists
		const existingIndex = emails.findIndex((e) => e.email.toLowerCase() === email.toLowerCase())
		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		if (existingIndex > -1) {
			emails[existingIndex].timestamp = new Date().toISOString()
			emails[existingIndex].sessionId = sessionId
		} else {
			emails.push({
				email: email.toLowerCase(),
				timestamp: new Date().toISOString(),
				sessionId,
			})
		}

		await saveEmails(emails)

		// Set a cookie with session info
		const response = NextResponse.json(
			{
				success: true,
				message: 'Email login successful',
				sessionId,
			},
			{ status: 200 }
		)

		response.cookies.set('email_login_session', sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		})

		response.cookies.set('user_email', email, {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
		})

		return response
	} catch (error) {
		console.error('Email login error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function GET() {
	try {
		const emails = await getEmails()
		return NextResponse.json({ emails, count: emails.length })
	} catch (error) {
		console.error('Error reading emails:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
