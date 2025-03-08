// app.js - Main entry point for the application
import { initImageConverter } from './modules/imageConverter.js'
import { initImageEditor } from './modules/imageEditor.js'
import { initBatchConverter } from './modules/batchConverter.js'
import { initImageCompressor } from './modules/imageCompressor.js'
import { initHistoryManager } from './modules/historyManager.js'
import { initDarkMode } from './modules/darkMode.js'
import { initShareManager } from './modules/shareManager.js'

// Initialize all modules when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...')

  // Initialize all modules
  initDarkMode()
  initImageConverter()
  initImageEditor()
  initBatchConverter()
  initImageCompressor()
  initHistoryManager()
  initShareManager()

  // Initialize Bootstrap components
  initBootstrapComponents()

  console.log('Application initialized successfully!')
})

// Initialize Bootstrap components like tooltips, popovers, etc.
function initBootstrapComponents() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  )
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Initialize popovers
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  )
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  })
}

// Display a notification toast
export function showNotification(message, type = 'success', duration = 3000) {
  const bgColor =
    type === 'success'
      ? '#28a745'
      : type === 'error'
      ? '#dc3545'
      : type === 'warning'
      ? '#ffc107'
      : '#17a2b8'

  Toastify({
    text: message,
    duration: duration,
    close: true,
    gravity: 'top',
    position: 'right',
    style: {
      background: bgColor
    },
    stopOnFocus: true
  }).showToast()
}

// Helper to calculate file size in human-readable format
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file extension from filename
export function getFileExtension(filename) {
  return filename
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase()
}

// Get mime type based on format
export function getMimeType(format) {
  const mimeTypes = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon'
  }
  return mimeTypes[format.toLowerCase()] || 'image/jpeg'
}

// Create a Blob URL from binary data
export function createBlobUrl(data, type) {
  const blob = new Blob([data], { type })
  return URL.createObjectURL(blob)
}

// Create a download link for a file
export function createDownloadLink(data, filename, type) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  return { link, url }
}
