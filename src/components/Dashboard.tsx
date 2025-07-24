'use client'

import { useStore } from '@/store/useStore'
import { getFiles } from '@/lib/api'
import { useEffect, useState } from 'react'
import FileUpload from './FileUpload'
import FileList from './FileList'
import type { FileData } from '@/store/useStore'

export default function Dashboard() {
    const { logout, token, setFiles } = useStore()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleLogout = () => {
        logout()
    }

    const loadFiles = async () => {
        if (!token) return

        try {
            setLoading(true)
            setError(null)
            const backendFiles = await getFiles(token)

            // Convert backend format to our store format
            const files: FileData[] = backendFiles.map(file => ({
                id: file.id,
                filename: file.filename,
                upload_timestamp: file.upload_timestamp,
                status: file.status as FileData['status'],
                row_count: file.row_count
            }))

            setFiles(files)
        } catch (err) {
            console.error('Failed to load files:', err)
            setError(err instanceof Error ? err.message : 'Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadSuccess = () => {
        // Refresh file list after successful upload
        loadFiles()
    }

    useEffect(() => {
        loadFiles()
    }, [token])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                CSV File Manager
                            </h1>
                            <p className="text-sm text-gray-600">
                                Upload and manage your CSV files
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadFiles}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <svg
                                    className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Upload Section */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Upload CSV Files
                            </h2>
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                        </div>

                        {/* File List Section */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <FileList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 