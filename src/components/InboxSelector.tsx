'use client'

import { useState, useEffect } from 'react'

interface Inbox {
  id: number
  name: string
}

interface InboxSelectorProps {
  selectedInbox: string | null
  onInboxChange: (inboxName: string) => void
}

export default function InboxSelector({ selectedInbox, onInboxChange }: InboxSelectorProps) {
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInboxes()
  }, [])

  const fetchInboxes = async () => {
    try {
      const response = await fetch('/api/inboxes', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setInboxes(data)

        // Auto-seleccionar el primer inbox si no hay uno seleccionado
        if (data.length > 0 && !selectedInbox) {
          onInboxChange(data[0].name)
        }
      } else if (response.status === 401) {
        setError('Sesión expirada')
      } else {
        setError('Error al cargar inboxes')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-8">
        <div className="flex items-center">
          <span className="mr-2">❌</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <select
        id="inbox-select"
        value={selectedInbox || ''}
        onChange={(e) => onInboxChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white text-gray-900"
      >
        <option value="">Selecciona un inbox para comenzar</option>
        {inboxes.map((inbox) => (
          <option key={inbox.id} value={inbox.name}>
            {inbox.name}
          </option>
        ))}
      </select>

      {inboxes.length === 0 && (
        <div className="mt-4 text-center py-4">
          <span className="text-gray-600 text-sm">No hay inboxes disponibles</span>
        </div>
      )}
    </div>
  )
}