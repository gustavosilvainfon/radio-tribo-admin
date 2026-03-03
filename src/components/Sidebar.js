'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  NewspaperIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  MusicalNoteIcon,
  MegaphoneIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Streaming', href: '/streaming', icon: ChartBarIcon },
  { name: 'Notícias', href: '/noticias', icon: NewspaperIcon },
  { name: 'Tabela de Preços', href: '/precos', icon: CurrencyDollarIcon },
  { name: 'Contatos', href: '/contatos', icon: PhoneIcon },
  { name: 'Pedidos Musicais', href: '/pedidos', icon: MusicalNoteIcon },
  { name: 'Anúncios', href: '/anuncios', icon: MegaphoneIcon },
  { name: 'Assets Visuais', href: '/assets', icon: PhotoIcon },
  { name: 'Estatísticas', href: '/estatisticas', icon: ChartBarIcon },
  { name: 'Configurações', href: '/configuracoes', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-black/40 backdrop-blur-sm border-r border-red-900/30 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          Rádio Tribo
        </h1>
        <p className="text-sm text-gray-400 mt-1">Painel Administrativo</p>
      </div>
      
      <nav className="mt-8 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-red-600/50 to-purple-600/50 text-white border border-red-500/30' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

