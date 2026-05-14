import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const sessionId = request.cookies.get('email_login_session')?.value
		const userEmail = request.cookies.get('user_email')?.value

		if (!sessionId || !userEmail) {
			return NextResponse.json({ authenticated: false }, { status: 200 })
		}

		return NextResponse.json(
			{
				authenticated: true,
				email: userEmail,
				sessionId,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error checking email login status:', error)
		return NextResponse.json({ authenticated: false }, { status: 200 })
	}
}

export async function POST(request: NextRequest) {
	try {
		// Logout endpoint
		const response = NextResponse.json({ success: true, message: 'Logged out' }, { status: 200 })

		response.cookies.delete('email_login_session')
		response.cookies.delete('user_email')

		return response
	} catch (error) {
		console.error('Error during logout:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
