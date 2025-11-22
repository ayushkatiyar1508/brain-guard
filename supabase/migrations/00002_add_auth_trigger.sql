/*
# Add Authentication Trigger

## Overview
This migration adds a trigger to automatically create a profile when a user signs up through Supabase Auth.

## Changes
1. Create trigger function `handle_new_user()`
   - Automatically creates profile entry when user is confirmed
   - First user gets 'admin' role
   - Subsequent users get 'senior' role by default
   - Transfers email/phone from auth.users to profiles

2. Create trigger `on_auth_user_confirmed`
   - Fires after user confirmation in auth.users
   - Calls handle_new_user() function

## Security
- Function uses SECURITY DEFINER to bypass RLS
- Only triggers on user confirmation
- Prevents duplicate profile creation
*/

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  -- Only insert into profiles after user is confirmed (don't change this condition)
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing users in profiles table
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Insert into profiles, first user gets admin role
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
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();