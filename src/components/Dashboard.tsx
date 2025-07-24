'use client'

import { useStore } from '@/store/useStore'
import { getDashboardOverview, getActivityData, getDataQuality, getSystemStats, getFiles } from '@/lib/api'
import { useEffect, useState } from 'react'
import FileUpload from './FileUpload'
import FileList from './FileList'
import DataTable from './DataTable'
import StatsDashboard from './StatsDashboard'
import FileComparison from './FileComparison'
import ThemeToggle from './ThemeToggle'
import type { FileData } from '@/store/useStore'
import type { DashboardOverview, ActivityData, DataQuality, SystemStats } from '@/lib/api'
import { getTheme } from '@/lib/theme'

type ViewType = 'admin-dashboard' | 'files' | 'data' | 'stats' | 'comparison'

interface DashboardData {
    overview: DashboardOverview | null
    activity: ActivityData | null
    quality: DataQuality | null
    system: SystemStats | null
}

export default function Dashboard() {
    const { logout, token, setFiles, theme } = useStore()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
    const [activeView, setActiveView] = useState<ViewType>('admin-dashboard')
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        overview: null,
        activity: null,
        quality: null,
        system: null
    })

    const currentTheme = getTheme(theme)

    const handleLogout = () => {
        logout()
    }

    const loadFiles = async () => {
        if (!token) {
            console.warn('No token available for loading files')
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log('Loading files...')
            const backendFiles = await getFiles(token)
            console.log('Files loaded successfully:', backendFiles)

            const files: FileData[] = backendFiles.map(file => ({
                id: file.id,
                filename: file.filename,
                upload_timestamp: file.upload_timestamp,
                status: file.status as FileData['status'],
                row_count: file.row_count
            }))

            setFiles(files)
            console.log('Files set in store:', files)
        } catch (err) {
            console.error('Failed to load files:', err)
            setError(err instanceof Error ? err.message : 'Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const loadDashboardData = async () => {
        if (!token) return

        try {
            setLoading(true)
            setError(null)

            // Load all dashboard data in parallel
            const [overview, activity, quality, system] = await Promise.all([
                getDashboardOverview(token).catch(() => null),
                getActivityData(token, 7).catch(() => null),
                getDataQuality(token).catch(() => null),
                getSystemStats(token).catch(() => null)
            ])

            setDashboardData({ overview, activity, quality, system })
        } catch (err) {
            console.error('Failed to load dashboard data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadSuccess = () => {
        loadFiles()
        if (activeView === 'admin-dashboard') {
            loadDashboardData()
        }
    }

    const handleFileSelect = (file: FileData) => {
        setSelectedFile(file)
        setActiveView('data')
    }

    const handleViewChange = (view: ViewType) => {
        if (view === 'files') {
            setSelectedFile(null)
            loadFiles() // Explicitly load files when switching to files view
        }
        if (view === 'admin-dashboard') {
            loadDashboardData()
        }
        setActiveView(view)
    }

    useEffect(() => {
        if (activeView === 'admin-dashboard') {
            loadDashboardData()
        } else if (activeView === 'files') {
            loadFiles()
        }
    }, [token, activeView])

    const MetricCard = ({ title, value, icon, subtitle, colorType = 'primary' }: {
        title: string
        value: string | number
        icon: React.ReactNode
        subtitle?: string
        colorType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
    }) => {
        const accent = currentTheme.accents[colorType]

        return (
            <div className={`${accent.bg} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm opacity-90 font-medium">{title}</p>
                        <p className="text-3xl font-bold mt-2 transition-all duration-300">{value}</p>
                        {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
                    </div>
                    <div className="text-white opacity-80 transform transition-transform duration-300 hover:scale-110">
                        {icon}
                    </div>
                </div>
            </div>
        )
    }

    const ActivityChart = ({ data }: { data: ActivityData | null }) => {
        if (!data || !data.daily_activity || !Array.isArray(data.daily_activity)) {
            return (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>No activity data available</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Activity (Last 7 Days)</h3>
                </div>
                <div className="space-y-3">
                    {data.daily_activity.map((day, index) => (
                        <div key={index} className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="font-medium text-gray-900">
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span>{day.files_uploaded} files</span>
                                </span>
                                <span className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{day.files_processed} processed</span>
                                </span>
                                <span className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>{day.total_rows.toLocaleString()} rows</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const DataQualityWidget = ({ data }: { data: DataQuality | null }) => {
        if (!data || !data.overall) {
            return (
                <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No quality data available</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Data Quality Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-600">{data.overall?.average_completeness?.toFixed(1) || 0}%</div>
                                <div className="text-sm text-green-700 font-medium">Average Completeness</div>
                            </div>
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{data.overall?.average_quality_score?.toFixed(1) || 0}</div>
                                <div className="text-sm text-blue-700 font-medium">Quality Score</div>
                            </div>
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">High Quality Files:</span>
                        </div>
                        <span className="font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                            {data.overall?.files_with_high_quality || 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-sm text-gray-700">Files with Issues:</span>
                        </div>
                        <span className="font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm">
                            {data.overall?.files_with_issues || 0}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const RecentFiles = ({ files }: { files: any[] }) => {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
                <div className="space-y-3">
                    {files && Array.isArray(files) ? files.slice(0, 5).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl">📄</div>
                                <div>
                                    <div className="font-medium text-gray-900">{file.filename}</div>
                                    <div className="text-sm text-gray-500">{file.rows?.toLocaleString() || 0} rows</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex px-2 py-1 text-xs rounded-full ${file.status === 'Done' ? 'bg-green-100 text-green-800' :
                                    file.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {file.status}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(file.upload_time).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            </div>
        )
    }

    const SystemHealth = ({ data }: { data: SystemStats | null }) => {
        if (!data || !data.directories || !data.api_info || !data.processing) {
            return (
                <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p>System data unavailable</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xl font-bold text-blue-600">{data.directories.uploads.file_count}</div>
                                <div className="text-sm text-blue-700 font-medium">CSV Files</div>
                                <div className="text-xs text-gray-600">{data.directories.uploads.total_size_mb.toFixed(1)} MB</div>
                            </div>
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xl font-bold text-green-600">{data.directories.parquet.file_count}</div>
                                <div className="text-sm text-green-700 font-medium">Parquet Files</div>
                                <div className="text-xs text-gray-600">{data.directories.parquet.total_size_mb.toFixed(1)} MB</div>
                            </div>
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">API Version:</span>
                        </div>
                        <span className="font-medium text-gray-900 bg-gray-200 px-2 py-1 rounded text-sm">{data.api_info.version}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">Max File Size:</span>
                        </div>
                        <span className="font-medium text-gray-900 bg-gray-200 px-2 py-1 rounded text-sm">{data.processing.max_file_size_mb} MB</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm text-gray-700">CORS Enabled:</span>
                        </div>
                        <span className={`font-medium px-2 py-1 rounded text-sm ${data.api_info.cors_enabled
                            ? 'text-green-700 bg-green-100'
                            : 'text-red-700 bg-red-100'
                            }`}>
                            {data.api_info.cors_enabled ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen transition-all duration-500 ${currentTheme.bg.primary}`}>
            {/* Header */}
            <header className={`${currentTheme.bg.card} shadow-lg ${currentTheme.border.primary} border-b backdrop-blur-md`}>
                <div className=" px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 transition-all duration-300">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-600 transition-all duration-300">
                                    {selectedFile
                                        ? `Analyzing: ${selectedFile.filename}`
                                        : 'Complete system analytics and file management'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {selectedFile && (
                                <button
                                    onClick={() => handleViewChange('admin-dashboard')}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Dashboard
                                </button>
                            )}
                            <button
                                onClick={() => handleViewChange('admin-dashboard')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === 'admin-dashboard'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => handleViewChange('files')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${activeView === 'files'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Files
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            {selectedFile && (
                <div className="bg-white border-b border-gray-200">
                    <div className=" px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            {['data', 'stats', 'comparison'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => handleViewChange(view as ViewType)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all duration-200 ${activeView === view
                                        ? 'border-indigo-500 text-indigo-600 transform scale-105'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {view === 'data' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                        </svg>
                                    )}
                                    {view === 'stats' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                    {view === 'comparison' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    )}
                                    <span>{view}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className=" py-6 sm:px-6 lg:px-8">
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

                    {/* Admin Dashboard View */}
                    {activeView === 'admin-dashboard' && (
                        <div className="space-y-8">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                                        <p className="text-lg text-gray-600 animate-pulse">Loading dashboard analytics...</p>
                                        <p className="text-sm text-gray-500 mt-2">Fetching system insights and metrics</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Key Metrics Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <MetricCard
                                            title="Total Files"
                                            value={dashboardData.overview?.overview?.total_files || 0}
                                            icon={
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 000 4h8a2 2 0 000-4M8 5H5a2 2 0 00-2 2v2a2 2 0 002 2h3V5z" />
                                                </svg>
                                            }
                                            subtitle="Files managed"
                                            colorType="info"
                                        />
                                        <MetricCard
                                            title="Success Rate"
                                            value={`${dashboardData.overview?.overview?.success_rate_percentage?.toFixed(1) || 0}%`}
                                            icon={
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            }
                                            subtitle="Processing success"
                                            colorType="success"
                                        />
                                        <MetricCard
                                            title="Space Saved"
                                            value={`${dashboardData.overview?.storage?.space_saved_percentage?.toFixed(1) || 0}%`}
                                            icon={
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                </svg>
                                            }
                                            subtitle="Storage optimization"
                                            colorType="purple"
                                        />
                                        <MetricCard
                                            title="Total Rows"
                                            value={(dashboardData.overview?.overview?.total_rows_processed || 0).toLocaleString()}
                                            icon={
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            }
                                            subtitle="Data processed"
                                            colorType="warning"
                                        />
                                    </div>

                                    {/* Storage Analytics */}
                                    {dashboardData.overview?.storage && (
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center space-x-2 mb-6">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900">Storage Analytics</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 text-center hover:shadow-md transition-all duration-200">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                                        {dashboardData.overview.storage.compression_ratio?.toFixed(1) || 0}x
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-700">Compression Ratio</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200 text-center hover:shadow-md transition-all duration-200">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-red-600 mb-2">
                                                        {dashboardData.overview.storage.total_csv_size_mb?.toFixed(1) || 0} MB
                                                    </div>
                                                    <div className="text-sm font-medium text-red-700">Original CSV Size</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 text-center hover:shadow-md transition-all duration-200">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                                        {dashboardData.overview.storage.total_parquet_size_mb?.toFixed(1) || 0} MB
                                                    </div>
                                                    <div className="text-sm font-medium text-green-700">Compressed Parquet</div>
                                                </div>
                                            </div>
                                            {/* Progress Bar for Space Saved */}
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Space Saved</span>
                                                    <span className="text-sm font-bold text-purple-600">
                                                        {dashboardData.overview.storage.space_saved_percentage?.toFixed(1) || 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${dashboardData.overview.storage.space_saved_percentage || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Activity and Quality Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                            <ActivityChart data={dashboardData.activity} />
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                            <DataQualityWidget data={dashboardData.quality} />
                                        </div>
                                    </div>

                                    {/* Recent Files and System Health */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                            <RecentFiles files={dashboardData.overview?.recent_activity.latest_uploads || []} />
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                            <SystemHealth data={dashboardData.system} />
                                        </div>
                                    </div>

                                    {/* File Distribution */}
                                    {dashboardData.overview?.file_distribution?.by_status && (
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center space-x-2 mb-6">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900">File Status Distribution</h3>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 text-center hover:shadow-md transition-all duration-200 hover:scale-105 transform">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                                        {dashboardData.overview.file_distribution.by_status.done || 0}
                                                    </div>
                                                    <div className="text-sm font-medium text-green-700">Completed</div>
                                                    <div className="mt-2 text-xs text-gray-600">Successfully processed</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 text-center hover:shadow-md transition-all duration-200 hover:scale-105 transform">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                                                        {dashboardData.overview.file_distribution.by_status.processing || 0}
                                                    </div>
                                                    <div className="text-sm font-medium text-yellow-700">Processing</div>
                                                    <div className="mt-2 text-xs text-gray-600">Currently converting</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200 text-center hover:shadow-md transition-all duration-200 hover:scale-105 transform">
                                                    <div className="flex justify-center mb-3">
                                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-3xl font-bold text-red-600 mb-2">
                                                        {dashboardData.overview.file_distribution.by_status.error || 0}
                                                    </div>
                                                    <div className="text-sm font-medium text-red-700">Errors</div>
                                                    <div className="mt-2 text-xs text-gray-600">Failed to process</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Files Management View */}
                    {activeView === 'files' && (
                        <div className="space-y-8">
                            {/* Upload Section */}
                            <div className={`${currentTheme.bg.card} shadow-xl rounded-2xl p-8 ${currentTheme.border.primary} border backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className={`p-3 ${currentTheme.accents.primary.light} rounded-xl`}>
                                        <svg className={`w-8 h-8 ${currentTheme.accents.primary.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${currentTheme.text.primary}`}>Upload CSV Files</h2>
                                        <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>Drag and drop or click to upload your files</p>
                                    </div>
                                </div>
                                <FileUpload onUploadSuccess={handleUploadSuccess} />
                            </div>

                            {/* Files Section */}
                            <div className={`${currentTheme.bg.card} shadow-xl rounded-2xl p-8 ${currentTheme.border.primary} border backdrop-blur-sm`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-3 ${currentTheme.accents.info.light} rounded-xl`}>
                                            <svg className={`w-8 h-8 ${currentTheme.accents.info.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${currentTheme.text.primary}`}>Your Files</h2>
                                            <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>Manage and analyze your uploaded CSV files</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={loadFiles}
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Refreshing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Refresh Status
                                            </>
                                        )}
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <div className={`animate-spin rounded-full h-12 w-12 border-b-4 ${currentTheme.accents.primary.text} mx-auto mb-6`}></div>
                                            <h3 className={`text-lg font-semibold ${currentTheme.text.primary} mb-2`}>Loading your files</h3>
                                            <p className={`text-sm ${currentTheme.text.secondary}`}>Please wait while we fetch your uploaded files...</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className={`text-center py-20 ${currentTheme.accents.danger.light} rounded-2xl ${currentTheme.border.primary} border`}>
                                        <div className={`inline-flex p-6 ${currentTheme.accents.danger.light} rounded-full mb-6`}>
                                            <svg className={`h-12 w-12 ${currentTheme.accents.danger.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <h3 className={`text-lg font-semibold ${currentTheme.accents.danger.text} mb-2`}>Unable to load files</h3>
                                        <p className={`text-sm ${currentTheme.text.muted} mb-6 max-w-md mx-auto`}>{error}</p>
                                        <button
                                            onClick={loadFiles}
                                            className={`px-6 py-3 text-sm font-semibold rounded-xl ${currentTheme.accents.primary.bg} text-white hover:shadow-lg transition-all duration-200 hover:scale-105`}
                                        >
                                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <FileList onFileSelect={handleFileSelect} />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Individual File Analysis Views */}
                    {activeView === 'data' && selectedFile && (
                        <DataTable fileId={Number(selectedFile.id)} />
                    )}

                    {activeView === 'stats' && selectedFile && (
                        <StatsDashboard fileId={Number(selectedFile.id)} />
                    )}

                    {activeView === 'comparison' && selectedFile && (
                        <FileComparison fileId={Number(selectedFile.id)} />
                    )}
                </div>
            </main>
        </div>
    )
} 