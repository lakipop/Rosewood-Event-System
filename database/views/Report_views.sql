
USE `rosewood-events-db`;


DROP VIEW IF EXISTS v_revenue_trends;
CREATE VIEW v_revenue_trends AS
SELECT 
    DATE_FORMAT(p.payment_date, '%Y-%m') as month,
    SUM(p.amount) as monthly_revenue,
    COUNT(DISTINCT p.event_id) as events_count,
    AVG(p.amount) as avg_transaction,
    
    -- 🔥 WINDOW FUNCTION: Get previous month's revenue
    LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')) as prev_month_revenue,
    
    -- Calculate revenue change
    SUM(p.amount) - LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')) as revenue_change,
    
    -- Calculate growth percentage
    ROUND(((SUM(p.amount) - LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m'))) / 
           NULLIF(LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')), 0)) * 100, 2) as growth_pct,
    
    -- 🔥 WINDOW FUNCTION: Running total (cumulative revenue)
    SUM(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m') 
                             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_revenue
FROM payments p
WHERE p.status = 'completed'
GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
ORDER BY month DESC;






DROP VIEW IF EXISTS v_service_profitability;

CREATE VIEW v_service_profitability AS
WITH service_costs AS (
    -- CTE 1: Calculate estimated costs for each service based on unit_price
    SELECT 
        s.service_id,
        s.service_name,
        s.unit_price,
        s.unit_price * 0.7 as estimated_cost,    -- 70% of price is cost
        s.unit_price * 0.3 as estimated_profit   -- 30% is profit
    FROM services s
),
service_bookings AS (
    -- CTE 2: Count actual bookings and revenue with actual agreed prices
    SELECT 
        es.service_id,
        COUNT(DISTINCT es.event_id) as bookings,
        SUM(es.quantity) as total_quantity,
        SUM(es.quantity * es.agreed_price) as actual_revenue,
        AVG(es.agreed_price) as avg_price
    FROM event_services es
    WHERE es.status != 'cancelled'
    GROUP BY es.service_id
)
-- Main query: Join CTEs together
SELECT 
    sc.service_id,
    sc.service_name,
    sc.unit_price,
    COALESCE(sb.bookings, 0) as bookings,
    COALESCE(sb.total_quantity, 0) as quantity_sold,
    COALESCE(sb.actual_revenue, 0) as revenue,
    COALESCE(sb.avg_price, sc.unit_price) as avg_selling_price,
    -- Calculate EXPECTED cost based on unit_price (baseline expectation)
    (sc.estimated_cost * COALESCE(sb.total_quantity, 0)) as estimated_cost,
    -- Calculate ACTUAL profit: actual revenue - expected costs
    COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0)) as estimated_profit,
    
    -- Calculate profit margin: actual profit / actual revenue * 100
    -- This will show lower margins when discounts are given
    CASE 
        WHEN COALESCE(sb.actual_revenue, 0) = 0 THEN 0
        ELSE ROUND((
            (COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0))) / 
            COALESCE(sb.actual_revenue, 0)
        ) * 100, 2)
    END as profit_margin_pct
FROM service_costs sc
LEFT JOIN service_bookings sb ON sc.service_id = sb.service_id
ORDER BY estimated_profit DESC;




DROP VIEW IF EXISTS v_client_segments;
CREATE VIEW v_client_segments AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    COUNT(DISTINCT e.event_id) as total_events,
    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_events,
    SUM(CASE WHEN e.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_events,
    COALESCE(SUM(p.amount), 0) as lifetime_value,
    COALESCE(AVG(p.amount), 0) as avg_payment,
    MAX(e.event_date) as last_event_date,
    DATEDIFF(CURDATE(), MAX(e.event_date)) as days_since_last_event,
    
    -- 🔥 CASE 1: Client segment based on lifetime value
    CASE 
        WHEN COALESCE(SUM(p.amount), 0) >= 100000 THEN 'VIP'
        WHEN COALESCE(SUM(p.amount), 0) >= 50000 THEN 'Premium'
        WHEN COALESCE(SUM(p.amount), 0) >= 20000 THEN 'Regular'
        WHEN COUNT(DISTINCT e.event_id) > 0 THEN 'New'
        ELSE 'Prospect'
    END as client_segment,
    
    -- 🔥 CASE 2: Engagement status based on recency
    CASE 
        WHEN MAX(e.event_date) IS NULL THEN 'Never Booked'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 90 THEN 'Active'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 365 THEN 'At Risk'
        ELSE 'Inactive'
    END as engagement_status
FROM users u
LEFT JOIN events e ON u.user_id = e.client_id
LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
WHERE u.role = 'client'
GROUP BY u.user_id
ORDER BY lifetime_value DESC;