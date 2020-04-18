CREATE TABLE IF NOT EXISTS shajara_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  first_name TEXT NOT NULL,
  email_address TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT now()
);