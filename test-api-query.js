// Test API query with parameters
const mysql = require('mysql2/promise')
require('dotenv').config()

async function testAPIQuery() {
  console.log('🔍 Testing API Query with LIMIT parameter...\n')

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rosewood_events'
  })

  try {
    const months = 12
    
    // Test 1: Revenue Trends (without parameterized LIMIT)
    console.log('1️⃣ Testing Revenue Trends without parameterized LIMIT...')
    const trendsQuery = `
      SELECT 
        month,
        monthly_revenue as total_revenue,
        events_count as total_events,
        avg_transaction as avg_event_revenue,
        growth_pct as growth_rate
      FROM v_revenue_trends
      ORDER BY month DESC
      LIMIT ${months}
    `
    
    const [trends] = await connection.execute(trendsQuery)
    console.log('✅ Revenue Trends:', trends.length, 'rows')
    if (trends.length > 0) {
      console.log('   Sample:', trends[0])
    }

    // Test 2: Client Segments Aggregation
    console.log('\n2️⃣ Testing Client Segments Aggregation with COLLATE...')
    const segmentsQuery = `
      SELECT 
        client_segment as segment,
        COUNT(*) as client_count,
        SUM(total_events) as total_events,
        SUM(lifetime_value) as total_spent,
        ROUND(AVG(avg_payment), 2) as avg_event_value,
        MAX(last_event_date) as last_event_date
      FROM v_client_segments
      GROUP BY client_segment
      ORDER BY 
        CASE client_segment COLLATE utf8mb4_unicode_ci
          WHEN 'VIP' THEN 1
          WHEN 'Premium' THEN 2
          WHEN 'Regular' THEN 3
          WHEN 'New' THEN 4
          ELSE 5
        END
    `
    
    const [segments] = await connection.execute(segmentsQuery)
    console.log('✅ Client Segments:', segments.length, 'rows')
    segments.forEach(seg => {
      console.log('   -', seg)
    })

    console.log('\n✅ All API queries tested successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await connection.end()
  }
}

testAPIQuery()
