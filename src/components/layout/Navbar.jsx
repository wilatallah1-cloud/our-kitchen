import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Plus, ChefHat, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Logged out')
      navigate('/')
    } catch {
      toast.error('Failed to log out')
    }
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/moms', label: "🍲 Mom's Kitchen" },
    { to: '/bakery', label: "🧁 Bakery" },
    { to: '/cook', label: '🔍 What Can I Cook?' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-stone-700" />
            <span className="text-lg font-bold text-stone-800 hidden sm:inline">Our Kitchen</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/add"
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Recipe</span>
            </Link>

            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-600 hidden sm:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
