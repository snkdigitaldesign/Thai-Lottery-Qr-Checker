-- Supabase SQL Schema for Thai Lottery Checker

-- 1. Table: draws
CREATE TABLE IF NOT EXISTS draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_date DATE UNIQUE NOT NULL,
    first_prize VARCHAR(6) NOT NULL,
    front_three TEXT[] NOT NULL, -- Array of 2 strings
    back_three TEXT[] NOT NULL,  -- Array of 2 strings
    last_two VARCHAR(2) NOT NULL,
    second_prize TEXT[] DEFAULT '{}',
    third_prize TEXT[] DEFAULT '{}',
    fourth_prize TEXT[] DEFAULT '{}',
    fifth_prize TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: check_logs
CREATE TABLE IF NOT EXISTS check_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(6) NOT NULL,
    draw_date DATE NOT NULL,
    is_winner BOOLEAN NOT NULL,
    prize_type VARCHAR, -- e.g., 'FIRST_PRIZE', 'FRONT_THREE', 'BACK_THREE', 'LAST_TWO'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR
);

-- 3. Table: user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_check_logs_date ON check_logs(draw_date);
CREATE INDEX IF NOT EXISTS idx_check_logs_winner ON check_logs(is_winner);

-- Enable Row Level Security (RLS)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'draws'
-- Public can read
CREATE POLICY "Public read access for draws" ON draws
    FOR SELECT USING (true);

-- Admin can insert/update/delete
CREATE POLICY "Admin full access for draws" ON draws
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for 'check_logs'
-- Public can insert (to log checks)
CREATE POLICY "Public can insert check_logs" ON check_logs
    FOR INSERT WITH CHECK (true);

-- Admin can read/delete
CREATE POLICY "Admin read access for check_logs" ON check_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for 'user_roles'
-- Admin can read
CREATE POLICY "Admin read access for user_roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_draws_updated_at
    BEFORE UPDATE ON draws
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
