-- Update all existing users who have language_pref as 'en' to 'hi'
UPDATE users SET language_pref = 'hi' WHERE language_pref = 'en' OR language_pref IS NULL;

-- Alter the table to change the default value for new rows
ALTER TABLE users ALTER COLUMN language_pref SET DEFAULT 'hi';
