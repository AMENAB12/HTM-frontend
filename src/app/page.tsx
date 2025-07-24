'use client'

import { useStore } from '@/store/useStore'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const isAuthenticated = useStore((state) => state.isAuthenticated)

  return isAuthenticated ? <Dashboard /> : <LoginForm />
}
