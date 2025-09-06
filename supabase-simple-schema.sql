-- SIMPLIFIED Little Logbook Schema
-- This removes all the complex foreign key dependencies

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS vault_entries CASCADE;
DROP TABLE IF EXISTS help_interactions CASCADE;
DROP TABLE IF EXISTS help_items CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

-- Simple users table (NOT linked to auth.users)
CREATE TABLE app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'family', 'friend')) DEFAULT 'friend',
  invited_by TEXT, -- Just store email, not foreign key
  avatar_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple invite tokens table
CREATE TABLE invite_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  display_name TEXT,
  created_by_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic content tables (simplified)
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_by_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on all tables for simplicity
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- Create first admin user (replace with your email)
INSERT INTO app_users (email, display_name, role, created_at, updated_at)
VALUES ('jackmanuelmanning@gmail.com', 'Admin User', 'admin', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Helper function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT, display_name TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.display_name, u.role
  FROM app_users u
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;