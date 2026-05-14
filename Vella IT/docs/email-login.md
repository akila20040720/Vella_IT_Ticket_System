# Email Login Feature

## Overview

The email login feature allows users to quickly access the ticketing system with just their email address - no password or authentication required. Emails are stored in a local JSON file for tracking and admin visibility.

## Features

- **Quick Email Entry**: Users can enter their email and get immediate access
- **No Authentication Needed**: Simple email-based access without passwords
- **JSON Storage**: All emails are stored in `data/emails.json`
- **Session Tracking**: Each login creates a unique session ID
- **Admin Dashboard**: Admins can view and manage all registered emails via the admin API
- **Auto-redirect**: Users are automatically redirected to the dashboard after email submission

## User Experience

### Login Page
Users see two login options on `/login`:
1. **Microsoft Entra ID** - For authenticated organization users
2. **Quick Email Access** - For quick email-based access

### Email Login Flow
1. User enters their email address on the login page
2. Email is validated (format check)
3. Session is created with a unique `sessionId`
4. Cookies are set:
   - `email_login_session` (secure, httpOnly)
   - `user_email` (accessible to client)
5. User is redirected to `/dashboard`

## API Endpoints

### 1. Email Login
**POST** `/api/auth/email-login`

Request:
```json
{
  "email": "user@company.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Email login successful",
  "sessionId": "session_1234567890_abc123"
}
```

### 2. Email Login Status
**GET** `/api/auth/email-status`

Response (authenticated):
```json
{
  "authenticated": true,
  "email": "user@company.com",
  "sessionId": "session_1234567890_abc123"
}
```

Response (not authenticated):
```json
{
  "authenticated": false
}
```

### 3. Email Logout
**POST** `/api/auth/email-status`

Clears email login session and cookies.

### 4. View All Registered Emails (Admin Only)
**GET** `/api/admin/emails`

Requires admin role. Response:
```json
{
  "emails": [
    {
      "email": "user1@company.com",
      "timestamp": "2024-05-14T10:30:00.000Z",
      "sessionId": "session_1234567890_abc123"
    },
    {
      "email": "user2@company.com",
      "timestamp": "2024-05-14T11:00:00.000Z",
      "sessionId": "session_1234567891_def456"
    }
  ],
  "count": 2,
  "lastUpdated": "2024-05-14T11:05:00.000Z"
}
```

### 5. Delete Email from Records (Admin Only)
**DELETE** `/api/admin/emails?email=user@company.com`

Requires admin role.

## Data Storage

### Location
Emails are stored in: `data/emails.json`

### Structure
```json
[
  {
    "email": "user@company.com",
    "timestamp": "2024-05-14T10:30:00.000Z",
    "sessionId": "session_1234567890_abc123"
  }
]
```

### Privacy
- The `data/` directory is in `.gitignore` and won't be committed to version control
- `emails.json` is created automatically on first email submission
- File permissions should be managed according to your security requirements

## Components

### EmailLoginCard Component
Location: `components/email-login-card.tsx`

A React component that provides the email login interface. Features:
- Email input validation
- Error handling with toast notifications
- Loading state during submission
- Auto-redirect to dashboard on success
- Keyboard support (Enter to submit)

### Updated Login Page
Location: `app/login/page.tsx`

Now displays both:
- Microsoft Entra login option
- Email login option with visual separator

## Security Considerations

1. **Email Validation**: Basic email format validation is performed
2. **Session Management**: Each login gets a unique session ID with expiry (7 days)
3. **Cookies**: Secure, httpOnly flags set in production
4. **Admin Access**: Email list API is restricted to admin users only
5. **No Password Storage**: No passwords are stored or transmitted

## Environment Variables

No new environment variables are required for email login. It works out of the box after deployment.

## Development

### Testing Email Login
1. Go to `http://localhost:3000/login`
2. Enter any valid email address in the "Quick Email Access" section
3. Click "Continue with Email"
4. You'll be redirected to `/dashboard` with the email session active

### Checking Stored Emails
1. Ensure you're logged in as an admin user
2. Make a request to `/api/admin/emails`
3. View all registered emails with timestamps and session IDs

### Clearing Email Sessions
1. Delete the `data/emails.json` file
2. The directory will be recreated on the next email submission

## Deployment

When deploying to Vercel or other platforms:
1. The `data/` directory will be created automatically
2. In serverless environments, data is ephemeral - consider migrating to a database for persistence
3. Ensure the deployment platform allows file system writes to the project directory

## Future Enhancements

Consider adding:
- Email verification (confirmation link)
- Persistent database storage instead of JSON files
- Email templates for notifications
- Rate limiting on email submissions
- Export/backup functionality for email records
