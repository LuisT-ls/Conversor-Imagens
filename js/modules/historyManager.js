import { showNotification, formatFileSize } from '../app.js'

// Maximum history entries to store
const MAX_HISTORY_ENTRIES = 100

// Armazenamento de histórico para uso global
let history = []

export function addToHistory(entry) {
  // Adicionar um ID único se não tiver
  if (!entry.id) {
    entry.id = Date.now().toString()
  }

  // Se não tiver data, adicionar a data atual
  if (!entry.date) {
    entry.date = new Date().toISOString()
  }

  // Add the entry to the beginning of the array
  history.unshift(entry)

  // Limit the number of entries
  if (history.length > MAX_HISTORY_ENTRIES) {
    history = history.slice(0, MAX_HISTORY_ENTRIES)
  }

  // Save to local storage
  saveHistory()

  // Disparar evento para notificar outros componentes
  document.dispatchEvent(new CustomEvent('conversion:added', { detail: entry }))
}

function saveHistory() {
  try {
    // Convert in-memory format to storage format
    const storageHistory = history.map(entry => {
      const { convertedBlob, ...rest } = entry
      return rest
    })

    localStorage.setItem('conversionHistory', JSON.stringify(storageHistory))
  } catch (error) {
    console.error('Error saving history:', error)
  }
}

// Load history from local storage
function loadHistory() {
  try {
    const storedHistory = localStorage.getItem('conversionHistory')

    if (!storedHistory) {
      return []
    }

    // Parse the history
    const parsedHistory = JSON.parse(storedHistory)

    // Convert stored history format to in-memory format
    // (Local storage can't store blobs, so we need to create dummy blobs)
    return parsedHistory.map(entry => ({
      ...entry,
      convertedBlob: new Blob([], { type: entry.convertedType })
    }))
  } catch (error) {
    console.error('Error loading history:', error)
    return []
  }
}

export function initHistoryManager() {
  console.log('Initializing history manager functionality...')

  // DOM elements
  const historyList = document.getElementById('historyList')
  const historyPlaceholder = document.getElementById('historyPlaceholder')
  const historyListContainer = document.querySelector('.history-list')
  const clearHistoryBtn = document.getElementById('clearHistoryBtn')
  const exportHistoryBtn = document.getElementById('exportHistoryBtn')

  // Load history from local storage
  history = loadHistory()

  // Initialize event listeners
  document.addEventListener('conversion:completed', handleConversionCompleted)
  document.addEventListener('conversion:added', function () {
    renderHistory() // Re-renderizar o histórico quando um novo item for adicionado
  })
  clearHistoryBtn.addEventListener('click', clearHistory)
  exportHistoryBtn.addEventListener('click', exportHistory)

  // Render the history
  renderHistory()

  // Handle conversion completed event
  function handleConversionCompleted(event) {
    const entry = event.detail
    addToHistory(entry)
  }

  // Render the history
  function renderHistory() {
    // Clear the list
    historyList.innerHTML = ''

    // Show placeholder if no entries
    if (history.length === 0) {
      historyPlaceholder.classList.remove('d-none')
      historyListContainer.classList.add('d-none')
      return
    }

    // Hide placeholder and show list
    historyPlaceholder.classList.add('d-none')
    historyListContainer.classList.remove('d-none')

    // Add each entry to the list
    history.forEach(entry => {
      const row = document.createElement('tr')

      // Convert ISO date to localized format
      const date = new Date(entry.date)
      const formattedDate = date.toLocaleString()

      row.innerHTML = `
                <td>${formattedDate}</td>
                <td>
                    <div class="fw-bold">${entry.originalName}</div>
                    <small class="text-muted">${formatFileSize(
                      entry.originalSize
                    )}</small>
                </td>
                <td>
                    <div class="fw-bold">${entry.convertedName}</div>
                    <small class="text-muted">${formatFileSize(
                      entry.convertedSize
                    )}</small>
                </td>
                <td>
                    <span class="badge bg-success">${calculateCompression(
                      entry.originalSize,
                      entry.convertedSize
                    )}</span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary download-history" data-id="${
                          entry.id
                        }">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-history" data-id="${
                          entry.id
                        }">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `

      // Add event listeners
      row
        .querySelector('.download-history')
        .addEventListener('click', function () {
          const id = this.dataset.id
          downloadHistoryEntry(id)
        })

      row
        .querySelector('.delete-history')
        .addEventListener('click', function () {
          const id = this.dataset.id
          deleteHistoryEntry(id)
        })

      historyList.appendChild(row)
    })
  }

  // Calculate compression percentage
  function calculateCompression(originalSize, convertedSize) {
    const percentage = ((1 - convertedSize / originalSize) * 100).toFixed(1)

    // Handle cases where conversion increased the size
    if (percentage < 0) {
      return `+${Math.abs(percentage)}%`
    }

    return `-${percentage}%`
  }

  // Download a history entry
  function downloadHistoryEntry(id) {
    const entry = history.find(entry => entry.id === id)

    if (!entry) {
      showNotification('Entrada não encontrada no histórico.', 'error')
      return
    }

    // Create a URL for the blob
    const blob = entry.convertedBlob
    const url = URL.createObjectURL(blob)

    // Create a download link
    const link = document.createElement('a')
    link.href = url
    link.download = entry.convertedName
    link.click()

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  // Delete a history entry
  function deleteHistoryEntry(id) {
    // Remove the entry
    history = history.filter(entry => entry.id !== id)

    // Save to local storage
    saveHistory()

    // Re-render the history
    renderHistory()

    showNotification('Entrada removida do histórico.', 'success')
  }

  // Clear all history
  function clearHistory() {
    // Confirm before clearing
    if (!confirm('Tem certeza que deseja limpar todo o histórico?')) {
      return
    }

    // Clear the array
    history = []

    // Save to local storage
    saveHistory()

    // Re-render the history
    renderHistory()

    showNotification('Histórico limpo com sucesso.', 'success')
  }

  // Export history as JSON
  function exportHistory() {
    // Create a simplified version of the history (without blobs)
    const exportData = history.map(entry => ({
      date: entry.date,
      originalName: entry.originalName,
      originalType: entry.originalType,
      originalSize: entry.originalSize,
      convertedName: entry.convertedName,
      convertedType: entry.convertedType,
      convertedSize: entry.convertedSize
    }))

    // Convert to JSON
    const json = JSON.stringify(exportData, null, 2)

    // Create a blob
    const blob = new Blob([json], { type: 'application/json' })

    // Create a URL for the blob
    const url = URL.createObjectURL(blob)

    // Create a download link
    const link = document.createElement('a')
    link.href = url
    link.download = 'historico_conversoes.json'
    link.click()

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)

    showNotification('Histórico exportado com sucesso.', 'success')
  }

  // Save history to local storage
  function saveHistory() {
    try {
      // Convert in-memory format to storage format
      const storageHistory = history.map(entry => {
        const { convertedBlob, ...rest } = entry
        return rest
      })

      localStorage.setItem('conversionHistory', JSON.stringify(storageHistory))
    } catch (error) {
      console.error('Error saving history:', error)
    }
  }
}
