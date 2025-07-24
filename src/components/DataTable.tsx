'use client'

import { useState, useEffect } from 'react'
import { getFileData } from '@/lib/api'
import { useStore } from '@/store/useStore'
import type { FileDataResponse } from '@/lib/api'

interface DataTableProps {
    fileId: number
}

export default function DataTable({ fileId }: DataTableProps) {
    const [data, setData] = useState<FileDataResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(50)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const { token } = useStore()

    const fetchData = async () => {
        if (!token) return

        setLoading(true)
        setError(null)
        try {
            const result = await getFileData(fileId, token, {
                limit: pageSize,
                offset: currentPage * pageSize,
                format: 'parquet',
            })
            setData(result)
        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [fileId, currentPage, pageSize, token])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const filteredData = data?.data.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || []

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <p className="mt-4 text-lg font-medium text-gray-900">Loading your data...</p>
                        <p className="text-sm text-gray-500">This might take a moment</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-red-800">Unable to load data</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={fetchData}
                                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No data available</h3>
                    <p className="text-gray-500">The file appears to be empty or couldn't be processed.</p>
                </div>
            </div>
        )
    }

    const totalPages = Math.ceil(data.total_rows / pageSize)
    const startRow = currentPage * pageSize + 1
    const endRow = Math.min((currentPage + 1) * pageSize, data.total_rows)

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{data.filename}</h3>
                            <p className="text-sm text-gray-600 flex items-center space-x-4">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {data.total_rows.toLocaleString()} total rows
                                </span>
                                <span>•</span>
                                <span>{data.columns.length} columns</span>
                                <span>•</span>
                                <span>Showing {data.returned_rows} rows</span>
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search data..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Page Size Selector */}
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setCurrentPage(0)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value={25}>25 rows</option>
                            <option value={50}>50 rows</option>
                            <option value={100}>100 rows</option>
                            <option value={200}>200 rows</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {data.columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="group px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column}</span>
                                        <div className="flex flex-col">
                                            <svg className={`w-3 h-3 ${sortColumn === column && sortDirection === 'asc' ? 'text-indigo-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                            <svg className={`w-3 h-3 ${sortColumn === column && sortDirection === 'desc' ? 'text-indigo-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(searchTerm ? filteredData : data.data).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                {data.columns.map((column) => (
                                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="max-w-xs truncate" title={String(row[column])}>
                                            {row[column] !== null && row[column] !== undefined ? (
                                                <span className="font-medium">{String(row[column])}</span>
                                            ) : (
                                                <span className="text-gray-400 italic bg-gray-50 px-2 py-1 rounded text-xs">null</span>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Enhanced Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="font-medium">
                            Showing {startRow.toLocaleString()} to {endRow.toLocaleString()} of {data.total_rows.toLocaleString()} results
                        </span>
                        {searchTerm && (
                            <span className="ml-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full text-xs">
                                Filtered: {filteredData.length} matches
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(0)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            <span>First</span>
                        </button>

                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ‹ Prev
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 text-sm rounded-lg transition-all ${pageNum === currentPage
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'border border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next ›
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages - 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                        >
                            <span>Last</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 