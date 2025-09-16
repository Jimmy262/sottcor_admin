'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Sottcor Admin</h1>
          <button
            onClick={handleLogout}
            className="text-gray-700 hover:text-gray-900 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}