import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'

export default function WhatCanICookWidget() {
  return (
    <Link
      to="/cook"
      className="block p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">What Can I Cook?</h3>
          </div>
          <p className="text-sm text-emerald-600">
            Enter ingredients you have and find matching recipes
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}
