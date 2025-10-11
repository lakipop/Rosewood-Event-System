import jwt from 'jsonwebtoken'

export const generateToken = (payload: any, expiresIn: string = '7d') => {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn })
}

export const verifyToken = (token: string) => {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    return null
  }
}

export const decodeToken = (token: string) => {
  return jwt.decode(token)
}
