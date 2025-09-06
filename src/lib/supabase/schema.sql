-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'family', 'friend');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE help_item_type AS ENUM ('task', 'counter', 'registry_link', 'necessity');
CREATE TYPE vault_recipient AS ENUM ('parents', 'baby', 'family');
CREATE TYPE vault_entry_type AS ENUM ('letter', 'photo', 'recommendation', 'memory');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'friend',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  invite_token TEXT UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom timeline collections (admin-created narratives)
CREATE TABLE timelines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events (organizational structure for media)
CREATE TABLE timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  timeline_id UUID REFERENCES timelines(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media files with flexible tagging
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL, -- Supabase storage URL
  thumbnail_url TEXT, -- Optimized thumbnail
  caption TEXT,
  media_type media_type DEFAULT 'image',
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  timeline_event_id UUID REFERENCES timeline_events(id) ON DELETE SET NULL,
  age_tag TEXT, -- "0-3", "3-6", "6-12", etc.
  tags TEXT[], -- Array of custom tags
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text-based stories and anecdotes
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  timeline_event_id UUID REFERENCES timeline_events(id) ON DELETE SET NULL,
  age_tag TEXT,
  story_date DATE,
  tags TEXT[],
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help coordination system
CREATE TABLE help_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type help_item_type NOT NULL,
  category TEXT, -- 'cleaning', 'building', 'products', 'meals', etc.
  target_count INTEGER, -- For counter items
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  external_url TEXT, -- For registry links
  priority INTEGER DEFAULT 0, -- For ordering
  due_date DATE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help item interactions (who helped with what)
CREATE TABLE help_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  help_item_id UUID REFERENCES help_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL, -- 'increment', 'complete', 'volunteer'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault entries (letters, photos, recommendations)
CREATE TABLE vault_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of Supabase storage URLs
  recipient vault_recipient NOT NULL,
  entry_type vault_entry_type NOT NULL,
  category TEXT, -- 'restaurant', 'movie', 'activity', etc. for recommendations
  prompt_answered TEXT, -- Which prompt this responds to
  tags TEXT[],
  author_id UUID REFERENCES profiles(id) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE, -- Only visible to admins until reveal
  reveal_date DATE, -- When to make visible to recipients
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments system for media and stories
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  vault_entry_id UUID REFERENCES vault_entries(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (media_id IS NOT NULL AND story_id IS NULL AND vault_entry_id IS NULL) OR
    (media_id IS NULL AND story_id IS NOT NULL AND vault_entry_id IS NULL) OR
    (media_id IS NULL AND story_id IS NULL AND vault_entry_id IS NOT NULL)
  )
);

-- Announcements for the hero page
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0, -- Higher numbers appear first
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ entries
CREATE TABLE faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT, -- 'hospital', 'visitation', 'general', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for tracking user actions
CREATE TABLE activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'media', 'story', 'help_item', etc.
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_invite_token ON profiles(invite_token);
CREATE INDEX idx_timelines_sort_order ON timelines(sort_order);
CREATE INDEX idx_timeline_events_timeline_id ON timeline_events(timeline_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date);
CREATE INDEX idx_media_timeline_event_id ON media(timeline_event_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_upload_date ON media(upload_date);
CREATE INDEX idx_stories_timeline_event_id ON stories(timeline_event_id);
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_help_items_completed ON help_items(completed);
CREATE INDEX idx_help_items_category ON help_items(category);
CREATE INDEX idx_vault_entries_recipient ON vault_entries(recipient);
CREATE INDEX idx_vault_entries_entry_type ON vault_entries(entry_type);
CREATE INDEX idx_vault_entries_is_private ON vault_entries(is_private);
CREATE INDEX idx_comments_media_id ON comments(media_id);
CREATE INDEX idx_comments_story_id ON comments(story_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_announcements_is_active ON announcements(is_active, priority);
CREATE INDEX idx_faqs_category ON faqs(category, sort_order);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON timeline_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_help_items_updated_at BEFORE UPDATE ON help_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vault_entries_updated_at BEFORE UPDATE ON vault_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();