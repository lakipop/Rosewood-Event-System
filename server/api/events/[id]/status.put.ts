import { getPool } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { status, user_id } = await readBody(event)

  if (!id || !status || !user_id) {
    throw createError({
      statusCode: 400,
      message: 'Event ID, status, and user ID are required'
    })
  }

  try {
    const pool = getPool()
    
    // Call stored procedure
    await pool.query(
      'CALL sp_update_event_status(?, ?, ?, @success, @message)',
      [parseInt(id), status, user_id]
    )
    
    // Get the output
    const [result] = await pool.query(
      'SELECT @success as success, @message as message'
    ) as any
    
    const output = result[0]
    
    if (!output.success) {
      throw createError({
        statusCode: 400,
        message: output.message
      })
    }

    return {
      success: true,
      message: output.message
    }
  } catch (error: any) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update event status'
    })
  }
})
