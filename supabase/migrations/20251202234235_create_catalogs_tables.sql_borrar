/*
  # Create Catalog Tables

  ## Overview
  This migration creates all catalog tables for the application: IMO, Incoterms, Services, Status, and Request Types.
  Each table includes audit fields and RLS policies for secure access.

  ## New Tables
  
  ### 1. cat001_imo
  - `id` (bigint, primary key, auto-increment)
  - `imo` (text, unique, not null) - IMO classification code
  - `description` (text, not null) - Description of the IMO class
  - `status` (smallint, default 1) - Active/Inactive status
  - `archived` (boolean, default false) - Soft delete flag
  - `data_state` (smallint, default 1) - Data state indicator
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### 2. cat001_incoterms
  - `id` (bigint, primary key, auto-increment)
  - `incoterm` (text, unique, not null) - Incoterm code (EXW, FOB, etc.)
  - `status` (smallint, default 1)
  - `archived` (boolean, default false)
  - `data_state` (smallint, default 1)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### 3. cat001_services
  - `id` (bigint, primary key, auto-increment)
  - `service_name` (text, not null) - Service name
  - `category` (smallint, not null) - 1=Main services, 2=Accessory services
  - `email_service_name` (text, nullable) - Optional email for service
  - `status` (smallint, default 1)
  - `archived` (boolean, default false)
  - `data_state` (smallint, default 1)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### 4. cat018_request_types
  - `id` (bigint, primary key, auto-increment)
  - `request_type_name` (text, unique, not null) - Request type name
  - `status` (smallint, default 1)
  - `archived` (boolean, default false)
  - `data_state` (smallint, default 1)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### 5. cat018_status
  - `id` (bigint, primary key, auto-increment)
  - `category` (text, not null) - Category (pricing, operaciones, etc.)
  - `subcategory` (text, not null) - Subcategory (solicitudes, shipment, etc.)
  - `code` (text, nullable) - Optional status code
  - `status_name` (text, not null) - Status name
  - `description` (text, nullable) - Status description
  - `status` (smallint, default 1)
  - `archived` (boolean, default false)
  - `data_state` (smallint, default 1)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all catalog tables
  - Create policies allowing authenticated users to read all records
  - Create policies allowing authenticated users to insert, update, and delete records
  
  ## Notes
  - All tables use bigint for IDs with auto-increment
  - All tables include audit timestamps (created_at, updated_at)
  - All tables support soft deletion via 'archived' flag
  - RLS policies are restrictive by default and require authentication
*/

-- Create cat001_imo table
CREATE TABLE IF NOT EXISTS cat001_imo (
  id bigserial PRIMARY KEY,
  imo text UNIQUE NOT NULL,
  description text NOT NULL,
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cat001_incoterms table
CREATE TABLE IF NOT EXISTS cat001_incoterms (
  id bigserial PRIMARY KEY,
  incoterm text UNIQUE NOT NULL,
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cat001_services table
CREATE TABLE IF NOT EXISTS cat001_services (
  id bigserial PRIMARY KEY,
  service_name text NOT NULL,
  category smallint NOT NULL,
  email_service_name text,
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cat018_request_types table
CREATE TABLE IF NOT EXISTS cat018_request_types (
  id bigserial PRIMARY KEY,
  request_type_name text UNIQUE NOT NULL,
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cat018_status table
CREATE TABLE IF NOT EXISTS cat018_status (
  id bigserial PRIMARY KEY,
  category text NOT NULL,
  subcategory text NOT NULL,
  code text,
  status_name text NOT NULL,
  description text,
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cat001_imo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat001_incoterms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat001_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat018_request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat018_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cat001_imo
CREATE POLICY "Authenticated users can read IMO catalog"
  ON cat001_imo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert IMO records"
  ON cat001_imo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update IMO records"
  ON cat001_imo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete IMO records"
  ON cat001_imo FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for cat001_incoterms
CREATE POLICY "Authenticated users can read Incoterms catalog"
  ON cat001_incoterms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert Incoterms records"
  ON cat001_incoterms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update Incoterms records"
  ON cat001_incoterms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete Incoterms records"
  ON cat001_incoterms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for cat001_services
CREATE POLICY "Authenticated users can read Services catalog"
  ON cat001_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert Services records"
  ON cat001_services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update Services records"
  ON cat001_services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete Services records"
  ON cat001_services FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for cat018_request_types
CREATE POLICY "Authenticated users can read Request Types catalog"
  ON cat018_request_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert Request Types records"
  ON cat018_request_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update Request Types records"
  ON cat018_request_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete Request Types records"
  ON cat018_request_types FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for cat018_status
CREATE POLICY "Authenticated users can read Status catalog"
  ON cat018_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert Status records"
  ON cat018_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update Status records"
  ON cat018_status FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete Status records"
  ON cat018_status FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cat001_imo_status ON cat001_imo(status);
CREATE INDEX IF NOT EXISTS idx_cat001_imo_archived ON cat001_imo(archived);
CREATE INDEX IF NOT EXISTS idx_cat001_incoterms_status ON cat001_incoterms(status);
CREATE INDEX IF NOT EXISTS idx_cat001_incoterms_archived ON cat001_incoterms(archived);
CREATE INDEX IF NOT EXISTS idx_cat001_services_category ON cat001_services(category);
CREATE INDEX IF NOT EXISTS idx_cat001_services_status ON cat001_services(status);
CREATE INDEX IF NOT EXISTS idx_cat001_services_archived ON cat001_services(archived);
CREATE INDEX IF NOT EXISTS idx_cat018_request_types_status ON cat018_request_types(status);
CREATE INDEX IF NOT EXISTS idx_cat018_request_types_archived ON cat018_request_types(archived);
CREATE INDEX IF NOT EXISTS idx_cat018_status_category ON cat018_status(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_cat018_status_status ON cat018_status(status);
CREATE INDEX IF NOT EXISTS idx_cat018_status_archived ON cat018_status(archived);