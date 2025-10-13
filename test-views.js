// Test database views and queries
const mysql = require('mysql2/promise')
require('dotenv').config()

async function testDatabaseViews() {
  console.log('🔍 Testing Database Views and Queries...\n')

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rosewood_events'
  })

  try {
    // Test 1: Revenue Trends View
    console.log('1️⃣ Testing v_revenue_trends...')
    const [revenueTrends] = await connection.execute('SELECT * FROM v_revenue_trends LIMIT 5')
    console.log('✅ Revenue Trends:', revenueTrends.length, 'rows')
    if (revenueTrends.length > 0) {
      console.log('   Sample:', revenueTrends[0])
    }

    // Test 2: Client Segments View
    console.log('\n2️⃣ Testing v_client_segments...')
    const [clientSegments] = await connection.execute('SELECT * FROM v_client_segments LIMIT 5')
    console.log('✅ Client Segments:', clientSegments.length, 'rows')
    if (clientSegments.length > 0) {
      console.log('   Sample:', clientSegments[0])
    }

    // Test 3: Client Segments Aggregation (what API uses)
    console.log('\n3️⃣ Testing Client Segments Aggregation...')
    const [segmentsAgg] = await connection.execute(`
      SELECT 
        client_segment as segment,
        COUNT(*) as client_count,
        SUM(total_events) as total_events,
        SUM(lifetime_value) as total_spent,
        ROUND(AVG(avg_payment), 2) as avg_event_value
      FROM v_client_segments
      GROUP BY client_segment
    `)
    console.log('✅ Segments Aggregated:', segmentsAgg.length, 'rows')
    segmentsAgg.forEach(seg => {
      console.log('   -', seg)
    })

    // Test 4: Service Profitability View
    console.log('\n4️⃣ Testing v_service_profitability...')
    const [serviceProfitability] = await connection.execute('SELECT * FROM v_service_profitability LIMIT 5')
    console.log('✅ Service Profitability:', serviceProfitability.length, 'rows')
    if (serviceProfitability.length > 0) {
      console.log('   Sample:', serviceProfitability[0])
    }

    // Test 5: Monthly Revenue View
    console.log('\n5️⃣ Testing v_monthly_revenue...')
    const [monthlyRevenue] = await connection.execute('SELECT * FROM v_monthly_revenue LIMIT 3')
    console.log('✅ Monthly Revenue:', monthlyRevenue.length, 'rows')
    if (monthlyRevenue.length > 0) {
      console.log('   Sample:', monthlyRevenue[0])
    }

    console.log('\n✅ All views tested successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await connection.end()
  }
}

testDatabaseViews()
