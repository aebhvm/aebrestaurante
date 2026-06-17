CREATE TYPE role AS ENUM ('gestor', 'garcom', 'barman', 'estoquista');
CREATE TYPE priority AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE task_status AS ENUM ('pendente', 'concluido');
CREATE TYPE stock_status AS ENUM ('solicitado', 'separado', 'entregue');
CREATE TYPE news_audience AS ENUM ('todos', 'usuarios', 'garcons');
CREATE TYPE audit_entity AS ENUM ('user', 'task', 'station', 'shift', 'break', 'recipe', 'stock_request', 'news');

CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(140) NOT NULL,
  email varchar(180) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role role NOT NULL DEFAULT 'garcom',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  last_access_at timestamptz,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id serial PRIMARY KEY,
  title varchar(180) NOT NULL,
  description text NOT NULL,
  responsible_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date date NOT NULL,
  task_time varchar(8) NOT NULL,
  priority priority NOT NULL DEFAULT 'media',
  status task_status NOT NULL DEFAULT 'pendente',
  notes text,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stations (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  responsible_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_date date NOT NULL,
  notes text,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shifts (
  id serial PRIMARY KEY,
  waiter_id integer REFERENCES users(id) ON DELETE CASCADE,
  bartender_id integer REFERENCES users(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  starts_at varchar(8) NOT NULL,
  ends_at varchar(8) NOT NULL,
  station_id integer REFERENCES stations(id) ON DELETE SET NULL,
  function_name varchar(120) NOT NULL,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shifts_has_worker CHECK (waiter_id IS NOT NULL OR bartender_id IS NOT NULL)
);

CREATE TABLE breaks (
  id serial PRIMARY KEY,
  waiter_id integer REFERENCES users(id) ON DELETE CASCADE,
  bartender_id integer REFERENCES users(id) ON DELETE CASCADE,
  break_date date NOT NULL,
  starts_at varchar(8) NOT NULL,
  ends_at varchar(8) NOT NULL,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT breaks_has_worker CHECK (waiter_id IS NOT NULL OR bartender_id IS NOT NULL)
);

CREATE TABLE bar_recipes (
  id serial PRIMARY KEY,
  drink_name varchar(180) NOT NULL,
  category varchar(120) NOT NULL,
  photo_url text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  preparation text NOT NULL,
  glass varchar(120) NOT NULL,
  garnish varchar(160),
  prep_time_minutes integer NOT NULL DEFAULT 5,
  notes text,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stock_requests (
  id serial PRIMARY KEY,
  requester_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product varchar(160) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit varchar(40) NOT NULL,
  reason text NOT NULL,
  request_date date NOT NULL,
  request_time varchar(8) NOT NULL,
  status stock_status NOT NULL DEFAULT 'solicitado',
  separated_by integer REFERENCES users(id) ON DELETE SET NULL,
  delivered_by integer REFERENCES users(id) ON DELETE SET NULL,
  delivered_at timestamptz,
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id serial PRIMARY KEY,
  title varchar(180) NOT NULL,
  content text NOT NULL,
  priority priority NOT NULL DEFAULT 'media',
  published_at date NOT NULL,
  expires_at date NOT NULL,
  pdf_url text,
  audience news_audience NOT NULL DEFAULT 'todos',
  created_by integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT news_valid_period CHECK (expires_at >= published_at)
);

CREATE TABLE news_recipients (
  news_id integer NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, user_id)
);

CREATE TABLE audit_logs (
  id serial PRIMARY KEY,
  entity audit_entity NOT NULL,
  entity_id integer NOT NULL,
  action varchar(80) NOT NULL,
  actor_id integer REFERENCES users(id) ON DELETE SET NULL,
  status varchar(80),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX users_role_idx ON users(role);
CREATE INDEX tasks_responsible_date_idx ON tasks(responsible_id, task_date);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_date_idx ON tasks(task_date);
CREATE INDEX stations_responsible_date_idx ON stations(responsible_id, station_date);
CREATE INDEX stations_date_idx ON stations(station_date);
CREATE INDEX shifts_waiter_date_idx ON shifts(waiter_id, shift_date);
CREATE INDEX shifts_bartender_date_idx ON shifts(bartender_id, shift_date);
CREATE INDEX shifts_date_idx ON shifts(shift_date);
CREATE INDEX breaks_waiter_date_idx ON breaks(waiter_id, break_date);
CREATE INDEX breaks_bartender_date_idx ON breaks(bartender_id, break_date);
CREATE INDEX breaks_date_idx ON breaks(break_date);
CREATE INDEX bar_recipes_name_idx ON bar_recipes(drink_name);
CREATE INDEX bar_recipes_category_idx ON bar_recipes(category);
CREATE INDEX stock_requests_requester_date_idx ON stock_requests(requester_id, request_date);
CREATE INDEX stock_requests_status_idx ON stock_requests(status);
CREATE INDEX stock_requests_date_idx ON stock_requests(request_date);
CREATE INDEX news_active_idx ON news(published_at, expires_at);
CREATE INDEX news_audience_idx ON news(audience);
CREATE INDEX audit_logs_filters_idx ON audit_logs(occurred_at, actor_id, entity, status);
