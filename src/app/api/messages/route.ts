import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getMessagesByInbox, createMessage } from '@/lib/database'

// GET - Obtener mensajes de un inbox específico
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const inboxIdParam = searchParams.get('inbox_id')

    if (!inboxIdParam) {
      return NextResponse.json(
        { error: 'Parámetro inbox_id requerido' },
        { status: 400 }
      )
    }

    const inboxId = parseInt(inboxIdParam)
    if (isNaN(inboxId)) {
      return NextResponse.json(
        { error: 'inbox_id debe ser un número válido' },
        { status: 400 }
      )
    }

    const messages = await getMessagesByInbox(inboxId)

    // Convertir bigint a string para JSON
    const messagesJson = messages.map(msg => ({
      ...msg,
      id: msg.id.toString()
    }))

    return NextResponse.json(messagesJson)
  } catch (error) {
    console.error('Error en API messages:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { inbox_id, message_text } = body

    // Validar parámetros
    if (!inbox_id || !message_text) {
      return NextResponse.json(
        { error: 'inbox_id y message_text son requeridos' },
        { status: 400 }
      )
    }

    if (typeof message_text !== 'string' || message_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'El texto del mensaje no puede estar vacío' },
        { status: 400 }
      )
    }

    if (message_text.length > 500) {
      return NextResponse.json(
        { error: 'El texto del mensaje no puede exceder 500 caracteres' },
        { status: 400 }
      )
    }

    const inboxId = parseInt(inbox_id)
    if (isNaN(inboxId)) {
      return NextResponse.json(
        { error: 'inbox_id debe ser un número válido' },
        { status: 400 }
      )
    }

    // Crear el mensaje
    const newMessage = await createMessage(inboxId, message_text.trim())

    // Convertir bigint a string para JSON
    return NextResponse.json({
      id: newMessage.id.toString(),
      inbox_id: newMessage.inbox_id,
      message_text: newMessage.message_text,
      created_at: newMessage.created_at
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando mensaje:', error)

    if (error instanceof Error && error.message.includes('Ya existe')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear el mensaje' },
      { status: 500 }
    )
  }
}
