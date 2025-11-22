-- Create RPC function to manually create a profile if trigger fails
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_full_name text,
  user_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  user_count int;
  new_role user_role;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Profile already exists',
      'profile_id', user_id
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Count existing users to determine role
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- First user gets admin role, others get senior
  IF user_count = 0 THEN
    new_role := 'admin'::user_role;
  ELSE
    new_role := 'senior'::user_role;
  END IF;
  
  -- Insert the profile
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (user_id, user_full_name, user_email, new_role);
  
  SELECT json_build_object(
    'success', true,
    'message', 'Profile created successfully',
    'profile_id', user_id,
    'role', new_role
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$;