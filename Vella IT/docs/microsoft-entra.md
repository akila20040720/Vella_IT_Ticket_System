# Microsoft Entra ID Setup

1. Register a new application in Microsoft Entra ID.
2. Add a web redirect URI for your Supabase auth callback.
3. Configure the application secret and tenant details in Supabase Auth.
4. Enable the Microsoft/Azure identity provider in Supabase and map it to the company tenant.
5. Use company email addresses only.
6. Put IT team addresses into `ADMIN_EMAILS` so the app can route them to the admin dashboard.

## Required values

- Tenant ID
- Client ID
- Client Secret
- Redirect URI in Supabase

## Expected flow

- User clicks Microsoft sign-in.
- Supabase returns the session to `/api/auth/callback`.
- The app syncs the user profile and routes admins to `/admin/dashboard`.
- Everyone else is sent to `/dashboard`.
