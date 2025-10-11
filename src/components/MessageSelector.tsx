'use client'

import { useState, useEffect } from 'react'

interface IncomingMessage {
  id: string
  inbox_id: number
  message_text: string
  created_at: string
}

interface MessageSelectorProps {
  inboxId: number | null
  selectedMessageId: string | null
  onMessageChange: (messageId: string, messageText: string) => void
}

export default function MessageSelector({ inboxId, selectedMessageId, onMessageChange }: MessageSelectorProps) {
  const [messages, setMessages] = useState<IncomingMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (inboxId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [inboxId])

  const fetchMessages = async () => {
    if (!inboxId) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/messages?inbox_id=${inboxId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)

        // Auto-seleccionar el primer mensaje si no hay uno seleccionado
        if (data.length > 0 && !selectedMessageId) {
          onMessageChange(data[0].id, data[0].message_text)
        }
      } else if (response.status === 401) {
        setError('Sesión expirada')
      } else {
        setError('Error al cargar mensajes')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (!inboxId) {
    return null
  }

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="mr-2">❌</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label htmlFor="message-select" className="block text-sm font-medium text-gray-700 mb-2">
        Selecciona un mensaje
      </label>
      <select
        id="message-select"
        value={selectedMessageId || ''}
        onChange={(e) => {
          const selectedMsg = messages.find(m => m.id === e.target.value)
          if (selectedMsg) {
            onMessageChange(selectedMsg.id, selectedMsg.message_text)
          }
        }}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white text-gray-900"
      >
        <option value="">Selecciona un mensaje para asignar pesos</option>
        {messages.map((message) => (
          <option key={message.id} value={message.id} title={message.message_text}>
            {truncateText(message.message_text)}
          </option>
        ))}
      </select>

      {messages.length === 0 && !loading && (
        <div className="mt-4 text-center py-4">
          <span className="text-gray-600 text-sm">No hay mensajes en este inbox</span>
        </div>
      )}

      {selectedMessageId && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Mensaje completo:</p>
          <p className="text-sm text-gray-900">
            {messages.find(m => m.id === selectedMessageId)?.message_text}
          </p>
        </div>
      )}
    </div>
  )
}
