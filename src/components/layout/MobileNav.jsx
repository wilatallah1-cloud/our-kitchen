import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, CakeSlice, Plus, Search } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/moms', icon: BookOpen, label: 'Mom' },
  { to: '/add', icon: Plus, label: 'Add', isAction: true },
  { to: '/bakery', icon: CakeSlice, label: 'Bakery' },
  { to: '/cook', icon: Search, label: 'Cook' },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          if (item.isAction) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-center w-12 h-12 -mt-4 bg-stone-800 text-white rounded-2xl shadow-lg"
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-stone-900' : 'text-stone-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
