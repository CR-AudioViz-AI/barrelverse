// app/auth/login/page.tsx
// BarrelVerse Login Page

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading, error } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      setFormError('Please fill in all fields')
      return
    }

    const result = await signIn(email, password)
    
    if (result.error) {
      setFormError(result.error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl mb-2 block">🥃</span>
            <h1 className="text-2xl font-bold text-white">BarrelVerse</h1>
          </Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          {(formError || error) && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {formError || error?.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            <Link href="/auth/forgot-password" className="hover:text-white transition-colors">
              Forgot your password?
            </Link>
          </div>
        </form>

        {/* Sign up link */}
        <p className="mt-6 text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Create one
          </Link>
        </p>

        {/* Age verification notice */}
        <p className="mt-8 text-center text-xs text-gray-500">
          By signing in, you confirm that you are of legal drinking age in your jurisdiction.
          Must be 21+ in the United States.
        </p>
      </div>
    </main>
  )
}
