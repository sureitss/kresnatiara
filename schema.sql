CREATE TABLE IF NOT EXISTS kresnatiara (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir','Tidak Hadir')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kresnatiara
  ON kresnatiara (created_at);
