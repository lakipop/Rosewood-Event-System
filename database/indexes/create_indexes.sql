-- Performance Indexes for Rosewood Event System
-- These indexes are already defined in the table creation
-- This file documents additional indexes that may be added

-- Additional composite indexes for better query performance

-- Index for event search by date range and status
-- Already exists: idx_events_date_status

-- Index for payment queries by date range
-- Already exists: idx_payments_date

-- Index for activity log queries
-- Already exists: idx_activity_created

-- Future indexes can be added here as needed
-- Example:
-- CREATE INDEX idx_events_client_status ON events(client_id, status);
-- CREATE INDEX idx_services_category ON services(category);
-- CREATE INDEX idx_event_services_status ON event_services(status);
