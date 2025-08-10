# Supabase Setup for RideTrek Finance

This document provides instructions on how to set up Supabase for the RideTrek Finance application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setting up the Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `SUPABASE_SCHEMA.sql` and run it in the SQL Editor
3. This will create the `transactions` table with the proper schema

## Configuring Environment Variables

1. In your Supabase project dashboard, go to Project Settings > API
2. Copy the Project URL and place it in your `.env` file as `VITE_SUPABASE_URL`
3. Copy the anon public key and place it in your `.env` file as `VITE_SUPABASE_ANON_KEY`

Example `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing the Setup

1. Run the development server: `pnpm dev`
2. Open the application in your browser
3. Try adding a new transaction to verify the Supabase integration is working

## Security Considerations

For production use, you should:
1. Re-enable Row Level Security (RLS) policies
2. Set up Supabase Auth for user authentication
3. Configure proper RLS policies based on authenticated users
4. Review and adjust the database policies as needed for your application's requirements

Note: For demo purposes, RLS has been disabled to simplify testing without authentication.

## Troubleshooting

If you encounter issues:
1. Verify your environment variables are correctly set
2. Check the browser console for any error messages
3. Ensure your Supabase project is properly configured
4. Verify the database table was created correctly
