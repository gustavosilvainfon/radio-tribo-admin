import './globals.css'

export const metadata = {
  title: 'Painel Administrativo - Rádio Tribo',
  description: 'Gerenciamento completo da Rádio Tribo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-black via-red-900 to-purple-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}


