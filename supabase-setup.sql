-- Supabase Database Schema for Meeting Actioner

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting_insights table
CREATE TABLE IF NOT EXISTS meeting_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    decisions JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    follow_up_email JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table for future task management
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT,
    meeting_insight_id UUID REFERENCES meeting_insights(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_processed ON transcripts(processed);
CREATE INDEX IF NOT EXISTS idx_meeting_insights_user_id ON meeting_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_insights_transcript_id ON meeting_insights(transcript_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Enable Row Level Security (RLS)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transcripts
CREATE POLICY "Users can view their own transcripts" ON transcripts
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own transcripts" ON transcripts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own transcripts" ON transcripts
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own transcripts" ON transcripts
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for meeting_insights
CREATE POLICY "Users can view their own meeting insights" ON meeting_insights
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own meeting insights" ON meeting_insights
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own meeting insights" ON meeting_insights
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own meeting insights" ON meeting_insights
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_insights_updated_at BEFORE UPDATE ON meeting_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
