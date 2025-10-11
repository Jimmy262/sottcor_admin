'use client'

import { useState, useEffect, useMemo } from 'react'
import AddMessageModal from './AddMessageModal'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './ToastContainer'

interface IncomingMessage {
  id: string
  inbox_id: number
  message_text: string
  created_at: string
}

interface MessageManagerProps {
  inboxId: number | null
  inboxName: string | null
  selectedMessageId: string | null
  onMessageChange: (messageId: string, messageText: string) => void
  onMessageDeleted: () => void
}

export default function MessageManager({
  inboxId,
  inboxName,
  selectedMessageId,
  onMessageChange,
  onMessageDeleted
}: MessageManagerProps) {
  const [messages, setMessages] = useState<IncomingMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; messageId: string; messageText: string } | null>(null)
  const [oldMessageThreshold, setOldMessageThreshold] = useState<number>(3)
  const { showSuccess, showError } = useToast()

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedThreshold = localStorage.getItem('oldMessageThreshold')
    if (savedThreshold) {
      setOldMessageThreshold(parseInt(savedThreshold, 10))
    }
  }, [])

  // Función para verificar si un mensaje es antiguo
  const isOldMessage = (createdAt: string) => {
    const messageDate = new Date(createdAt)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays >= oldMessageThreshold
  }

  // Función para cambiar el threshold
  const handleThresholdChange = (days: number) => {
    setOldMessageThreshold(days)
    localStorage.setItem('oldMessageThreshold', days.toString())
    showSuccess(`Configuración actualizada: ${days} día${days !== 1 ? 's' : ''}`)
  }

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

  const handleDeleteClick = (messageId: string, messageText: string) => {
    setConfirmDialog({ isOpen: true, messageId, messageText })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDialog) return

    const { messageId, messageText } = confirmDialog
    setConfirmDialog(null)
    setDeletingMessageId(messageId)

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Remover de la lista local
        setMessages(prev => prev.filter(m => m.id !== messageId))

        // Si era el mensaje seleccionado, notificar al padre
        if (selectedMessageId === messageId) {
          onMessageDeleted()
        }

        showSuccess('Mensaje eliminado exitosamente')
      } else {
        const errorData = await response.json()
        showError(errorData.error || 'Error al eliminar el mensaje')
      }
    } catch {
      showError('Error de conexión al eliminar el mensaje')
    } finally {
      setDeletingMessageId(null)
    }
  }

  const handleMessageCreated = (messageId: string, messageText: string) => {
    // Recargar la lista de mensajes
    fetchMessages()

    // Auto-seleccionar el nuevo mensaje
    onMessageChange(messageId, messageText)

    showSuccess('Mensaje creado exitosamente')
  }

  // Filtrar mensajes según búsqueda
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages

    const query = searchQuery.toLowerCase()
    return messages.filter(msg =>
      msg.message_text.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  if (!inboxId) {
    return null
  }

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Mensajes de {inboxName}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {filteredMessages.length} {filteredMessages.length === 1 ? 'mensaje' : 'mensajes'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Mensaje</span>
        </button>
      </div>

      {/* Configuración de días para mensajes antiguos */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-gray-700">
              Alertar mensajes antiguos después de:
            </label>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 3, 7].map((days) => (
              <button
                key={days}
                onClick={() => handleThresholdChange(days)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  oldMessageThreshold === days
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {messages.length > 0 && (
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar mensajes..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white text-gray-900"
          />
        </div>
      )}

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          {searchQuery ? (
            <>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-600">No se encontraron mensajes</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-gray-900 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 mb-3">No hay mensajes en este inbox</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-sm text-gray-900 hover:underline"
              >
                Crear el primer mensaje
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredMessages.map((message) => {
            const messageIsOld = isOldMessage(message.created_at)
            return (
              <div key={message.id}>
                {/* Alerta de mensaje antiguo */}
                {messageIsOld && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-3 flex items-start space-x-2">
                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-orange-800">
                        Mensaje antiguo
                      </p>
                      <p className="text-xs text-orange-700 mt-0.5">
                        Este mensaje tiene más de {oldMessageThreshold} día{oldMessageThreshold !== 1 ? 's' : ''}. Considera eliminarlo si ya no es relevante.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card del mensaje */}
                <div
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedMessageId === message.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  } ${messageIsOld ? 'bg-orange-50/30' : ''}`}
                  onClick={() => onMessageChange(message.id, message.message_text)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {message.message_text}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(message.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(message.id, message.message_text)
                  }}
                  disabled={deletingMessageId === message.id}
                  className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Eliminar mensaje"
                >
                  {deletingMessageId === message.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  </button>
                </div>

                {selectedMessageId === message.id && (
                  <div className="mt-2 px-3 py-2 bg-blue-100 rounded text-xs text-blue-900">
                    ✓ Mensaje seleccionado
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Add Message Modal */}
      <AddMessageModal
        isOpen={isAddModalOpen}
        inboxId={inboxId}
        onClose={() => setIsAddModalOpen(false)}
        onMessageCreated={handleMessageCreated}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="¿Eliminar mensaje?"
          message={`¿Estás seguro de que deseas eliminar este mensaje?\n\n"${confirmDialog.messageText.substring(0, 100)}${confirmDialog.messageText.length > 100 ? '...' : ''}"\n\nEsta acción no se puede deshacer y eliminará todos los pesos asignados a este mensaje.`}
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
