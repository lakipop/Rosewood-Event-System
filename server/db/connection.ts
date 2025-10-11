import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export const getPool = () => {
  if (!pool) {
    const config = useRuntimeConfig()
    
    pool = mysql.createPool({
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      port: parseInt(config.dbPort || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  
  return pool
}

export const query = async (sql: string, params?: any[]) => {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export const transaction = async (callback: (connection: mysql.PoolConnection) => Promise<any>) => {
  const pool = getPool()
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
