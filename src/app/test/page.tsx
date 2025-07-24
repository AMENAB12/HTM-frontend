'use client'

import { useState } from 'react'

export default function TestPage() {
    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')

    const testConnection = async () => {
        setStatus('Testing connection...')
        setError('')

        try {
            // Test basic connectivity
            const response = await fetch('http://localhost:8000/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                setStatus('Backend is reachable!')
            } else {
                setStatus(`Backend responded with status: ${response.status}`)
            }
        } catch (err) {
            setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setStatus('Connection failed')
        }
    }

    const testLogin = async () => {
        setStatus('Testing login...')
        setError('')

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'test', password: 'password' }),
            })

            if (response.ok) {
                const data = await response.json()
                setStatus(`Login successful! Token: ${data.access_token.substring(0, 20)}...`)
            } else {
                const errorData = await response.json().catch(() => ({}))
                setStatus(`Login failed with status: ${response.status}`)
                setError(errorData.detail || 'Unknown error')
            }
        } catch (err) {
            setError(`Login request failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setStatus('Login request failed')
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>

            <div className="space-y-4">
                <button
                    onClick={testConnection}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test Backend Connection
                </button>

                <button
                    onClick={testLogin}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
                >
                    Test Login API
                </button>
            </div>

            {status && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <strong>Status:</strong> {status}
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps:</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Make sure the backend server is running on port 8000</li>
                    <li>Check if there are any firewall or antivirus blocking the connection</li>
                    <li>Verify the backend is accessible from the browser</li>
                    <li>Check browser console for CORS errors</li>
                    <li>Try accessing http://localhost:8000 directly in browser</li>
                </ol>
            </div>
        </div>
    )
} 