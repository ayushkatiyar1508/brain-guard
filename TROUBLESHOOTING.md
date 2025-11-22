# Brain Guard - Troubleshooting Guide

## Application Not Opening - Quick Fixes

### Issue: Blank Screen or Application Won't Load

#### ✅ **FIXED ISSUES**
1. **React Import Error** - Changed `import React from 'react'` to `import * as React from 'react'` in App.tsx
2. **Toast System** - Updated to use correct Toaster component from `@/components/ui/toaster`

#### 🔍 **Common Causes & Solutions**

### 1. Database Not Initialized
**Symptom**: Application loads but shows errors about missing tables

**Solution**:
The database migrations need to be applied. The system should automatically apply them, but if not:
- Check that both migration files exist:
  - `supabase/migrations/00001_create_brain_guard_schema.sql`
  - `supabase/migrations/00002_add_auth_trigger.sql`
- Migrations are applied automatically when the app starts

### 2. Authentication Blocking Access
**Symptom**: Redirects to login page but login page doesn't load

**Solution**:
- The login page (`/login`) is whitelisted in the authentication system
- Check that `RequireAuth` has `whiteList={['/login']}` in App.tsx ✅ (Already configured)

### 3. Browser Console Errors
**Symptom**: Application shows blank screen

**Solution**:
1. Open browser Developer Tools (F12)
2. Check the Console tab for errors
3. Common errors and fixes:
   - **"Cannot read properties of null"** → Fixed by using `import * as React`
   - **"Module not found"** → Check that all imports are correct
   - **"Supabase error"** → Check database connection and migrations

### 4. First Time Setup
**Symptom**: Application loads but no data appears

**Solution**:
This is normal! The application starts with an empty database:
1. Go to the login page
2. Click "Sign Up" tab
3. Create the first user account (will automatically become admin)
4. Start using the application

### 5. Port Already in Use
**Symptom**: Development server won't start

**Solution**:
- The application runs on the default Vite port
- If you see "Port already in use", another process is using the port
- Stop other development servers or use a different port

## Quick Diagnostic Checklist

Run through this checklist to identify the issue:

- [ ] **Files Exist**: All required files are present
  ```bash
  ls src/pages/Login.tsx
  ls src/pages/Dashboard.tsx
  ls src/App.tsx
  ```

- [ ] **No Lint Errors**: Code compiles without errors
  ```bash
  npm run lint
  ```

- [ ] **Environment Variables**: .env file is configured
  ```bash
  cat .env | grep VITE_SUPABASE_URL
  ```

- [ ] **Dependencies Installed**: node_modules exists
  ```bash
  ls node_modules | head
  ```

- [ ] **Browser Console**: No JavaScript errors in browser console

## Step-by-Step Debugging

### Step 1: Check Application Structure
```bash
# Verify all key files exist
ls -la src/pages/
ls -la src/components/common/
ls -la supabase/migrations/
```

### Step 2: Verify Code Quality
```bash
# Run linting
npm run lint
```

### Step 3: Check Browser Console
1. Open the application in your browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for any red error messages
5. Take note of the error message and line number

### Step 4: Check Network Tab
1. In Developer Tools, go to Network tab
2. Refresh the page
3. Look for any failed requests (red status codes)
4. Check if Supabase API calls are succeeding

### Step 5: Test Authentication
1. Try to access `/login` directly
2. If login page loads, authentication routing is working
3. Try creating a test account
4. Check if you're redirected to dashboard after login

## Common Error Messages

### "Cannot read properties of null (reading 'useState')"
**Status**: ✅ FIXED
**Solution**: Changed React import to `import * as React from 'react'`

### "Module not found: Can't resolve '@/components/ui/sonner'"
**Status**: ✅ FIXED
**Solution**: Changed to use `@/components/ui/toaster` instead

### "Failed to fetch" or "Network Error"
**Cause**: Supabase connection issue
**Solution**: 
- Check `.env` file has correct `VITE_SUPABASE_URL`
- Verify internet connection
- Check Supabase project is active

### "User not found" or "Invalid credentials"
**Cause**: No user account exists yet
**Solution**: Create a new account using the Sign Up tab

### "Table does not exist"
**Cause**: Database migrations not applied
**Solution**: Migrations should apply automatically. If not, check migration files exist.

## Application Flow

Understanding the flow helps diagnose where issues occur:

```
1. User opens application
   ↓
2. App.tsx loads
   ↓
3. AuthProvider initializes
   ↓
4. RequireAuth checks authentication
   ↓
5. If not authenticated → Redirect to /login
   ↓
6. Login page loads
   ↓
7. User signs up or logs in
   ↓
8. Supabase Auth validates
   ↓
9. Database trigger creates profile
   ↓
10. User redirected to Dashboard
    ↓
11. Dashboard loads user data
```

**Where to check for issues:**
- **Step 2-3**: Check browser console for React/import errors
- **Step 4-5**: Check authentication configuration in App.tsx
- **Step 6**: Check Login.tsx for errors
- **Step 7-8**: Check network tab for Supabase API calls
- **Step 9**: Check database trigger is installed
- **Step 10-11**: Check Dashboard.tsx and API calls

## Still Having Issues?

### Check These Files

1. **src/App.tsx** - Main application entry point
   - Should use `import * as React from 'react'`
   - Should have AuthProvider with RequireAuth
   - Should use Toaster from `@/components/ui/toaster`

2. **src/pages/Login.tsx** - Login page
   - Should handle both login and signup
   - Should validate username format
   - Should use toast for notifications

3. **src/db/supabase.ts** - Database connection
   - Should export supabase client
   - Should use environment variables

4. **.env** - Environment configuration
   - Should have VITE_SUPABASE_URL
   - Should have VITE_SUPABASE_ANON_KEY
   - Should have VITE_APP_ID

### Get More Information

To get detailed error information:

1. **Browser Console**:
   - Press F12
   - Go to Console tab
   - Copy any error messages

2. **Network Tab**:
   - Press F12
   - Go to Network tab
   - Look for failed requests
   - Click on failed request to see details

3. **React DevTools**:
   - Install React Developer Tools extension
   - Check component tree
   - Look for components that failed to render

## Expected Behavior

### First Load (No Account)
1. Application redirects to `/login`
2. Login page displays with two tabs: "Login" and "Sign Up"
3. Sign Up tab is active by default
4. Form has fields: Full Name, Username, Password
5. "Create Account" button is visible

### After Creating Account
1. Toast notification: "Account created successfully"
2. Automatic redirect to `/` (Dashboard)
3. Header shows user name and logout button
4. Dashboard displays with empty data (no alerts, routines, etc.)
5. Navigation links are visible in header

### After Logging In
1. Toast notification: "Welcome back!"
2. Redirect to Dashboard
3. User-specific data loads
4. If admin: "Admin" button visible in header

## Performance Notes

- **First Load**: May take 2-3 seconds to initialize Supabase connection
- **Login/Signup**: Usually completes in 1-2 seconds
- **Page Navigation**: Should be instant (client-side routing)
- **Data Loading**: Depends on amount of data, usually < 1 second

## Security Notes

- All routes except `/login` require authentication
- Passwords are hashed and never exposed
- JWT tokens are stored securely
- Database queries use parameterized statements

---

## Quick Reference

### Key Files
- `src/App.tsx` - Main app with authentication
- `src/pages/Login.tsx` - Login/signup page
- `src/pages/Dashboard.tsx` - Main dashboard
- `src/pages/Admin.tsx` - Admin panel
- `src/db/supabase.ts` - Database connection
- `.env` - Environment configuration

### Key Commands
```bash
# Check for errors
npm run lint

# View environment
cat .env

# Check file structure
ls -la src/pages/
```

### Browser Tools
- **F12** - Open Developer Tools
- **Console Tab** - View JavaScript errors
- **Network Tab** - View API requests
- **Application Tab** - View local storage and cookies

---

**Last Updated**: 2025-11-22
**Status**: All known issues resolved ✅
