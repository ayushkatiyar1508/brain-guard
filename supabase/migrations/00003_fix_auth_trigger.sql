-- Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create improved trigger function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  -- Check if this is a new user (INSERT) or a confirmation (UPDATE with confirmed_at change)
  IF (TG_OP = 'INSERT' AND NEW.confirmed_at IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL) THEN
    
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
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
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT (auto-confirmed users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create trigger for UPDATE (email-confirmed users)
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();