import { prisma } from './prisma'

// Tipos para trabajar con los datos existentes
export interface Inbox {
  id: number
  name: string
}

export interface User {
  id: bigint
  name: string
  email?: string
}

export interface IncomingMessage {
  id: bigint
  inbox_id: number
  message_text: string
  created_at: Date
}

export interface VendedorConPeso {
  user_id: bigint
  user_name: string
  message_id: bigint
  message_text: string
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

// Obtener mensajes de un inbox específico
export async function getMessagesByInbox(inboxId: number): Promise<IncomingMessage[]> {
  try {
    const result = await prisma.$queryRaw<IncomingMessage[]>`
      SELECT
        id,
        inbox_id,
        message_text,
        created_at
      FROM incoming_messages
      WHERE inbox_id = ${inboxId}
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    throw new Error('Error al obtener mensajes del inbox')
  }
}

// Obtener vendedores de un inbox con sus pesos para un mensaje específico
export async function getVendedoresByMessage(messageId: bigint, inboxId: number): Promise<VendedorConPeso[]> {
  try {
    const result = await prisma.$queryRaw<VendedorConPeso[]>`
      SELECT DISTINCT
        u.id as user_id,
        u.name as user_name,
        im.id as message_id,
        im.message_text,
        COALESCE(imw.peso, 0) as peso
      FROM users u
      JOIN inbox_members inm ON inm.user_id = u.id
      CROSS JOIN incoming_messages im
      LEFT JOIN incoming_message_weights imw
        ON imw.user_id = u.id
        AND imw.id_incoming_message = im.id
      WHERE inm.inbox_id = ${inboxId}
        AND im.id = ${messageId}
      ORDER BY u.name
    `
    return result
  } catch (error) {
    console.error('Error obteniendo vendedores:', error)
    throw new Error('Error al obtener vendedores del mensaje')
  }
}

// Actualizar peso de un vendedor para un mensaje específico
export async function updateMessageWeight(messageId: bigint, userId: bigint, peso: number): Promise<void> {
  try {
    // Usar UPSERT para insertar o actualizar el peso
    await prisma.$executeRaw`
      INSERT INTO incoming_message_weights (id_incoming_message, user_id, peso)
      VALUES (${messageId}, ${userId}, ${peso})
      ON CONFLICT (id_incoming_message, user_id)
      DO UPDATE SET peso = ${peso}
    `
  } catch (error) {
    console.error('Error actualizando peso:', error)
    throw new Error('Error al actualizar peso del vendedor en el mensaje')
  }
}

// Verificar si un usuario existe
export async function checkUserExists(userId: bigint): Promise<boolean> {
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

// Verificar si un mensaje existe
export async function checkMessageExists(messageId: bigint): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM incoming_messages WHERE id = ${messageId}
    `
    return Number(result[0].count) > 0
  } catch (error) {
    console.error('Error verificando mensaje:', error)
    return false
  }
}

// Interfaz para estadísticas de mensaje
export interface MessageStats {
  total_weights: number
  assigned_vendors: number
  total_peso: number
}

// Crear un nuevo mensaje
export async function createMessage(inboxId: number, messageText: string): Promise<IncomingMessage> {
  try {
    // Verificar que no exista el mismo mensaje en el inbox
    const existing = await prisma.$queryRaw<IncomingMessage[]>`
      SELECT id, inbox_id, message_text, created_at
      FROM incoming_messages
      WHERE inbox_id = ${inboxId} AND message_text = ${messageText}
      LIMIT 1
    `

    if (existing.length > 0) {
      throw new Error('Ya existe un mensaje con este texto en el inbox')
    }

    // Insertar el nuevo mensaje
    const result = await prisma.$queryRaw<IncomingMessage[]>`
      INSERT INTO incoming_messages (inbox_id, message_text)
      VALUES (${inboxId}, ${messageText})
      RETURNING id, inbox_id, message_text, created_at
    `

    return result[0]
  } catch (error) {
    console.error('Error creando mensaje:', error)
    if (error instanceof Error && error.message.includes('Ya existe')) {
      throw error
    }
    throw new Error('Error al crear el mensaje')
  }
}

// Eliminar un mensaje (los pesos se eliminan automáticamente por CASCADE)
export async function deleteMessage(messageId: bigint): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM incoming_messages WHERE id = ${messageId}
    `
  } catch (error) {
    console.error('Error eliminando mensaje:', error)
    throw new Error('Error al eliminar el mensaje')
  }
}

// Obtener estadísticas de pesos de un mensaje
export async function getMessageStats(messageId: bigint): Promise<MessageStats> {
  try {
    const result = await prisma.$queryRaw<MessageStats[]>`
      SELECT
        COUNT(*) as total_weights,
        COUNT(CASE WHEN peso > 0 THEN 1 END) as assigned_vendors,
        COALESCE(SUM(peso), 0) as total_peso
      FROM incoming_message_weights
      WHERE id_incoming_message = ${messageId}
    `

    if (result.length === 0) {
      return { total_weights: 0, assigned_vendors: 0, total_peso: 0 }
    }

    return {
      total_weights: Number(result[0].total_weights),
      assigned_vendors: Number(result[0].assigned_vendors),
      total_peso: Number(result[0].total_peso)
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return { total_weights: 0, assigned_vendors: 0, total_peso: 0 }
  }
}