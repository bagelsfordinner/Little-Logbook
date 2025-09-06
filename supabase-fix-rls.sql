-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;  
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

-- Create more permissive policies for development
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- This is the key fix - allow service role to insert profiles
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (
  auth.role() = 'service_role' OR auth.role() = 'authenticated'
);

-- Also allow authenticated users to insert (for the trigger)
CREATE POLICY "Authenticated users can insert profiles" ON profiles FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Allow service role to update profiles (for admin operations)
CREATE POLICY "Service role can update profiles" ON profiles FOR UPDATE USING (
  auth.role() = 'service_role'
);