# Brain Guard - Authentication Guide

## Overview

Brain Guard now includes a complete authentication system with user login, signup, and role-based access control. The first user to sign up automatically becomes the administrator.

## Authentication Features

### 1. Login System
- **Username/Password Authentication**: Users log in with a username (not email)
- **Automatic Email Suffix**: Usernames are converted to emails with `@miaoda.com` suffix
- **No Email Verification**: Users can log in immediately after signup
- **Secure Password Storage**: Passwords are hashed and stored securely by Supabase Auth

### 2. User Roles
The system supports four user roles:
- **Admin**: Full access to all features + user management dashboard
- **Senior**: Primary monitored users
- **Caregiver**: Family members who monitor seniors
- **Healthcare**: Healthcare professionals

### 3. First User Privilege
- The **first user** to sign up automatically receives the **admin** role
- All subsequent users receive the **senior** role by default
- Admins can change user roles through the Admin Dashboard

## How to Use

### For End Users

#### Creating an Account
1. Open the application
2. You'll be redirected to the Login page
3. Click the **Sign Up** tab
4. Fill in the form:
   - **Full Name**: Your complete name
   - **Username**: Choose a username (letters, numbers, underscores only)
   - **Password**: At least 6 characters
5. Click **Create Account**
6. You'll be automatically logged in

#### Logging In
1. Open the application
2. Enter your **Username** and **Password**
3. Click **Login**
4. You'll be redirected to the Dashboard

#### Logging Out
1. Click the **Logout** button in the header (top right)
2. You'll be redirected to the Login page

### For Administrators

#### Accessing Admin Dashboard
1. Log in with an admin account
2. Click the **Admin** button in the header
3. You'll see the Admin Dashboard with:
   - Total user count
   - User statistics by role
   - Complete user list

#### Managing Users
1. Go to Admin Dashboard
2. Find the user you want to manage
3. Click **Edit** to modify user information:
   - Change full name
   - Update email (optional)
   - Update phone (optional)
   - **Change role** (admin, senior, caregiver, healthcare)
4. Click **Save Changes**

#### Deleting Users
1. Go to Admin Dashboard
2. Find the user you want to delete
3. Click **Delete**
4. Confirm the deletion
5. The user will be permanently removed

## Technical Implementation

### Database Schema

#### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'senior',
  date_of_birth date,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### User Role Enum
```sql
CREATE TYPE user_role AS ENUM ('admin', 'senior', 'caregiver', 'healthcare');
```

### Authentication Trigger

The system uses a database trigger to automatically create a profile when a user signs up:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count int;
BEGIN
  -- Only insert after user is confirmed
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing users
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- First user gets admin role, others get senior role
    INSERT INTO profiles (id, full_name, email, phone, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      NEW.email,
      NEW.phone,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'senior'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Frontend Components

#### Login Page (`/login`)
- **Location**: `src/pages/Login.tsx`
- **Features**:
  - Tabbed interface (Login / Sign Up)
  - Username validation (letters, numbers, underscores)
  - Password validation (minimum 6 characters)
  - Automatic login after signup
  - Senior-friendly large buttons and text

#### Admin Dashboard (`/admin`)
- **Location**: `src/pages/Admin.tsx`
- **Access**: Admin role only
- **Features**:
  - User statistics dashboard
  - Complete user list
  - Edit user information
  - Change user roles
  - Delete users

#### Header Component
- **Location**: `src/components/common/Header.tsx`
- **Features**:
  - Shows logged-in user's name
  - Admin button (visible only to admins)
  - Logout button
  - Navigation links

### Authentication Flow

```
1. User visits application
   ↓
2. RequireAuth checks authentication
   ↓
3. If not authenticated → Redirect to /login
   ↓
4. User logs in or signs up
   ↓
5. Supabase Auth validates credentials
   ↓
6. On signup: Trigger creates profile
   ↓
7. User redirected to Dashboard
   ↓
8. Dashboard loads user-specific data
```

### Protected Routes

All routes except `/login` require authentication:

```typescript
<RequireAuth whiteList={['/login']}>
  {/* All protected content */}
</RequireAuth>
```

## Security Features

### 1. Password Security
- Passwords are hashed using bcrypt
- Stored securely in Supabase Auth
- Never exposed in API responses

### 2. Session Management
- JWT tokens for authentication
- Automatic token refresh
- Secure session storage

### 3. Role-Based Access
- Admin dashboard only accessible to admins
- User data isolated by user ID
- Database-level security with RLS (when enabled)

### 4. Input Validation
- Username format validation
- Password strength requirements
- SQL injection prevention
- XSS protection

## Configuration

### Environment Variables

The following environment variables are configured in `.env`:

```env
VITE_SUPABASE_URL=https://tzudjimuijubbssbvvlo.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_APP_ID=app-7qnt71f29kw1
VITE_LOGIN_TYPE=gmail
```

### Supabase Settings

- **Email Verification**: Disabled
- **Phone Verification**: Disabled
- **Auto-confirm Users**: Enabled
- **JWT Expiry**: Default (1 hour)

## API Functions

### Profile Management

```typescript
// Get user profile by ID
const profile = await profilesApi.getById(userId);

// Get all profiles (admin only)
const profiles = await profilesApi.getAll();

// Update profile
await profilesApi.update(userId, {
  full_name: 'New Name',
  role: 'caregiver'
});

// Delete profile
await profilesApi.delete(userId);
```

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: `${username}@miaoda.com`,
  password: password,
  options: {
    data: { full_name: fullName }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: `${username}@miaoda.com`,
  password: password
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Troubleshooting

### Issue: Can't log in after signup
**Solution**: Check that email verification is disabled in Supabase settings

### Issue: First user not getting admin role
**Solution**: Verify the trigger is properly installed:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_confirmed';
```

### Issue: Profile not created after signup
**Solution**: Check the trigger function logs and ensure it's firing correctly

### Issue: Admin button not showing
**Solution**: Verify the user's role in the profiles table:
```sql
SELECT id, full_name, role FROM profiles WHERE id = '<user-id>';
```

## Best Practices

### For Development
1. Always test with a fresh database to verify first-user admin assignment
2. Use different usernames for testing different roles
3. Never commit real user credentials to version control
4. Test logout functionality regularly

### For Production
1. Enable Row Level Security (RLS) on all tables
2. Set up proper backup procedures
3. Monitor authentication logs
4. Implement rate limiting for login attempts
5. Add password reset functionality
6. Consider adding 2FA for admin accounts

## Future Enhancements

### Potential Additions
1. **Password Reset**: Email-based password recovery
2. **Email Verification**: Optional email confirmation
3. **2FA**: Two-factor authentication for admins
4. **OAuth**: Google/Facebook login options
5. **Session Timeout**: Automatic logout after inactivity
6. **Password Policies**: Enforce stronger passwords
7. **Audit Logs**: Track user actions
8. **Bulk User Import**: CSV upload for multiple users
9. **User Invitations**: Invite users via email
10. **Profile Pictures**: Avatar upload functionality

## Support

### Common Questions

**Q: Can I change my username?**
A: No, usernames are permanent. Create a new account if needed.

**Q: How do I become an admin?**
A: Only the first user gets admin automatically. Other users must be promoted by an existing admin.

**Q: Can I have multiple admins?**
A: Yes, admins can promote other users to admin role.

**Q: What happens if I delete the only admin?**
A: Be careful! You'll need database access to create a new admin.

**Q: Is my data secure?**
A: Yes, all data is encrypted and stored securely in Supabase.

---

**Last Updated**: 2025-11-22
**Version**: 1.0.0
**Authentication System**: Supabase Auth + Custom Triggers
