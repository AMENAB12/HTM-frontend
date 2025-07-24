'use client'

import { useState, useEffect } from 'react'
import { getFileById } from '@/lib/api'
import { useStore } from '@/store/useStore'
import { format } from 'date-fns'
import type { FileMetadata } from '@/lib/api'

interface FileDetailModalProps {
  fileId: number
  isOpen: boolean
  onClose: () => void
}

export default function FileDetailModal({ fileId, isOpen, onClose }: FileDetailModalProps) {
  const [file, setFile] = useState<FileMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useStore()

  useEffect(() => {
    if (isOpen && fileId && token) {
      loadFileDetails()
    }
  }, [isOpen, fileId, token])

  const loadFileDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const fileData = await getFileById(fileId, token!)
      setFile(fileData)
    } catch (err) {
      console.error('Failed to load file details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load file details')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">File Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm py-4">{error}</div>
          ) : file ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">File Name</label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {file.filename}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Time</label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {format(new Date(file.upload_timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    file.status === 'Done' 
                      ? 'bg-green-100 text-green-800'
                      : file.status === 'Error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Row Count</label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {file.row_count.toLocaleString()} rows
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parquet Path</label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono text-xs">
                  {file.parquet_path}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">File ID</label>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {file.id}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 