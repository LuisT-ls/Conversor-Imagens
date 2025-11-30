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

// Initialize Bootstrap components like tooltips, popovers, tabs, etc.
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

  // Initialize tabs and handle tab switching
  initTabs()
}

// Initialize Bootstrap tabs
function initTabs() {
  // Get all tab links
  const tabLinks = document.querySelectorAll('a[data-bs-toggle="tab"]')
  
  console.log('Initializing tabs, found', tabLinks.length, 'tab links')
  
  if (tabLinks.length === 0) {
    console.warn('No tab links found!')
    return
  }
  
  // Function to switch tabs
  function switchTab(clickedLink) {
    const targetId = clickedLink.getAttribute('href')
    
    if (!targetId || !targetId.startsWith('#')) {
      return
    }
    
    const targetTab = document.querySelector(targetId)
    if (!targetTab) {
      console.error('Tab target not found:', targetId)
      return
    }
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link[data-bs-toggle="tab"]').forEach(link => {
      link.classList.remove('active')
    })
    
    // Remove active/show from all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('show', 'active')
    })
    
    // Add active class to clicked link
    clickedLink.classList.add('active')
    
    // Show target tab pane
    targetTab.classList.add('show', 'active')
    
    console.log('Tab switched to:', targetId)
  }
  
  tabLinks.forEach(function (tabLink) {
    // Add explicit click handler to ensure tabs work
    tabLink.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      
      switchTab(this)
      
      // Also trigger Bootstrap tab if available
      if (typeof bootstrap !== 'undefined' && bootstrap.Tab) {
        try {
          const tab = new bootstrap.Tab(this)
          tab.show()
        } catch (error) {
          // Bootstrap failed, but we already switched manually
          console.warn('Bootstrap Tab API failed, using manual toggle')
        }
      }
      
      return false
    })
    
    // Handle Bootstrap tab shown event to sync states (if Bootstrap is available)
    if (typeof bootstrap !== 'undefined') {
      tabLink.addEventListener('shown.bs.tab', function (e) {
        switchTab(this)
      })
    }
  })
  
  console.log('Tabs initialized successfully')
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
