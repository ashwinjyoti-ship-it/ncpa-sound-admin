-- D1 Database Schema for NCPA Notes

DROP TABLE IF EXISTS notes;

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  timestamp INTEGER NOT NULL,
  completed INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX idx_timestamp ON notes(timestamp DESC);
