'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useStore } from '@/store/useStore'
import { uploadFile } from '@/lib/api'

export default function FileUpload() {
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

            // Add file to state with processing status
            const fileId = addFile({
                fileName: file.name,
                uploadTimestamp: new Date().toISOString(),
                status: 'processing',
            })

            setUploading(prev => [...prev, fileId])

            try {
                // Upload file
                await uploadFile(file, token)

                // Simulate processing delay and check row count
                setTimeout(() => {
                    // Read file to check row count (basic client-side check)
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const text = e.target?.result as string
                        const lines = text.trim().split('\n')
                        const rowCount = lines.length - 1 // Subtract header row

                        if (rowCount === 0) {
                            updateFileStatus(fileId, 'error', 0)
                        } else {
                            updateFileStatus(fileId, 'done', rowCount)
                        }

                        setUploading(prev => prev.filter(id => id !== fileId))
                    }
                    reader.readAsText(file)
                }, 3000) // 3-second delay as per requirements

            } catch (error) {
                console.error('Upload failed:', error)
                updateFileStatus(fileId, 'error')
                setUploading(prev => prev.filter(id => id !== fileId))
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