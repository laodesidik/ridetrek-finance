# Supabase Admin User Setup

Since the Supabase CLI is not installed, you'll need to create the admin user manually through the Supabase dashboard.

## Steps to Create Admin User

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" or "Create user"
4. Fill in the following details:
   - Email: `admin@ridetrek.local`
   - Password: `rideonom6`
   - User Metadata: Add a new field with key `role` and value `admin`
5. Save the user

## Verifying User Metadata

After creating the user, you can verify the user metadata by:

1. Going to Authentication > Users in the Supabase dashboard
2. Finding the `admin@ridetrek.local` user
3. Clicking on the user to view details
4. Checking that the user_metadata contains `{ "role": "admin" }`

## Testing Admin Login

Once the user is created:

1. Start the development server with `pnpm dev`
2. Navigate to http://localhost:5173/login
3. Enter the admin credentials:
   - Email: `admin@ridetrek.local`
   - Password: `rideonom6`
4. You should be redirected to the transactions page if login is successful

## Troubleshooting

If you encounter issues:

1. Make sure RLS policies are correctly applied to the transactions table
2. Verify that the user_metadata.role is set to "admin"
3. Check the browser console for any error messages
4. Ensure your Supabase URL and anon key in the `.env` file are correct
