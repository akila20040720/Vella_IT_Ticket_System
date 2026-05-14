# Vercel Deployment

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add every value from `.env.example` to the Vercel environment settings.
4. Mark the Graph and Supabase service role variables as server-only secrets.
5. Set the production URL as the redirect target in Supabase and Microsoft Entra.
6. Deploy.

## Post-deploy checks

- Microsoft login redirects correctly.
- Admin users land on `/admin/dashboard`.
- Normal users land on `/dashboard`.
- Ticket creation writes to Supabase and uploads files to storage.
- Graph mail can be sent from the backend using the configured sender account.
