# Roomies App Scripts

This directory contains utility scripts for the Roomies application.

## Authentication Utilities

### check-orphaned-auth.ts

This script checks if a user exists in Supabase Auth but not in the users database table (orphaned user).

#### Setup

1. Create a `.env` file in the project root with your Supabase service role key:

```
SUPABASE_URL=https://hybyjgpcbcqpndxrquqv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Install dependencies if not already installed:

```bash
npm install dotenv ts-node
```

#### Usage

Run the script with an email address as an argument:

```bash
npm run check-orphaned-auth your.email@example.com
```

Or directly with ts-node:

```bash
npx ts-node scripts/check-orphaned-auth.ts your.email@example.com
```

#### Output

The script will output information about the user's status:

- If the user doesn't exist in Auth
- If the user exists in Auth but not in the database (orphaned)
- If the user exists in both Auth and the database
- Any errors encountered during the process

#### Fixing Orphaned Users

If an orphaned user is detected, the script will suggest two ways to fix it:

1. Run the SQL function in the Supabase SQL Editor:
   ```sql
   SELECT delete_user_completely('email@example.com');
   ```

2. Call the Edge Function from your application:
   ```typescript
   UserManagementService.deleteUser('email@example.com')
   ```

## Other Scripts

- `delete_user_api.js`: Server-side function for deleting users via API
- `reset-app.sh`: Resets the app state
- `reset-auth.sh`: Resets authentication state
- `restart.sh`: Restarts the app 