'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileStatus, useStore } from '@/store/useStore'
import { uploadFile } from '@/lib/api'

interface FileUploadProps {
    onUploadSuccess?: () => void
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [uploading, setUploading] = useState<string[]>([])
    const { token, addFile, updateFileStatus } = useStore()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!token) return

        for (const file of acceptedFiles) {
            // Validate file type
            if (!file.name.toLowerCase().endsWith('.csv')) {
                alert(`${file.name} is not a CSV file`)
                continue
            }

            try {
                // Upload file to backend
                const backendFile = await uploadFile(file, token)

                // Add file to state with backend response
                const fileId = addFile({
                    filename: backendFile.filename,
                    upload_timestamp: backendFile.upload_timestamp,
                    status: backendFile.status as FileStatus,
                    row_count: backendFile.row_count,
                })

                setUploading(prev => [...prev, fileId])

                // Backend handles the 3-second processing delay
                // Poll for status updates every 2 seconds if status is "Processing"
                if (backendFile.status === 'Processing') {
                    const pollStatus = async () => {
                        try {
                            // For now, we'll simulate the backend behavior
                            // In a real implementation, you might poll /files/{id} endpoint
                            setTimeout(() => {
                                // Backend will update status after 3 seconds
                                // This is handled by the backend, so we just update locally for demo
                                updateFileStatus(fileId, backendFile.row_count > 0 ? 'Done' : 'Error', backendFile.row_count)
                                setUploading(prev => prev.filter(id => id !== fileId))
                            }, 3000)
                        } catch (error) {
                            console.error('Status polling failed:', error)
                            updateFileStatus(fileId, 'Error')
                            setUploading(prev => prev.filter(id => id !== fileId))
                        }
                    }
                    pollStatus()
                } else {
                    setUploading(prev => prev.filter(id => id !== fileId))
                }

                // Call success callback to refresh file list
                onUploadSuccess?.()

            } catch (error) {
                console.error('Upload failed:', error)
                alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }
    }, [token, addFile, updateFileStatus])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
        multiple: true,
    })

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                        {isDragActive ? (
                            <span>Drop CSV files here...</span>
                        ) : (
                            <span>
                                <strong>Click to upload</strong> or drag and drop CSV files
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                </div>
            </div>

            {uploading.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Uploading {uploading.length} file(s)...
                </div>
            )}
        </div>
    )
} 