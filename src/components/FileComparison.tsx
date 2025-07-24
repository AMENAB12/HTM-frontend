'use client'

import { useState, useEffect } from 'react'
import { getFilePreview } from '@/lib/api'
import { useStore } from '@/store/useStore'
import type { FilePreview } from '@/lib/api'

interface FileComparisonProps {
    fileId: number
}

interface DataPreviewTableProps {
    data: {
        columns: string[]
        data: Record<string, any>[]
        rows_returned: number
    }
    title: string
    format: 'csv' | 'parquet'
    isActive?: boolean
}

function DataPreviewTable({ data, title, format, isActive = true }: DataPreviewTableProps) {
    const bgColor = format === 'csv' ? 'from-red-50 to-pink-50' : 'from-green-50 to-emerald-50'
    const borderColor = format === 'csv' ? 'border-red-200' : 'border-green-200'
    const iconColor = format === 'csv' ? 'text-red-600' : 'text-green-600'
    const badgeColor = format === 'csv' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'

    return (
        <div className={`bg-white border-2 ${borderColor} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${isActive ? 'transform scale-100' : 'transform scale-95 opacity-75'}`}>
            <div className={`bg-gradient-to-r ${bgColor} px-6 py-4 border-b ${borderColor}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                            {format === 'csv' ? (
                                <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            ) : (
                                <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
                            <p className="text-sm text-gray-600">Showing {data.rows_returned} sample rows</p>
                        </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-semibold ${badgeColor}`}>
                        {format.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {data.columns.map((column, index) => (
                                <th
                                    key={column}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-50 sticky top-0"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span>{column}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                {data.columns.map((column) => (
                                    <td key={column} className="px-6 py-4 text-sm text-gray-900">
                                        <div className="max-w-xs truncate" title={String(row[column])}>
                                            {row[column] !== null && row[column] !== undefined ? (
                                                <span className="font-medium">{String(row[column])}</span>
                                            ) : (
                                                <span className="text-gray-400 italic bg-gray-100 px-2 py-1 rounded-md text-xs">
                                                    null
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function FileComparison({ fileId }: FileComparisonProps) {
    const [preview, setPreview] = useState<FilePreview | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'csv' | 'parquet'>('csv')
    const [showSideBySide, setShowSideBySide] = useState(false)
    const { token } = useStore()

    useEffect(() => {
        const fetchPreview = async () => {
            if (!token) return

            try {
                setLoading(true)
                setError(null)
                const result = await getFilePreview(fileId, token, 10)
                setPreview(result)
            } catch (err) {
                console.error('Error fetching preview:', err)
                setError(err instanceof Error ? err.message : 'Failed to load preview')
            } finally {
                setLoading(false)
            }
        }

        fetchPreview()
    }, [fileId, token])

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-gray-900">Loading Comparison</h3>
                        <p className="text-gray-600">Preparing before & after preview...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-8">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-red-800">Preview Unavailable</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!preview) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No preview available</h3>
                    <p className="text-gray-500">Unable to generate file preview</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-xl text-white overflow-hidden">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Before & After Comparison</h3>
                            <p className="text-indigo-100">
                                See how your CSV data transforms into an optimized Parquet format
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold">📊</div>
                                <p className="text-xs text-indigo-100">Data</p>
                            </div>
                            <div className="text-2xl text-indigo-200">→</div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">⚡</div>
                                <p className="text-xs text-indigo-100">Optimized</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowSideBySide(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${!showSideBySide
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <span>Tabbed View</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowSideBySide(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${showSideBySide
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                            </svg>
                            <span>Side by Side</span>
                        </div>
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Choose your preferred comparison view
                </div>
            </div>

            {/* Tabbed View */}
            {!showSideBySide && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('csv')}
                                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'csv'
                                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-b-3 border-red-500'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'csv' ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                        <svg className={`w-5 h-5 ${activeTab === 'csv' ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-lg">Original CSV</div>
                                        <div className="text-xs opacity-75">Raw format</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab('parquet')}
                                disabled={!preview.parquet_preview}
                                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'parquet'
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-b-3 border-green-500'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'parquet' ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                        <svg className={`w-5 h-5 ${activeTab === 'parquet' ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-lg">Converted Parquet</div>
                                        <div className="text-xs opacity-75">Optimized format</div>
                                    </div>
                                </div>
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'csv' && preview.csv_preview && (
                            <DataPreviewTable
                                data={preview.csv_preview}
                                title="Original CSV Data"
                                format="csv"
                            />
                        )}

                        {activeTab === 'parquet' && preview.parquet_preview && (
                            <DataPreviewTable
                                data={preview.parquet_preview}
                                title="Converted Parquet Data"
                                format="parquet"
                            />
                        )}

                        {activeTab === 'parquet' && !preview.parquet_preview && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Parquet Conversion Pending</h4>
                                <p className="text-gray-500">The Parquet version is still being processed</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Side-by-side View */}
            {showSideBySide && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {preview.csv_preview && (
                        <DataPreviewTable
                            data={preview.csv_preview}
                            title="Original CSV Data"
                            format="csv"
                        />
                    )}
                    {preview.parquet_preview ? (
                        <DataPreviewTable
                            data={preview.parquet_preview}
                            title="Converted Parquet Data"
                            format="parquet"
                        />
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Parquet Processing</h4>
                            <p className="text-gray-500">Conversion in progress...</p>
                        </div>
                    )}
                </div>
            )}

           
        </div>
    )
} 