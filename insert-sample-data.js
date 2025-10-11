// Insert Sample Data to Database
// Run this with: node insert-sample-data.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function insertSampleData() {
  console.log('📊 Inserting Sample Data for Rosewood Event System...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('✅ Connected to database\n');

    // Generate password hash for "Test123"
    const passwordHash = await bcrypt.hash('Test123', 10);
    console.log('🔐 Password hash generated for "Test123"\n');

    // 1. INSERT USERS (Starting from user_id 2 since user 1 already exists)
    console.log('📝 Inserting Users...');
    const users = [
      ['kamal.perera@gmail.com', 'Kamal Perera', '+94711234567', 'client'],
      ['nayana.fonseka@yahoo.com', 'Nayana Fonseka', '+94712345678', 'client'],
      ['sunil.jayasinghe@gmail.com', 'Sunil Jayasinghe', '+94713456789', 'client'],
      ['priya.rathnayake@gmail.com', 'Priya Rathnayake', '+94714567890', 'client'],
      ['asiri.silva@hotmail.com', 'Asiri Silva', '+94715678901', 'client'],
      ['chamari.wickramasinghe@gmail.com', 'Chamari Wickramasinghe', '+94716789012', 'client'],
      ['dilshan.fernando@gmail.com', 'Dilshan Fernando', '+94717890123', 'manager'],
      ['sachini.gunawardena@yahoo.com', 'Sachini Gunawardena', '+94718901234', 'manager'],
      ['ruwan.bandara@gmail.com', 'Ruwan Bandara', '+94719012345', 'admin'],
      ['kaushalya.weerasinghe@gmail.com', 'Kaushalya Weerasinghe', '+94710123456', 'admin']
    ];

    for (const [email, name, phone, role] of users) {
      await connection.execute(
        'INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, "active")',
        [email, passwordHash, name, phone, role]
      );
      console.log(`   ✓ ${name} (${email}) - Role: ${role}`);
    }
    console.log(`✅ ${users.length} Users inserted\n`);

    // 2. INSERT EVENT TYPES
    console.log('📝 Inserting Event Types...');
    const eventTypes = [
      ['Sinhala Wedding', 'Traditional Sinhala wedding ceremony with poruwa', 75000.00],
      ['Engagement Ceremony', 'Traditional Sinhala engagement (naagamangalyaya)', 35000.00],
      ['Birthday Party', 'Sinhala birthday celebration with traditional music', 20000.00],
      ['Aluth Sahal Mangalyaya', 'First rice feeding ceremony for baby', 15000.00],
      ['Pirith Ceremony', 'Buddhist chanting ceremony for blessings', 25000.00],
      ['House Warming', 'New house blessing ceremony (griha pravesham)', 18000.00],
      ['Anniversary', 'Wedding anniversary celebration', 22000.00],
      ['Sinhala New Year', 'Avurudu celebrations with traditional games', 30000.00],
      ['Corporate Event', 'Business events with Sinhala cultural elements', 40000.00],
      ['Dana Ceremony', 'Buddhist alms giving ceremony', 12000.00]
    ];

    for (const [name, desc, price] of eventTypes) {
      await connection.execute(
        'INSERT INTO event_types (type_name, description, base_price, is_active) VALUES (?, ?, ?, TRUE)',
        [name, desc, price]
      );
    }
    console.log(`✅ ${eventTypes.length} Event Types inserted\n`);

    // 3. INSERT SERVICES
    console.log('📝 Inserting Services...');
    const services = [
      ['Traditional Poruwa Decoration', 'Decoration', 'Sinhala wedding poruwa with traditional motifs', 25000.00, 'fixed'],
      ['Sinhala Catering Service', 'Catering', 'Traditional Sri Lankan meals including rice and curry', 800.00, 'per_person'],
      ['Buddhist Pirith Chanting', 'Entertainment', 'Traditional pirith chanting by Buddhist monks', 15000.00, 'fixed'],
      ['Traditional Kandyan Dancers', 'Entertainment', 'Authentic Kandyan dance performances', 12000.00, 'per_hour'],
      ['Traditional Oil Lamp Lighting', 'Decoration', 'Traditional coconut oil lamp setup and lighting', 5000.00, 'fixed'],
      ['Sinhala Wedding Photography', 'Photography', 'Traditional wedding photography with cultural elements', 18000.00, 'fixed'],
      ['Betel Leaf Arrangement', 'Decoration', 'Traditional betel (bulath) arrangements', 3000.00, 'fixed'],
      ['Traditional Drummers', 'Entertainment', 'Traditional hevisi drummers for ceremonies', 8000.00, 'per_hour'],
      ['Ayurvedic Gift Packs', 'Gifts', 'Traditional Ayurvedic gift packages for guests', 500.00, 'per_person'],
      ['Traditional Seating Arrangement', 'Decoration', 'Floor seating with traditional mats and cushions', 6000.00, 'fixed']
    ];

    for (const [name, category, desc, price, unit] of services) {
      await connection.execute(
        'INSERT INTO services (service_name, category, description, unit_price, unit_type, is_available) VALUES (?, ?, ?, ?, ?, TRUE)',
        [name, category, desc, price, unit]
      );
    }
    console.log(`✅ ${services.length} Services inserted\n`);

    // 4. INSERT EVENTS FOR YOUR USER (client_id = 1) AND OTHERS
    console.log('📝 Inserting Events...');
    const events = [
      [1, 1, 'Kamal & Nisansala Wedding', '2024-06-15', '06:30:00', 'Colombo Hotel Gardens', 250, 150000.00, 'confirmed'],
      [2, 2, 'Nayana & Roshan Engagement', '2024-05-20', '16:00:00', 'Galle Face Hotel', 150, 60000.00, 'confirmed'],
      [3, 3, 'Little Dineth 1st Birthday', '2024-04-10', '14:00:00', 'Sunil Residence, Maharagama', 100, 30000.00, 'completed'],
      [4, 4, 'Baby Senuri Aluth Sahal Mangalyaya', '2024-07-05', '09:00:00', 'Rathnayake Residence, Kandy', 80, 20000.00, 'confirmed'],
      [5, 5, 'Asiri Mother 70th Birthday Pirith', '2024-03-25', '18:00:00', 'Silva Residence, Negombo', 120, 35000.00, 'completed'],
      [6, 6, 'Chamari New House Warming', '2024-08-12', '07:30:00', 'Wickramasinghe New House, Kurunegala', 200, 45000.00, 'inquiry'],
      [1, 7, 'Kamal Parents 25th Anniversary', '2024-09-30', '17:00:00', 'Mount Lavinia Hotel', 180, 50000.00, 'confirmed'],
      [2, 8, 'Nayana Family Avurudu Celebration', '2024-04-13', '08:00:00', 'Fonseka Residence, Gampaha', 300, 75000.00, 'confirmed'],
      [3, 9, 'Sunil Company Sinhala New Year Event', '2024-04-15', '10:00:00', 'Company Premises, Colombo 03', 400, 120000.00, 'confirmed'],
      [4, 10, 'Priya Father Memorial Dana', '2024-05-05', '07:00:00', 'Temple, Moratuwa', 50, 15000.00, 'completed']
    ];

    for (const [clientId, typeId, name, date, time, venue, guests, budget, status] of events) {
      await connection.execute(
        'INSERT INTO events (client_id, event_type_id, event_name, event_date, event_time, venue, guest_count, budget, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [clientId, typeId, name, date, time, venue, guests, budget, status]
      );
    }
    console.log(`✅ ${events.length} Events inserted\n`);

    // 5. INSERT EVENT SERVICES
    console.log('📝 Inserting Event Services...');
    const eventServices = [
      [1, 1, 1, 25000.00, 'confirmed'],
      [1, 2, 250, 750.00, 'confirmed'],
      [1, 4, 2, 24000.00, 'confirmed'],
      [2, 5, 1, 5000.00, 'confirmed'],
      [2, 7, 1, 3000.00, 'confirmed'],
      [3, 2, 100, 800.00, 'delivered'],
      [3, 9, 100, 500.00, 'delivered'],
      [4, 5, 1, 5000.00, 'confirmed'],
      [5, 3, 1, 15000.00, 'delivered'],
      [6, 6, 1, 18000.00, 'pending']
    ];

    for (const [eventId, serviceId, qty, price, status] of eventServices) {
      await connection.execute(
        'INSERT INTO event_services (event_id, service_id, quantity, agreed_price, status) VALUES (?, ?, ?, ?, ?)',
        [eventId, serviceId, qty, price, status]
      );
    }
    console.log(`✅ ${eventServices.length} Event-Service assignments inserted\n`);

    // 6. INSERT PAYMENTS
    console.log('📝 Inserting Payments...');
    const payments = [
      [1, 50000.00, 'bank_transfer', 'advance', '2024-01-15', 'REF001234', 'completed'],
      [1, 40000.00, 'card', 'partial', '2024-04-01', 'REF001235', 'completed'],
      [2, 25000.00, 'cash', 'advance', '2024-02-20', 'REF001236', 'completed'],
      [3, 30000.00, 'online', 'final', '2024-03-20', 'REF001237', 'completed'],
      [4, 10000.00, 'bank_transfer', 'advance', '2024-05-15', 'REF001238', 'completed'],
      [5, 35000.00, 'cash', 'final', '2024-03-10', 'REF001239', 'completed'],
      [6, 5000.00, 'online', 'advance', '2024-06-01', 'REF001240', 'completed'],
      [7, 20000.00, 'bank_transfer', 'advance', '2024-07-15', 'REF001241', 'completed'],
      [8, 30000.00, 'card', 'advance', '2024-02-28', 'REF001242', 'completed'],
      [9, 60000.00, 'bank_transfer', 'advance', '2024-03-01', 'REF001243', 'completed']
    ];

    for (const [eventId, amount, method, type, date, ref, status] of payments) {
      await connection.execute(
        'INSERT INTO payments (event_id, amount, payment_method, payment_type, payment_date, reference_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [eventId, amount, method, type, date, ref, status]
      );
    }
    console.log(`✅ ${payments.length} Payments inserted\n`);

    // 7. INSERT ACTIVITY LOGS
    console.log('📝 Inserting Activity Logs...');
    const activityLogs = [
      [1, 'event_created', 'events', 1, null, 'Kamal & Nisansala Wedding', '192.168.1.100'],
      [8, 'event_updated', 'events', 1, 'inquiry', 'confirmed', '192.168.1.101'],
      [2, 'payment_made', 'payments', 1, null, '50000.00', '192.168.1.102'],
      [9, 'service_added', 'event_services', 1, null, 'Traditional Poruwa Decoration', '192.168.1.103'],
      [3, 'event_completed', 'events', 3, 'confirmed', 'completed', '192.168.1.104'],
      [8, 'user_created', 'users', 6, null, 'Chamari Wickramasinghe', '192.168.1.105'],
      [1, 'payment_received', 'payments', 2, 'pending', 'completed', '192.168.1.106'],
      [9, 'service_confirmed', 'event_services', 1, 'pending', 'confirmed', '192.168.1.107'],
      [2, 'event_cancelled', 'events', 10, 'confirmed', 'cancelled', '192.168.1.108'],
      [8, 'status_updated', 'events', 5, 'confirmed', 'completed', '192.168.1.109']
    ];

    for (const [userId, action, table, recordId, oldVal, newVal, ip] of activityLogs) {
      await connection.execute(
        'INSERT INTO activity_logs (user_id, action_type, table_name, record_id, old_value, new_value, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, action, table, recordId, oldVal, newVal, ip]
      );
    }
    console.log(`✅ ${activityLogs.length} Activity Logs inserted\n`);

    await connection.end();
    
    console.log('🎉 All sample data inserted successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   👥 Users: ${users.length} (plus existing user)`);
    console.log(`   🎭 Event Types: ${eventTypes.length}`);
    console.log(`   🛎️  Services: ${services.length}`);
    console.log(`   📅 Events: ${events.length}`);
    console.log(`   🔗 Event-Services: ${eventServices.length}`);
    console.log(`   💳 Payments: ${payments.length}`);
    console.log(`   📝 Activity Logs: ${activityLogs.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   👤 Your Account:');
    console.log('      Email: lakindu02@gmail.com');
    console.log('      Password: [Your registered password]');
    console.log('');
    console.log('   👤 Test Accounts (Password: Test123):');
    console.log('      Admin: ruwan.bandara@gmail.com');
    console.log('      Manager: dilshan.fernando@gmail.com');
    console.log('      Client: kamal.perera@gmail.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Ready to use! Start your app with: npm run dev');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the script
insertSampleData();
