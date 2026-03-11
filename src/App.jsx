import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Cookbook from './pages/Cookbook'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddEditRecipe from './pages/AddEditRecipe'
import ImportRecipe from './pages/ImportRecipe'
import WhatCanICook from './pages/WhatCanICook'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
          <span className="text-sm text-stone-500">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
          <span className="text-sm text-stone-500">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/moms" element={<Cookbook />} />
          <Route path="/bakery" element={<Cookbook />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/add" element={<AddEditRecipe />} />
          <Route path="/edit/:id" element={<AddEditRecipe />} />
          <Route path="/import" element={<ImportRecipe />} />
          <Route path="/cook" element={<WhatCanICook />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
