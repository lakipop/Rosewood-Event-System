
USE `rosewood-events-db`;

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

