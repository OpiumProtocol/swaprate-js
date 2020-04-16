require('dotenv').config()

export const publicKey = process.env.PUBLIC_KEY || ''
export const privateKey = Buffer.from(process.env.PRIVATE_KEY || '', 'hex')
