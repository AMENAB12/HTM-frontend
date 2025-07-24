'use client'

import { useState } from 'react'
import { useStore, type FileStatus, type FileData } from '@/store/useStore'
import { deleteFile, getDownloadUrl } from '@/lib/api'
import { format } from 'date-fns'
import FileDetailModal from './FileDetailModal'
import { getTheme } from '@/lib/theme'

function StatusBadge({ status, theme }: { status: FileStatus; theme: any }) {
    const styles = {
        Processing: `${theme.accents.warning.light} ${theme.accents.warning.text} border ${theme.accents.warning.border}`,
        Error: `${theme.accents.danger.light} ${theme.accents.danger.text} border ${theme.accents.danger.border}`,
        Done: `${theme.accents.success.light} ${theme.accents.success.text} border ${theme.accents.success.border}`,
    }

    const icons = {
        Processing: (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        ),
        Error: (
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            </svg>
        ),
        Done: (
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    }

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${styles[status]}`}
        >
            {icons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}

interface FileListProps {
    onFileSelect?: (file: FileData) => void
}

export default function FileList({ onFileSelect }: FileListProps) {
    const { files, token, removeFile, theme } = useStore()
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deletingFiles, setDeletingFiles] = useState<Set<string | number>>(new Set())
    const [downloadingFiles, setDownloadingFiles] = useState<Set<string | number>>(new Set())

    const currentTheme = getTheme(theme)

    const handleViewDetails = (fileId: number) => {
        setSelectedFileId(fileId)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedFileId(null)
    }

    const handleDeleteFile = async (fileId: number | string) => {
        if (!token) return

        const confirmed = window.confirm('Are you sure you want to delete this file?')
        if (!confirmed) return

        try {
            setDeletingFiles(prev => new Set(prev).add(fileId))
            await deleteFile(Number(fileId), token)
            removeFile(fileId)
        } catch (error) {
            console.error('Failed to delete file:', error)
            alert(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setDeletingFiles(prev => {
                const newSet = new Set(prev)
                newSet.delete(fileId)
                return newSet
            })
        }
    }

    const handleDownloadFile = async (fileId: number | string, format: 'csv' | 'parquet' = 'parquet') => {
        if (!token) return

        try {
            setDownloadingFiles(prev => new Set(prev).add(fileId))
            const downloadResponse = await getDownloadUrl(Number(fileId), token, {
                format,
                expiration_hours: 1
            })

            // Create a temporary link to trigger download
            const link = document.createElement('a')
            link.href = downloadResponse.download_url
            link.download = downloadResponse.file_info.filename
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Failed to download file:', error)
            alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setDownloadingFiles(prev => {
                const newSet = new Set(prev)
                newSet.delete(fileId)
                return newSet
            })
        }
    }

    if (files.length === 0) {
        return (
            <div className="w-full ">
                <h2 className={`text-lg font-medium ${currentTheme.text.primary} mb-6`}>Uploaded Files</h2>
                <div className={`text-center py-16 ${currentTheme.bg.card} rounded-xl ${currentTheme.border.primary} border shadow-sm`}>
                    <div className={`inline-flex p-4 ${currentTheme.accents.primary.light} rounded-full mb-4`}>
                        <svg
                            className={`h-12 w-12 ${currentTheme.text.muted}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <p className={`mt-4 text-sm ${currentTheme.text.secondary} font-medium`}>No files uploaded yet</p>
                    <p className={`text-xs ${currentTheme.text.muted} mt-2`}>Upload CSV files to see them here</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full ">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-medium ${currentTheme.text.primary}`}>
                    Uploaded Files ({files.length})
                </h2>
                <div className={`px-3 py-1 ${currentTheme.accents.primary.light} ${currentTheme.accents.primary.text} rounded-full text-sm font-medium`}>
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                </div>
            </div>
            <div className={`${currentTheme.bg.card} shadow-lg overflow-hidden ${currentTheme.border.primary} border rounded-xl backdrop-blur-sm`}>
                <table className={`min-w-full divide-y ${currentTheme.border.secondary}`}>
                    <thead className={`${currentTheme.bg.secondary}`}>
                        <tr>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                File Name
                            </th>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                Upload Time
                            </th>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                Status
                            </th>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                Rows
                            </th>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                Parquet Path
                            </th>
                            <th
                                scope="col"
                                className={`px-6 py-4 text-right text-xs font-semibold ${currentTheme.text.muted} uppercase tracking-wider`}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`${currentTheme.bg.card} divide-y ${currentTheme.border.secondary}`}>
                        {files.map((file, index) => (
                            <tr key={file.id} className={`${currentTheme.bg.hover} transition-all duration-200 hover:shadow-md group`} style={{ animationDelay: `${index * 50}ms` }}>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`p-2 ${currentTheme.accents.info.light} rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200`}>
                                            <svg
                                                className={`h-5 w-5 ${currentTheme.accents.info.text}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className={`text-sm font-medium ${currentTheme.text.primary} truncate max-w-xs`}>
                                            {file.filename}
                                        </span>
                                    </div>
                                </td>
                                <td className={`px-6 py-5 whitespace-nowrap text-sm ${currentTheme.text.secondary} font-medium`}>
                                    {format(new Date(file.upload_timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <StatusBadge status={file.status} theme={currentTheme} />
                                </td>
                                <td className={`px-6 py-5 whitespace-nowrap text-sm ${currentTheme.text.secondary}`}>
                                    {file.row_count !== undefined ? (
                                        <div className="flex items-center">
                                            <svg className={`w-4 h-4 mr-1 ${currentTheme.text.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <span className="font-bold">{file.row_count.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <span className={currentTheme.text.muted}>-</span>
                                    )}
                                </td>
                                <td className={`px-6 py-5 whitespace-nowrap text-sm ${currentTheme.text.secondary}`}>
                                    {file.parquet_path ? (
                                        <div className="flex items-center group">
                                            <div className={`p-1 ${currentTheme.accents.success.light} rounded mr-2 group-hover:scale-110 transition-transform duration-200`}>
                                                <svg className={`w-3 h-3 ${currentTheme.accents.success.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </div>
                                            <span className={`font-mono text-xs ${currentTheme.text.primary} truncate max-w-32`} title={file.parquet_path}>
                                                {file.parquet_path}
                                            </span>
                                        </div>
                                    ) : file.status === 'Processing' ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin w-3 h-3 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className={`text-xs ${currentTheme.text.muted} italic`}>Converting...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className={`w-3 h-3 mr-2 ${currentTheme.accents.danger.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className={`text-xs ${currentTheme.text.muted} italic`}>Not available</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => handleViewDetails(Number(file.id))}
                                            className={`p-2 ${currentTheme.accents.primary.light} ${currentTheme.accents.primary.text} rounded-lg hover:shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${currentTheme.accents.primary.border}`}
                                            title="View Details"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        {onFileSelect && (
                                            <button
                                                onClick={() => onFileSelect(file)}
                                                className={`p-2 ${currentTheme.accents.success.light} ${currentTheme.accents.success.text} rounded-lg hover:shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${currentTheme.accents.success.border}`}
                                                title="Analyze File"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </button>
                                        )}
                                        {file.status === 'Done' && file.parquet_path && (
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleDownloadFile(file.id, 'parquet')}
                                                    disabled={downloadingFiles.has(file.id)}
                                                    className={`p-2 ${currentTheme.accents.info.light} ${currentTheme.accents.info.text} rounded-lg hover:shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.accents.info.border}`}
                                                    title="Download Parquet"
                                                >
                                                    {downloadingFiles.has(file.id) ? (
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadFile(file.id, 'csv')}
                                                    disabled={downloadingFiles.has(file.id)}
                                                    className={`p-1.5 ${currentTheme.accents.purple.light} ${currentTheme.accents.purple.text} rounded-md hover:shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs`}
                                                    title="Download CSV"
                                                >
                                                    CSV
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            disabled={deletingFiles.has(file.id)}
                                            className={`p-2 ${currentTheme.accents.danger.light} ${currentTheme.accents.danger.text} rounded-lg hover:shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.accents.danger.border}`}
                                            title="Delete File"
                                        >
                                            {deletingFiles.has(file.id) ? (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* File Detail Modal */}
            {selectedFileId && (
                <FileDetailModal
                    fileId={selectedFileId}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
} 