'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import VendedorWeightList from '@/components/VendedorWeightList'
import LoginForm from '@/components/LoginForm'
import Header from '@/components/Header'
import InboxSelector from '@/components/InboxSelector'
import WeightDistribution from '@/components/WeightDistribution'

interface Vendedor {
  user_id: number
  user_name: string
  inbox_id: number
  inbox_name: string
  peso: number
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [selectedInbox, setSelectedInbox] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchVendedores = useCallback(async () => {
    if (!isAuthenticated || !selectedInbox) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vendedores?inbox=${encodeURIComponent(selectedInbox)}`, {
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
  }, [isAuthenticated, selectedInbox])

  // Cargar vendedores cuando se autentica o cambia el inbox
  useEffect(() => {
    fetchVendedores()
  }, [fetchVendedores])

  const handleInboxChange = (inboxName: string) => {
    setSelectedInbox(inboxName)
    setVendedores([]) // Limpiar vendedores mientras se carga el nuevo inbox
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleUpdateWeight = async (vendedorId: number, newWeight: number) => {
    if (!selectedInbox) {
      showMessage('error', 'No hay inbox seleccionado')
      return
    }

    // Buscar el inbox_id del inbox seleccionado
    const vendedor = vendedores.find(v => v.user_id === vendedorId)
    if (!vendedor) {
      showMessage('error', 'Vendedor no encontrado')
      return
    }

    try {
      const response = await fetch(`/api/vendedores/${vendedorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peso: newWeight,
          inboxId: vendedor.inbox_id
        }),
        credentials: 'include'
      })

      if (response.ok) {
        showMessage('success', 'Peso actualizado exitosamente')
        fetchVendedores()
      } else if (response.status === 401) {
        showMessage('error', 'Sesión expirada. Por favor inicia sesión nuevamente.')
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'Error al actualizar peso')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
  }

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

  if (loading && selectedInbox) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <InboxSelector
            selectedInbox={selectedInbox}
            onInboxChange={handleInboxChange}
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
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Inbox Selector */}
        <InboxSelector
          selectedInbox={selectedInbox}
          onInboxChange={handleInboxChange}
        />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Messages */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Vendedores */}
          {!selectedInbox ? (
            <div className="text-center py-20">
              <div className="text-gray-600 text-6xl mb-4">📥</div>
              <p className="text-gray-700 mb-2">Selecciona un inbox</p>
              <p className="text-gray-600 text-sm">para ver y asignar pesos a los vendedores</p>
            </div>
          ) : vendedores.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-600 text-6xl mb-4">👥</div>
              <p className="text-gray-700">No hay vendedores en este inbox</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lista de vendedores - Columna izquierda */}
              <div className="space-y-4">
                <div className="text-sm text-gray-700 border-b border-gray-200 pb-2">
                  Haz clic en un vendedor para asignar peso
                </div>
                <VendedorWeightList
                  vendedores={vendedores}
                  onUpdateWeight={handleUpdateWeight}
                />
              </div>

              {/* Distribución de pesos - Columna derecha */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <WeightDistribution vendedores={vendedores} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
