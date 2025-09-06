-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is family or admin
CREATE OR REPLACE FUNCTION is_family_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) IN ('admin', 'family');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can read all profiles, but only update their own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

-- TIMELINES POLICIES
-- All authenticated users can read timelines
-- Only admins can create/update/delete timelines
CREATE POLICY "timelines_select_all" ON timelines FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "timelines_insert_admin" ON timelines FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "timelines_update_admin" ON timelines FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "timelines_delete_admin" ON timelines FOR DELETE USING (is_admin(auth.uid()));

-- TIMELINE EVENTS POLICIES
-- All authenticated users can read events
-- Family+ can create events, admins can update/delete any, users can update their own
CREATE POLICY "timeline_events_select_all" ON timeline_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "timeline_events_insert_family" ON timeline_events FOR INSERT WITH CHECK (is_family_or_admin(auth.uid()));
CREATE POLICY "timeline_events_update_own" ON timeline_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "timeline_events_update_admin" ON timeline_events FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "timeline_events_delete_admin" ON timeline_events FOR DELETE USING (is_admin(auth.uid()));

-- MEDIA POLICIES
-- All authenticated users can read media
-- Family+ can upload media, users can update their own uploads, admins can manage all
CREATE POLICY "media_select_all" ON media FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "media_insert_family" ON media FOR INSERT WITH CHECK (is_family_or_admin(auth.uid()));
CREATE POLICY "media_update_own" ON media FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "media_update_admin" ON media FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "media_delete_own" ON media FOR DELETE USING (auth.uid() = uploaded_by);
CREATE POLICY "media_delete_admin" ON media FOR DELETE USING (is_admin(auth.uid()));

-- STORIES POLICIES
-- All authenticated users can read stories
-- Family+ can create stories, users can update their own, admins can manage all
CREATE POLICY "stories_select_all" ON stories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stories_insert_family" ON stories FOR INSERT WITH CHECK (is_family_or_admin(auth.uid()));
CREATE POLICY "stories_update_own" ON stories FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "stories_update_admin" ON stories FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "stories_delete_own" ON stories FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "stories_delete_admin" ON stories FOR DELETE USING (is_admin(auth.uid()));

-- HELP ITEMS POLICIES
-- All authenticated users can read help items
-- Family+ can create and interact with help items
-- Admins can manage all help items
CREATE POLICY "help_items_select_all" ON help_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "help_items_insert_family" ON help_items FOR INSERT WITH CHECK (is_family_or_admin(auth.uid()));
CREATE POLICY "help_items_update_family" ON help_items FOR UPDATE USING (is_family_or_admin(auth.uid()));
CREATE POLICY "help_items_delete_admin" ON help_items FOR DELETE USING (is_admin(auth.uid()));

-- HELP INTERACTIONS POLICIES
-- All authenticated users can read interactions
-- Family+ can create interactions
CREATE POLICY "help_interactions_select_all" ON help_interactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "help_interactions_insert_family" ON help_interactions FOR INSERT WITH CHECK (is_family_or_admin(auth.uid()));

-- VAULT ENTRIES POLICIES
-- Complex policy: All can create, but visibility depends on privacy settings and user role
-- Admins can see all entries
-- Users can see their own entries
-- Public entries are visible to appropriate recipients
CREATE POLICY "vault_entries_select_own" ON vault_entries FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "vault_entries_select_admin" ON vault_entries FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "vault_entries_select_public" ON vault_entries FOR SELECT USING (
  NOT is_private AND 
  auth.uid() IS NOT NULL AND
  (reveal_date IS NULL OR reveal_date <= CURRENT_DATE)
);
CREATE POLICY "vault_entries_insert_all" ON vault_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "vault_entries_update_own" ON vault_entries FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "vault_entries_update_admin" ON vault_entries FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "vault_entries_delete_own" ON vault_entries FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "vault_entries_delete_admin" ON vault_entries FOR DELETE USING (is_admin(auth.uid()));

-- COMMENTS POLICIES
-- All authenticated users can read and create comments
-- Users can update/delete their own comments, admins can manage all
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "comments_insert_all" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_update_admin" ON comments FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_admin" ON comments FOR DELETE USING (is_admin(auth.uid()));

-- ANNOUNCEMENTS POLICIES
-- All authenticated users can read announcements
-- Only admins can manage announcements
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE USING (is_admin(auth.uid()));

-- FAQS POLICIES
-- All authenticated users can read FAQs
-- Only admins can manage FAQs
CREATE POLICY "faqs_select_all" ON faqs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "faqs_insert_admin" ON faqs FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "faqs_update_admin" ON faqs FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "faqs_delete_admin" ON faqs FOR DELETE USING (is_admin(auth.uid()));

-- ACTIVITY LOG POLICIES
-- Users can read their own activity, admins can read all
CREATE POLICY "activity_log_select_own" ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_log_select_admin" ON activity_log FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "activity_log_insert_own" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name)
  VALUES (
    NEW.id,
    'friend', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;