-- Create user_metrics table for tracking user statistics
CREATE TABLE IF NOT EXISTS public.user_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    transcripts_analyzed INTEGER DEFAULT 0,
    ai_insights_generated INTEGER DEFAULT 0,
    hours_saved DECIMAL(10,2) DEFAULT 0.0,
    tasks_created INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_metrics
CREATE POLICY "Users can view their own metrics" ON public.user_metrics
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'email' 
                     OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own metrics" ON public.user_metrics
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email' 
                          OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own metrics" ON public.user_metrics
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'email' 
                     OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_metrics
CREATE TRIGGER update_user_metrics_updated_at BEFORE UPDATE ON public.user_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.user_metrics TO authenticated;
GRANT ALL ON public.user_metrics TO service_role;
