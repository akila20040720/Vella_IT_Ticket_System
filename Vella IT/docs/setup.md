# Supabase Setup

1. Create a new Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Reload the schema cache in Supabase after the SQL finishes if the dashboard does not refresh immediately.
4. Create the storage bucket `ticket-attachments` if you do not want the SQL to manage it.
5. Copy the project URL and anon key into `.env.local`.
6. Create a service role key and keep it server-only.
7. Confirm auth providers include Microsoft Entra ID via the Azure/Entra OIDC configuration in Supabase Auth.
8. Add your admin email addresses to `ADMIN_EMAILS`.
9. Verify row level security is enabled on every table.

## How the app uses Supabase

- Auth uses the Supabase session created from Microsoft sign-in.
- Database access is split between RLS-protected reads and service-role server routes for uploads and notifications.
- Storage uploads are written to the private `ticket-attachments` bucket.
- The `users` table is synced on login so role checks are available to the app and SQL policies.
