// batchConverter.js - Handle batch image conversion functionality
import { showNotification, formatFileSize, getMimeType } from '../app.js'

// Array to store batch conversion files
let batchFiles = []

export function initBatchConverter() {
  console.log('Initializing batch conversion functionality...')

  // DOM elements
  const batchFileInput = document.getElementById('batchFileInput')
  const batchFormatSelect = document.getElementById('batchFormatSelect')
  const batchQualityRange = document.getElementById('batchQualityRange')
  const batchQualityValue = document.getElementById('batchQualityValue')
  const batchResizeSelect = document.getElementById('batchResizeSelect')
  const batchFileList = document.getElementById('batchFileList')
  const batchPlaceholder = document.getElementById('batchPlaceholder')
  const batchFileListContainer = document.querySelector('.batch-file-list')
  const convertBatchButton = document.getElementById('convertBatchButton')
  const batchDownload = document.getElementById('batchDownload')
  const downloadAllButton = document.getElementById('downloadAllButton')

  // Initialize event listeners
  batchFileInput.addEventListener('change', handleBatchFiles)
  batchQualityRange.addEventListener('input', updateQualityDisplay)
  convertBatchButton.addEventListener('click', convertAllFiles)
  downloadAllButton.addEventListener('click', downloadAllFiles)

  // Update quality display
  function updateQualityDisplay() {
    batchQualityValue.textContent = `${batchQualityRange.value}%`
  }

  // Handle batch file selection
  function handleBatchFiles(event) {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    // Reset batch files
    batchFiles = []
    batchFileList.innerHTML = ''

    // Process each file
    Array.from(files).forEach((file, index) => {
      // Skip non-image files
      if (!file.type.startsWith('image/')) {
        showNotification(
          `"${file.name}" não é uma imagem válida e será ignorada.`,
          'warning'
        )
        return
      }

      // Create a file reader to get image dimensions
      const reader = new FileReader()

      reader.onload = function (e) {
        const img = new Image()

        img.onload = function () {
          // Add file to batch files array
          batchFiles.push({
            id: index,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            src: e.target.result,
            status: 'pending',
            converted: null
          })

          // Add file to the list
          addFileToList(batchFiles[batchFiles.length - 1])

          // Enable convert button if there are files
          if (batchFiles.length > 0) {
            convertBatchButton.disabled = false

            // Show the file list and hide the placeholder
            batchFileListContainer.classList.remove('d-none')
            batchPlaceholder.classList.add('d-none')
          }
        }

        img.src = e.target.result
      }

      reader.readAsDataURL(file)
    })
  }

  // Add a file to the list
  function addFileToList(fileObj) {
    const row = document.createElement('tr')
    row.id = `batch-file-${fileObj.id}`

    row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="batch-file-thumb me-2" style="background-image: url('${
                      fileObj.src
                    }')"></div>
                    <div>
                        <div class="fw-bold">${fileObj.name}</div>
                        <small class="text-muted">${fileObj.width} × ${
      fileObj.height
    }</small>
                    </div>
                </div>
            </td>
            <td>${formatFileSize(fileObj.size)}</td>
            <td>
                <span class="badge bg-secondary">Pendente</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger remove-file" data-id="${
                  fileObj.id
                }">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `

    // Add event listener to remove button
    row.querySelector('.remove-file').addEventListener('click', function () {
      const id = parseInt(this.dataset.id)
      removeFile(id)
    })

    batchFileList.appendChild(row)
  }

  // Remove a file from the list
  function removeFile(id) {
    // Remove from the array
    batchFiles = batchFiles.filter(file => file.id !== id)

    // Remove from the DOM
    const row = document.getElementById(`batch-file-${id}`)
    if (row) {
      row.remove()
    }

    // Disable convert button if there are no files
    if (batchFiles.length === 0) {
      convertBatchButton.disabled = true

      // Show the placeholder and hide the file list
      batchFileListContainer.classList.add('d-none')
      batchPlaceholder.classList.remove('d-none')
    }
  }

  // Convert all files
  async function convertAllFiles() {
    if (batchFiles.length === 0) {
      showNotification('Não há arquivos para converter.', 'warning')
      return
    }

    // Disable convert button during conversion
    convertBatchButton.disabled = true

    // Get conversion settings
    const format = batchFormatSelect.value
    const quality = parseInt(batchQualityRange.value) / 100
    const resizeOption = batchResizeSelect.value

    // Convert each file
    for (const fileObj of batchFiles) {
      // Update status to processing
      updateFileStatus(fileObj.id, 'processing')

      try {
        // Convert the file
        const convertedBlob = await convertFile(
          fileObj,
          format,
          quality,
          resizeOption
        )

        // Update file object with converted data
        fileObj.converted = {
          blob: convertedBlob,
          size: convertedBlob.size,
          type: convertedBlob.type,
          name: fileObj.name.split('.')[0] + '.' + format
        }

        // Update status to completed
        updateFileStatus(fileObj.id, 'completed', fileObj.converted)

        // Add to history
        addToHistory(fileObj)
      } catch (error) {
        console.error('Error converting file:', error)
        updateFileStatus(fileObj.id, 'error')
      }
    }

    // Re-enable convert button
    convertBatchButton.disabled = false

    // Show download all button
    batchDownload.classList.remove('d-none')

    showNotification('Conversão em lote concluída!', 'success')
  }

  // Convert a single file
  function convertFile(fileObj, format, quality, resizeOption) {
    return new Promise((resolve, reject) => {
      // Create an image element
      const img = new Image()

      img.onload = function () {
        // Calculate dimensions based on resize option
        let width = img.width
        let height = img.height

        if (resizeOption !== 'original') {
          const dimensions = resizeOption.split('x')
          width = parseInt(dimensions[0])
          height = parseInt(dimensions[1])
        }

        // Create a canvas to draw the image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to the target format
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to convert image'))
              return
            }

            resolve(blob)
          },
          getMimeType(format),
          { quality }
        )
      }

      img.onerror = function () {
        reject(new Error('Failed to load image'))
      }

      img.src = fileObj.src
    })
  }

  // Update file status in the list
  function updateFileStatus(id, status, convertedData = null) {
    const row = document.getElementById(`batch-file-${id}`)

    if (!row) {
      return
    }

    const statusCell = row.querySelector('td:nth-child(3)')
    const actionsCell = row.querySelector('td:nth-child(4)')

    // Update status badge
    let badgeClass = 'bg-secondary'
    let statusText = 'Pendente'

    if (status === 'processing') {
      badgeClass = 'bg-primary'
      statusText = 'Processando...'
    } else if (status === 'completed') {
      badgeClass = 'bg-success'
      statusText = 'Concluído'
    } else if (status === 'error') {
      badgeClass = 'bg-danger'
      statusText = 'Erro'
    }

    statusCell.innerHTML = `<span class="badge ${badgeClass}">${statusText}</span>`

    // If completed, add download button and show converted size
    if (status === 'completed' && convertedData) {
      statusCell.innerHTML += `<br><small class="text-muted">${formatFileSize(
        convertedData.size
      )}</small>`

      actionsCell.innerHTML = `
                <button class="btn btn-sm btn-outline-danger remove-file me-1" data-id="${id}">
                    <i class="fas fa-times"></i>
                </button>
                <button class="btn btn-sm btn-outline-success download-file" data-id="${id}">
                    <i class="fas fa-download"></i>
                </button>
            `

      // Add event listeners
      actionsCell
        .querySelector('.remove-file')
        .addEventListener('click', function () {
          removeFile(parseInt(this.dataset.id))
        })

      actionsCell
        .querySelector('.download-file')
        .addEventListener('click', function () {
          const fileId = parseInt(this.dataset.id)
          downloadFile(fileId)
        })
    }
  }

  // Download a single converted file
  function downloadFile(id) {
    const fileObj = batchFiles.find(file => file.id === id)

    if (!fileObj || !fileObj.converted) {
      showNotification('Arquivo não encontrado ou não convertido.', 'error')
      return
    }

    // Create a URL for the blob
    const url = URL.createObjectURL(fileObj.converted.blob)

    // Create a download link
    const link = document.createElement('a')
    link.href = url
    link.download = fileObj.converted.name
    link.click()

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  // Download all converted files as a zip
  function downloadAllFiles() {
    // Check if there are any converted files
    const convertedFiles = batchFiles.filter(file => file.converted)

    if (convertedFiles.length === 0) {
      showNotification('Não há arquivos convertidos para baixar.', 'warning')
      return
    }

    // Create a new JSZip instance
    const zip = new JSZip()

    // Add each converted file to the zip
    convertedFiles.forEach(file => {
      zip.file(file.converted.name, file.converted.blob)
    })

    // Generate the zip file
    zip
      .generateAsync({ type: 'blob' })
      .then(function (content) {
        // Create a URL for the blob
        const url = URL.createObjectURL(content)

        // Create a download link
        const link = document.createElement('a')
        link.href = url
        link.download = 'imagens_convertidas.zip'
        link.click()

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)

        showNotification('Download iniciado!', 'success')
      })
      .catch(function (error) {
        console.error('Error creating zip file:', error)
        showNotification('Erro ao criar arquivo ZIP.', 'error')
      })
  }

  // Add the conversion to history
  function addToHistory(fileObj) {
    // Create history entry
    const historyEntry = {
      id: Date.now().toString() + '-' + fileObj.id,
      date: new Date().toISOString(),
      originalName: fileObj.name,
      originalType: fileObj.type,
      originalSize: fileObj.size,
      convertedName: fileObj.converted.name,
      convertedType: fileObj.converted.blob.type,
      convertedSize: fileObj.converted.size,
      convertedBlob: fileObj.converted.blob
    }

    // Dispatch custom event to be handled by the history manager
    const event = new CustomEvent('conversion:completed', {
      detail: historyEntry
    })
    document.dispatchEvent(event)
  }
}
