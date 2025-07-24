'use client'

import { useState, useEffect } from 'react'
import { getFileStatistics } from '@/lib/api'
import { useStore } from '@/store/useStore'
import type { FileStatistics } from '@/lib/api'

interface StatsDashboardProps {
    fileId: number
}

export default function StatsDashboard({ fileId }: StatsDashboardProps) {
    const [stats, setStats] = useState<FileStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [animateCounters, setAnimateCounters] = useState(false)
    const { token } = useStore()

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return

            try {
                setLoading(true)
                setError(null)
                const result = await getFileStatistics(fileId, token)
                setStats(result)
                // Trigger counter animations after data loads
                setTimeout(() => setAnimateCounters(true), 500)
            } catch (err) {
                console.error('Error fetching statistics:', err)
                setError(err instanceof Error ? err.message : 'Failed to load statistics')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [fileId, token])

    const ProgressBar = ({ percentage, color }: { percentage: number, color: string }) => (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${color}`}
                style={{ width: animateCounters ? `${Math.min(percentage, 100)}%` : '0%' }}
            />
        </div>
    )

    const StatCard = ({
        title,
        value,
        icon,
        gradient,
        prefix = '',
        suffix = '',
        subtitle
    }: {
        title: string
        value: number | string
        icon: React.ReactNode
        gradient: string
        prefix?: string
        suffix?: string
        subtitle?: string
    }) => (
        <div className={`relative overflow-hidden rounded-xl ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/80">{title}</p>
                    <p className={`text-3xl font-bold text-white mt-2 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-white/70 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="flex-shrink-0 opacity-80">
                    {icon}
                </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 bg-white/10 rounded-full"></div>
        </div>
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Analyzing Your Data</h3>
                    <p className="text-gray-600">Computing comprehensive statistics and insights...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-800">Statistics Unavailable</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-lg">No statistics available</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Rows"
                    value={stats.file_info.total_rows}
                    icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>}
                    gradient="bg-gradient-to-r from-blue-600 to-blue-700"
                    subtitle="Data records processed"
                />

                <StatCard
                    title="Columns"
                    value={stats.file_info.total_columns}
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
                    gradient="bg-gradient-to-r from-green-600 to-green-700"
                    subtitle="Data dimensions"
                />

                <StatCard
                    title="Compression"
                    value={stats.file_sizes.compression_ratio.toFixed(1)}
                    suffix="x"
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>}
                    gradient="bg-gradient-to-r from-purple-600 to-purple-700"
                    subtitle="Size reduction achieved"
                />

                <StatCard
                    title="Space Saved"
                    value={stats.file_sizes.space_saved_percentage.toFixed(1)}
                    suffix="%"
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    gradient="bg-gradient-to-r from-orange-600 to-red-600"
                    subtitle="Storage optimized"
                />
            </div>

            {/* Data Quality Dashboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Data Quality Assessment
                    </h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <p className={`text-3xl font-bold text-red-700 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                {stats.data_quality.total_missing_values.toLocaleString()}
                            </p>
                            <p className="text-sm font-medium text-red-600 mt-1">Missing Values</p>
                            <div className="mt-3">
                                <ProgressBar
                                    percentage={stats.data_quality.missing_percentage}
                                    color="bg-red-500"
                                />
                                <p className="text-xs text-red-500 mt-1">{stats.data_quality.missing_percentage.toFixed(2)}% of total</p>
                            </div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className={`text-3xl font-bold text-yellow-700 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                {stats.data_quality.duplicate_rows.toLocaleString()}
                            </p>
                            <p className="text-sm font-medium text-yellow-600 mt-1">Duplicate Rows</p>
                            <div className="mt-3">
                                <ProgressBar
                                    percentage={(stats.data_quality.duplicate_rows / stats.file_info.total_rows) * 100}
                                    color="bg-yellow-500"
                                />
                                <p className="text-xs text-yellow-500 mt-1">
                                    {((stats.data_quality.duplicate_rows / stats.file_info.total_rows) * 100).toFixed(2)}% of rows
                                </p>
                            </div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className={`text-3xl font-bold text-green-700 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                {stats.data_quality.unique_rows.toLocaleString()}
                            </p>
                            <p className="text-sm font-medium text-green-600 mt-1">Unique Rows</p>
                            <div className="mt-3">
                                <ProgressBar
                                    percentage={(stats.data_quality.unique_rows / stats.file_info.total_rows) * 100}
                                    color="bg-green-500"
                                />
                                <p className="text-xs text-green-500 mt-1">
                                    {((stats.data_quality.unique_rows / stats.file_info.total_rows) * 100).toFixed(2)}% unique
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column Analysis */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        Column Analysis
                        <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {stats.columns.length} columns
                        </span>
                    </h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {stats.columns.map((column, index) => (
                            <div
                                key={column.name}
                                className={`border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${animateCounters ? 'animate-fade-in' : 'opacity-0'}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900 truncate flex-1">{column.name}</h4>
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${column.data_type === 'object' ? 'bg-blue-100 text-blue-800' :
                                        column.data_type === 'int64' || column.data_type === 'float64' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {column.data_type}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Missing:</span>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-900">
                                                {column.missing_count.toLocaleString()}
                                            </span>
                                            <div className="w-16 mt-1">
                                                <ProgressBar
                                                    percentage={column.missing_percentage}
                                                    color="bg-red-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unique:</span>
                                        <span className="font-semibold text-gray-900">{column.unique_count.toLocaleString()}</span>
                                    </div>

                                    {/* Numeric statistics */}
                                    {column.min_value !== undefined && (
                                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Range:</span>
                                                <span className="font-semibold text-gray-900 text-xs">
                                                    {column.min_value} → {column.max_value}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Mean:</span>
                                                <span className="font-semibold text-gray-900">{column.mean_value?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Median:</span>
                                                <span className="font-semibold text-gray-900">{column.median_value}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sample values */}
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <span className="text-gray-600 text-xs font-medium">Sample Values:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {column.sample_values && column.sample_values.length > 0 ? (
                                                column.sample_values.slice(0, 4).map((value, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex px-2 py-1 text-xs bg-white border border-gray-300 rounded-md shadow-sm max-w-24 overflow-hidden"
                                                        title={String(value)}
                                                    >
                                                        <span className="truncate">
                                                            {value !== null && value !== undefined ? String(value) : 'null'}
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No sample data available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* File Size Comparison */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </div>
                        Storage Optimization
                    </h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-red-700 mb-2">Original CSV</h4>
                                <p className={`text-4xl font-bold text-red-700 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                    {(stats.file_sizes.csv_size_bytes / 1024 / 1024).toFixed(2)}
                                </p>
                                <p className="text-red-600 font-medium">MB</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-green-700 mb-2">Converted Parquet</h4>
                                <p className={`text-4xl font-bold text-green-700 transition-all duration-700 ${animateCounters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                    {(stats.file_sizes.parquet_size_bytes / 1024 / 1024).toFixed(2)}
                                </p>
                                <p className="text-green-600 font-medium">MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                        <div className="text-2xl mb-2">🎉</div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Congratulations!</h4>
                        <p className="text-gray-700">
                            You saved <span className="font-bold text-indigo-600">{stats.file_sizes.space_saved_percentage.toFixed(1)}%</span> storage space
                            with <span className="font-bold text-purple-600">{stats.file_sizes.compression_ratio.toFixed(1)}x</span> compression ratio
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 