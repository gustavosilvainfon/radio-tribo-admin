'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <header className="bg-black/40 backdrop-blur-lg border-b border-red-900/30 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Painel Administrativo</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
