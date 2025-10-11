'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import VendedorWeightList from '@/components/VendedorWeightList'
import LoginForm from '@/components/LoginForm'
import Header from '@/components/Header'
import InboxSelector from '@/components/InboxSelector'
import MessageManager from '@/components/MessageManager'
import WeightDistribution from '@/components/WeightDistribution'

interface Vendedor {
  user_id: string
  user_name: string
  message_id: string
  message_text: string
  peso: number
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [selectedInbox, setSelectedInbox] = useState<string | null>(null)
  const [selectedInboxId, setSelectedInboxId] = useState<number | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedMessageText, setSelectedMessageText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchVendedores = useCallback(async () => {
    if (!isAuthenticated || !selectedMessageId || !selectedInboxId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vendedores?message_id=${selectedMessageId}&inbox_id=${selectedInboxId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
      } else if (response.status === 401) {
        showMessage('error', 'Sesión expirada. Por favor inicia sesión nuevamente.')
      } else {
        showMessage('error', 'Error al cargar vendedores')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, selectedMessageId, selectedInboxId])

  // Cargar vendedores cuando se autentica o cambia el mensaje
  useEffect(() => {
    fetchVendedores()
  }, [fetchVendedores])

  const handleInboxChange = (inboxName: string, inboxId: number) => {
    setSelectedInbox(inboxName)
    setSelectedInboxId(inboxId)
    setSelectedMessageId(null)
    setSelectedMessageText(null)
    setVendedores([]) // Limpiar vendedores mientras se carga el nuevo inbox
  }

  const handleMessageChange = (messageId: string, messageText: string) => {
    setSelectedMessageId(messageId)
    setSelectedMessageText(messageText)
    setVendedores([]) // Limpiar vendedores mientras se carga el nuevo mensaje
  }

  const handleMessageDeleted = () => {
    setSelectedMessageId(null)
    setSelectedMessageText(null)
    setVendedores([])
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleUpdateWeight = useCallback(async (vendedorId: string, newWeight: number) => {
    if (!selectedMessageId) {
      showMessage('error', 'No hay mensaje seleccionado')
      return
    }

    // Buscar el vendedor
    const vendedor = vendedores.find(v => v.user_id === vendedorId)
    if (!vendedor) {
      showMessage('error', 'Vendedor no encontrado')
      return
    }

    // Guardar el estado anterior para rollback
    const previousVendedores = [...vendedores]

    // 🚀 OPTIMISTIC UPDATE: Actualizar UI inmediatamente
    setVendedores(prev =>
      prev.map(v =>
        v.user_id === vendedorId
          ? { ...v, peso: newWeight }
          : v
      )
    )

    try {
      const response = await fetch(`/api/vendedores/${vendedorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peso: newWeight,
          messageId: selectedMessageId
        }),
        credentials: 'include'
      })

      if (response.ok) {
        showMessage('success', 'Peso actualizado exitosamente')
        // No necesitamos fetchVendedores() porque ya actualizamos optimistamente
      } else if (response.status === 401) {
        showMessage('error', 'Sesión expirada. Por favor inicia sesión nuevamente.')
        // Rollback en caso de error
        setVendedores(previousVendedores)
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'Error al actualizar peso')
        // Rollback en caso de error
        setVendedores(previousVendedores)
      }
    } catch {
      showMessage('error', 'Error de conexión')
      // Rollback en caso de error
      setVendedores(previousVendedores)
    }
  }, [vendedores, selectedMessageId])

  const handleLoginSuccess = () => {
    login()
    setLoading(true)
  }

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4"></div>
          <div className="text-sm text-gray-700">Verificando acceso...</div>
        </div>
      </div>
    )
  }

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  // Generar breadcrumbs
  const breadcrumbs = []
  if (selectedInbox) {
    breadcrumbs.push({ label: selectedInbox })
  }
  if (selectedMessageText) {
    breadcrumbs.push({
      label: selectedMessageText.length > 30
        ? selectedMessageText.substring(0, 30) + '...'
        : selectedMessageText,
      active: true
    })
  }

  if (loading && selectedMessageId) {
    return (
      <div className="min-h-screen bg-white">
        <Header breadcrumbs={breadcrumbs} />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <InboxSelector
            selectedInbox={selectedInbox}
            onInboxChange={handleInboxChange}
          />
          <MessageManager
            inboxId={selectedInboxId}
            inboxName={selectedInbox}
            selectedMessageId={selectedMessageId}
            onMessageChange={handleMessageChange}
            onMessageDeleted={handleMessageDeleted}
          />
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-sm text-gray-700">Cargando vendedores...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header breadcrumbs={breadcrumbs} />
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Inbox Selector */}
        <InboxSelector
          selectedInbox={selectedInbox}
          onInboxChange={handleInboxChange}
        />

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {!selectedInbox ? (
          <div className="text-center py-20">
            <div className="text-gray-600 text-6xl mb-4">📥</div>
            <p className="text-gray-700 mb-2">Selecciona un inbox</p>
            <p className="text-gray-600 text-sm">para comenzar a asignar pesos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1: Message Manager - Más estrecha */}
            <div className="lg:col-span-1">
              <MessageManager
                inboxId={selectedInboxId}
                inboxName={selectedInbox}
                selectedMessageId={selectedMessageId}
                onMessageChange={handleMessageChange}
                onMessageDeleted={handleMessageDeleted}
              />
            </div>

            {/* Columnas 2 y 3: Vendedores y Distribución */}
            <div className="lg:col-span-2">
              {!selectedMessageId ? (
                <div className="text-center py-20">
                  <div className="text-gray-600 text-6xl mb-4">💬</div>
                  <p className="text-gray-700 mb-2">Selecciona un mensaje</p>
                  <p className="text-gray-600 text-sm">para asignar pesos a los vendedores</p>
                </div>
              ) : vendedores.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-600 text-6xl mb-4">👥</div>
                  <p className="text-gray-700">No hay vendedores en este inbox</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Lista de vendedores */}
                  <div className="space-y-4">
                    <div className="text-sm text-gray-700 font-semibold border-b border-gray-200 pb-2">
                      Haz clic en un vendedor para asignar peso
                    </div>
                    <VendedorWeightList
                      vendedores={vendedores}
                      onUpdateWeight={handleUpdateWeight}
                    />
                  </div>

                  {/* Distribución de pesos */}
                  <div className="xl:sticky xl:top-8 xl:self-start">
                    <WeightDistribution vendedores={vendedores} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
