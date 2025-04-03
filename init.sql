-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for fight result types
CREATE TYPE result_type AS ENUM (
  'KNOCKOUT', 
  'TECHNICAL_KNOCKOUT',
  'SUBMISSION',
  'DECISION_UNANIMOUS',
  'DECISION_SPLIT',
  'DECISION_MAJORITY',
  'DRAW',
  'NO_CONTEST',
  'DISQUALIFICATION'
);

-- WeightClass table
CREATE TABLE weight_class (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  min_weight_kg DECIMAL(5,2) NOT NULL,
  max_weight_kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT weight_range_check CHECK (min_weight_kg < max_weight_kg)
);

-- Fighter table
CREATE TABLE fighter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  nickname VARCHAR(50),
  date_of_birth DATE,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  reach_cm INTEGER,
  nationality VARCHAR(50),
  team VARCHAR(100),
  profile_image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_height CHECK (height_cm > 0),
  CONSTRAINT valid_weight CHECK (weight_kg > 0),
  CONSTRAINT valid_reach CHECK (reach_cm > 0)
);

-- FighterStats table
CREATE TABLE fighter_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fighter_id UUID NOT NULL REFERENCES fighter(id) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  no_contests INTEGER NOT NULL DEFAULT 0,
  knockouts INTEGER NOT NULL DEFAULT 0,
  submissions INTEGER NOT NULL DEFAULT 0,
  decision_wins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT non_negative_stats CHECK (
    wins >= 0 AND 
    losses >= 0 AND 
    draws >= 0 AND 
    no_contests >= 0 AND 
    knockouts >= 0 AND 
    submissions >= 0 AND 
    decision_wins >= 0
  ),
  CONSTRAINT total_wins_match CHECK (
    wins = knockouts + submissions + decision_wins
  )
);

-- Create index on fighter_id in fighter_stats
CREATE INDEX idx_fighter_stats_fighter_id ON fighter_stats(fighter_id);

-- Event table
CREATE TABLE event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  date TIMESTAMP NOT NULL,
  venue VARCHAR(100),
  city VARCHAR(50),
  country VARCHAR(50),
  promotion VARCHAR(50) NOT NULL,
  poster_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on event date
CREATE INDEX idx_event_date ON event(date);

-- Fight table
CREATE TABLE fight (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  fighter1_id UUID NOT NULL REFERENCES fighter(id),
  fighter2_id UUID NOT NULL REFERENCES fighter(id),
  weight_class_id UUID NOT NULL REFERENCES weight_class(id),
  is_title_fight BOOLEAN NOT NULL DEFAULT FALSE,
  is_main_event BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_rounds INTEGER NOT NULL,
  actual_rounds INTEGER,
  result_type result_type,
  winner_id UUID REFERENCES fighter(id),
  finish_time TIME,
  finish_round INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT different_fighters CHECK (fighter1_id != fighter2_id),
  CONSTRAINT valid_rounds CHECK (scheduled_rounds > 0 AND scheduled_rounds <= 5),
  CONSTRAINT valid_finish_round CHECK (finish_round IS NULL OR (finish_round > 0 AND finish_round <= scheduled_rounds)),
  CONSTRAINT valid_actual_rounds CHECK (actual_rounds IS NULL OR (actual_rounds > 0 AND actual_rounds <= scheduled_rounds)),
  CONSTRAINT winner_is_fighter CHECK (winner_id IS NULL OR winner_id IN (fighter1_id, fighter2_id))
);

-- Create indexes for fight lookups
CREATE INDEX idx_fight_event_id ON fight(event_id);
CREATE INDEX idx_fight_fighter1_id ON fight(fighter1_id);
CREATE INDEX idx_fight_fighter2_id ON fight(fighter2_id);
CREATE INDEX idx_fight_weight_class_id ON fight(weight_class_id);
CREATE INDEX idx_fight_winner_id ON fight(winner_id);

-- FightDetail table for fighter performance statistics in each fight
CREATE TABLE fight_detail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fight_id UUID NOT NULL REFERENCES fight(id) ON DELETE CASCADE,
  fighter_id UUID NOT NULL REFERENCES fighter(id),
  strikes_landed INTEGER NOT NULL DEFAULT 0,
  strikes_attempted INTEGER NOT NULL DEFAULT 0,
  significant_strikes_landed INTEGER NOT NULL DEFAULT 0,
  significant_strikes_attempted INTEGER NOT NULL DEFAULT 0,
  takedowns_landed INTEGER NOT NULL DEFAULT 0,
  takedowns_attempted INTEGER NOT NULL DEFAULT 0,
  submission_attempts INTEGER NOT NULL DEFAULT 0,
  reversals INTEGER NOT NULL DEFAULT 0,
  control_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_fighter_in_fight CHECK (
    fighter_id IN (
      SELECT fighter1_id FROM fight WHERE id = fight_id
      UNION
      SELECT fighter2_id FROM fight WHERE id = fight_id
    )
  ),
  CONSTRAINT non_negative_fight_stats CHECK (
    strikes_landed >= 0 AND
    strikes_attempted >= 0 AND
    significant_strikes_landed >= 0 AND
    significant_strikes_attempted >= 0 AND
    takedowns_landed >= 0 AND
    takedowns_attempted >= 0 AND
    submission_attempts >= 0 AND
    reversals >= 0 AND
    control_time_seconds >= 0
  ),
  CONSTRAINT landed_lte_attempted_strikes CHECK (strikes_landed <= strikes_attempted),
  CONSTRAINT landed_lte_attempted_significant CHECK (significant_strikes_landed <= significant_strikes_attempted),
  CONSTRAINT landed_lte_attempted_takedowns CHECK (takedowns_landed <= takedowns_attempted),
  UNIQUE(fight_id, fighter_id)
);

-- Create index on fight_detail
CREATE INDEX idx_fight_detail_fight_id ON fight_detail(fight_id);
CREATE INDEX idx_fight_detail_fighter_id ON fight_detail(fighter_id);

-- Ranking table
CREATE TABLE ranking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fighter_id UUID NOT NULL REFERENCES fighter(id),
  weight_class_id UUID NOT NULL REFERENCES weight_class(id),
  position INTEGER NOT NULL,
  points DECIMAL(10,2) NOT NULL DEFAULT 0,
  previous_position INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_position CHECK (position > 0),
  CONSTRAINT valid_points CHECK (points >= 0),
  UNIQUE(weight_class_id, position, updated_at),
  UNIQUE(weight_class_id, fighter_id, updated_at)
);

-- Create indexes for ranking lookups
CREATE INDEX idx_ranking_fighter_id ON ranking(fighter_id);
CREATE INDEX idx_ranking_weight_class_id ON ranking(weight_class_id);
CREATE INDEX idx_ranking_updated_at ON ranking(updated_at);

-- Function to automatically update fighter statistics after a fight result is recorded
CREATE OR REPLACE FUNCTION update_fighter_stats_after_fight()
RETURNS TRIGGER AS $$
BEGIN
  -- If there's no winner (e.g., draw or no contest), we don't update win/loss records
  IF NEW.winner_id IS NOT NULL THEN
    -- Update winner stats
    IF NEW.result_type = 'KNOCKOUT' OR NEW.result_type = 'TECHNICAL_KNOCKOUT' THEN
      UPDATE fighter_stats 
      SET wins = wins + 1, knockouts = knockouts + 1, updated_at = NOW()
      WHERE fighter_id = NEW.winner_id;
    ELSIF NEW.result_type = 'SUBMISSION' THEN
      UPDATE fighter_stats 
      SET wins = wins + 1, submissions = submissions + 1, updated_at = NOW()
      WHERE fighter_id = NEW.winner_id;
    ELSIF NEW.result_type IN ('DECISION_UNANIMOUS', 'DECISION_SPLIT', 'DECISION_MAJORITY') THEN
      UPDATE fighter_stats 
      SET wins = wins + 1, decision_wins = decision_wins + 1, updated_at = NOW()
      WHERE fighter_id = NEW.winner_id;
    END IF;
    
    -- Update loser stats
    UPDATE fighter_stats 
    SET losses = losses + 1, updated_at = NOW()
    WHERE fighter_id IN (NEW.fighter1_id, NEW.fighter2_id) AND fighter_id != NEW.winner_id;
  ELSIF NEW.result_type = 'DRAW' THEN
    -- Update both fighters' draw records
    UPDATE fighter_stats 
    SET draws = draws + 1, updated_at = NOW()
    WHERE fighter_id IN (NEW.fighter1_id, NEW.fighter2_id);
  ELSIF NEW.result_type = 'NO_CONTEST' THEN
    -- Update both fighters' no contest records
    UPDATE fighter_stats 
    SET no_contests = no_contests + 1, updated_at = NOW()
    WHERE fighter_id IN (NEW.fighter1_id, NEW.fighter2_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update fighter stats after a fight is inserted
CREATE TRIGGER update_fighter_stats_trigger
AFTER INSERT ON fight
FOR EACH ROW
EXECUTE FUNCTION update_fighter_stats_after_fight();

-- Views for common queries

-- View for upcoming events
CREATE VIEW upcoming_events AS
SELECT * FROM event
WHERE date > NOW()
ORDER BY date ASC;

-- View for fighter records
CREATE VIEW fighter_records AS
SELECT 
  f.id,
  f.first_name,
  f.last_name,
  f.nickname,
  fs.wins,
  fs.losses,
  fs.draws,
  fs.no_contests,
  fs.knockouts,
  fs.submissions,
  fs.decision_wins
FROM fighter f
JOIN fighter_stats fs ON f.id = fs.fighter_id;

-- View for current rankings by weight class
CREATE VIEW current_rankings AS
SELECT 
  r.id,
  r.position,
  f.first_name,
  f.last_name,
  f.nickname,
  wc.name AS weight_class,
  r.points,
  r.previous_position,
  r.updated_at
FROM ranking r
JOIN fighter f ON r.fighter_id = f.id
JOIN weight_class wc ON r.weight_class_id = wc.id
WHERE r.updated_at = (
  SELECT MAX(updated_at) 
  FROM ranking 
  WHERE weight_class_id = r.weight_class_id
)
ORDER BY wc.name, r.position;