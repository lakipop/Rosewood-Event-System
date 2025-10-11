-- ==========================================
-- Indexes for Rosewood Event System
-- Performance optimization for frequent queries
-- ==========================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_status ON users(role, status); -- Composite for role-based queries

-- Events table indexes
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_event_type_id ON events(event_type_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date_status ON events(event_date, status); -- Composite for date filtering
CREATE INDEX idx_events_client_status ON events(client_id, status); -- Composite for client queries

-- Event Types indexes
CREATE INDEX idx_event_types_is_active ON event_types(is_active);

-- Services table indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_available ON services(is_available);
CREATE INDEX idx_services_category_available ON services(category, is_available); -- Composite

-- Event Services indexes
CREATE INDEX idx_event_services_event_id ON event_services(event_id);
CREATE INDEX idx_event_services_service_id ON event_services(service_id);
CREATE INDEX idx_event_services_status ON event_services(status);
CREATE INDEX idx_event_services_event_status ON event_services(event_id, status); -- Composite

-- Payments indexes
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_event_status ON payments(event_id, status); -- Composite
CREATE INDEX idx_payments_date_status ON payments(payment_date, status); -- For reporting
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at); -- Composite for user activity timeline

-- Full-text search indexes (for searching)
CREATE FULLTEXT INDEX idx_events_search ON events(event_name, venue);
CREATE FULLTEXT INDEX idx_users_search ON users(full_name, email);
CREATE FULLTEXT INDEX idx_services_search ON services(service_name, description);
