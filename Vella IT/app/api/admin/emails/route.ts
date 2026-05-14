import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getCurrentProfile } from '@/services/auth'

const DATA_DIR = join(process.cwd(), 'data')
const EMAILS_FILE = join(DATA_DIR, 'emails.json')

interface EmailRecord {
	email: string
	timestamp: string
	sessionId?: string
}

export async function GET(request: NextRequest) {
	try {
		// Check if user is admin
		const profile = await getCurrentProfile()

		if (!profile || profile.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
		}

		if (!existsSync(EMAILS_FILE)) {
			return NextResponse.json({ emails: [], count: 0 }, { status: 200 })
		}

		const data = await readFile(EMAILS_FILE, 'utf-8')
		const emails: EmailRecord[] = JSON.parse(data)

		return NextResponse.json(
			{
				emails,
				count: emails.length,
				lastUpdated: new Date(),
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error reading emails:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const profile = await getCurrentProfile()

		if (!profile || profile.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const email = searchParams.get('email')

		if (!email) {
			return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
		}

		if (!existsSync(EMAILS_FILE)) {
			return NextResponse.json({ error: 'No emails found' }, { status: 404 })
		}

		const data = await readFile(EMAILS_FILE, 'utf-8')
		const emails: EmailRecord[] = JSON.parse(data)

		const filteredEmails = emails.filter((e) => e.email.toLowerCase() !== email.toLowerCase())

		if (filteredEmails.length === emails.length) {
			return NextResponse.json({ error: 'Email not found' }, { status: 404 })
		}

		const { writeFile } = await import('fs/promises')
		await writeFile(EMAILS_FILE, JSON.stringify(filteredEmails, null, 2), 'utf-8')

		return NextResponse.json({ success: true, message: `Deleted ${email}` }, { status: 200 })
	} catch (error) {
		console.error('Error deleting email:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
