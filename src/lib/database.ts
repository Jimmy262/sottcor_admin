import { prisma } from './prisma'

// Tipos para trabajar con los datos existentes
export interface Inbox {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email?: string
}

export interface VendedorConPeso {
  user_id: number
  user_name: string
  inbox_id: number
  inbox_name: string
  peso: number
}

// Obtener todos los inboxes disponibles
export async function getInboxes(): Promise<Inbox[]> {
  try {
    const result = await prisma.$queryRaw<Inbox[]>`
      SELECT id, name FROM inboxes ORDER BY name
    `
    return result
  } catch (error) {
    console.error('Error obteniendo inboxes:', error)
    throw new Error('Error al obtener inboxes')
  }
}

// Obtener vendedores de un inbox específico con sus pesos
export async function getVendedoresByInbox(inboxName: string): Promise<VendedorConPeso[]> {
  try {
    const result = await prisma.$queryRaw<VendedorConPeso[]>`
      SELECT DISTINCT
        u.id as user_id,
        u.name as user_name,
        i.id as inbox_id,
        i.name as inbox_name,
        COALESCE(vp.peso, 0) as peso
      FROM users u
      JOIN inbox_members im ON im.user_id = u.id
      JOIN inboxes i ON i.id = im.inbox_id
      LEFT JOIN vendedor_pesos vp ON vp.user_id = u.id AND vp.inbox_id = i.id
      WHERE i.name = ${inboxName}
      ORDER BY u.name
    `
    return result
  } catch (error) {
    console.error('Error obteniendo vendedores:', error)
    throw new Error('Error al obtener vendedores del inbox')
  }
}

// Actualizar peso de un vendedor
export async function updateVendedorPeso(userId: number, inboxId: number, peso: number): Promise<void> {
  try {
    // Asegurar que la tabla existe antes de usarla
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS vendedor_pesos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        inbox_id INTEGER NOT NULL,
        peso INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, inbox_id)
      )
    `

    // Usar UPSERT para insertar o actualizar
    await prisma.$executeRaw`
      INSERT INTO vendedor_pesos (user_id, inbox_id, peso, updated_at)
      VALUES (${userId}, ${inboxId}, ${peso}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, inbox_id)
      DO UPDATE SET peso = ${peso}, updated_at = CURRENT_TIMESTAMP
    `
  } catch (error) {
    console.error('Error actualizando peso:', error)
    throw new Error('Error al actualizar peso del vendedor')
  }
}

// Verificar si un usuario existe
export async function checkUserExists(userId: number): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM users WHERE id = ${userId}
    `
    return Number(result[0].count) > 0
  } catch (error) {
    console.error('Error verificando usuario:', error)
    return false
  }
}

// Verificar si un inbox existe
export async function checkInboxExists(inboxId: number): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM inboxes WHERE id = ${inboxId}
    `
    return Number(result[0].count) > 0
  } catch (error) {
    console.error('Error verificando inbox:', error)
    return false
  }
}