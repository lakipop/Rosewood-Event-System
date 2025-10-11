import { verifyToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  const path = event.path
  
  if (publicRoutes.some(route => path.startsWith(route))) {
    return
  }

  // Check for auth endpoints only
  if (!path.startsWith('/api/')) {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - No token provided'
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - token not provided'
    })
  }
  const decoded = verifyToken(token) as any

  if (!decoded) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Invalid token'
    })
  }

  // Attach user info to the event context
  event.context.user = decoded
})
