// src/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) throw new Error('ENCRYPTION_KEY env var is required')
  const buf = Buffer.from(raw, 'base64')
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (base64-encoded)')
  return buf
}

export interface EncryptedData {
  encryptedKey: string // hex
  iv: string          // hex
  tag: string         // hex
}

export function encrypt(plaintext: string): EncryptedData {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    encryptedKey: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  }
}

export function decrypt(data: EncryptedData): string {
  if (!data.encryptedKey || !data.iv || !data.tag) {
    throw new Error('Decryption failed: missing encryptedKey, iv, or tag')
  }
  const key = getKey()
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(data.iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'))
  try {
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.encryptedKey, 'hex')),
      decipher.final(),
    ])
    return decrypted.toString('utf8')
  } catch (err) {
    throw new Error('Decryption failed: authentication tag mismatch — check ENCRYPTION_KEY', { cause: err })
  }
}
