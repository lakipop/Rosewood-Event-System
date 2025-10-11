-- Sample View: Event Summary with Services
-- This will be implemented to demonstrate views

CREATE OR REPLACE VIEW v_event_summary AS
SELECT 
    e.event_id,
    e.event_name,
    e.event_date,
    e.status,
    u.full_name as client_name,
    et.type_name,
    COUNT(es.service_id) as service_count,
    SUM(es.agreed_price * es.quantity) as estimated_cost
FROM events e
LEFT JOIN users u ON e.client_id = u.user_id
LEFT JOIN event_types et ON e.event_type_id = et.event_type_id
LEFT JOIN event_services es ON e.event_id = es.event_id
GROUP BY e.event_id;
