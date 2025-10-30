import { query } from '~/server/db/connection';

export default defineEventHandler(async (event) => {
  try {
    const eventId = event.context.params?.id;

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      });
    }

    // Use stored procedure for comprehensive event summary
    await query('CALL sp_get_event_summary(?)', [eventId]);
    
    // Get the result
    const eventData = await query(
      'SELECT * FROM v_event_summary WHERE event_id = ?',
      [eventId]
    );

    if (!eventData || (eventData as any).length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Event not found'
      });
    }

    // Get calculated financials using functions
    const financials = await query(
      `SELECT 
        fn_calculate_event_cost(?) as total_cost,
        fn_calculate_total_paid(?) as total_paid,
        fn_calculate_balance(?) as balance,
        fn_is_event_paid(?) as is_paid,
        fn_payment_status(?) as payment_status,
        fn_days_until_event(?) as days_until
      `,
      [eventId, eventId, eventId, eventId, eventId, eventId]
    ) as any[];

    console.log('Financials from DB:', financials[0]); // Debug log

    // Get services
    const services = await query(
      `SELECT 
        es.*,
        s.service_name,
        s.category,
        s.unit_type,
        (es.quantity * es.agreed_price) as subtotal
       FROM event_services es
       JOIN services s ON es.service_id = s.service_id
       WHERE es.event_id = ?
       ORDER BY es.added_at DESC`,
      [eventId]
    );

    // Get payments
    const payments = await query(
      'SELECT * FROM v_payment_summary WHERE event_id = ? ORDER BY payment_date DESC',
      [eventId]
    );

    // Get activity logs for this event
    const activities = await query(
      `SELECT * FROM v_user_activity 
       WHERE table_name = 'events' AND record_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [eventId]
    );

    // Merge financials into event object
    const eventWithFinancials = {
      ...(eventData as any)[0],
      financials: financials[0]
    };

    console.log('Final event with financials:', eventWithFinancials); // Debug log

    return {
      success: true,
      event: eventWithFinancials,
      payments,
      services,
      activities
    };
  } catch (error: any) {
    console.error('Error fetching event details:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch event details'
    });
  }
});
