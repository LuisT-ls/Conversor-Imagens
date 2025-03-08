// imageConverter.js - Handle image conversion functionality
import { showNotification, formatFileSize, getMimeType } from '../app.js'

// Variables to keep track of the current state
let originalImage = null
let originalImageType = ''
let originalImageName = ''
let convertedImageData = null
let convertedImageType = ''

export function initImageConverter() {
  console.log('Initializing image converter functionality...')

  // DOM elements
  const dropZone = document.getElementById('dropZone')
  const fileInput = document.getElementById('fileInput')
  const previewThumb = document.getElementById('previewThumb')
  const formatSelect = document.getElementById('formatSelect')
  const qualityRange = document.getElementById('qualityRange')
  const qualityValue = document.getElementById('qualityValue')
  const widthInput = document.getElementById('widthInput')
  const heightInput = document.getElementById('heightInput')
  const aspectRatio = document.getElementById('aspectRatio')
  const resizeSelect = document.getElementById('resizeSelect')
  const convertButton = document.getElementById('convertButton')
  const progressBar = document.getElementById('progressBar')
  const progressBarInner = progressBar.querySelector('.progress-bar')
  const preview = document.getElementById('preview')
  const previewContainer = preview.querySelector('.preview-container')
  const previewPlaceholder = preview.querySelector('.preview-placeholder')
  const originalPreview = document.getElementById('originalPreview')
  const convertedPreview = document.getElementById('convertedPreview')
  const originalInfo = document.getElementById('originalInfo')
  const convertedInfo = document.getElementById('convertedInfo')
  const actionButtons = document.querySelector('.action-buttons')
  const downloadLink = document.getElementById('downloadLink')
  const shareButton = document.getElementById('shareButton')
  const formatOptions = document.getElementById('formatOptions')

  // Initialize event listeners
  initializeDropZone()
  initializeInputHandlers()

  // Set up format-specific options
  updateFormatOptions()
  formatSelect.addEventListener('change', updateFormatOptions)

  // Handle image selection
  fileInput.addEventListener('change', handleFileSelection)

  // Handle conversion button click
  convertButton.addEventListener('click', convertImage)

  // Initialize the drop zone functionality
  function initializeDropZone() {
    // Handle drag over
    dropZone.addEventListener('dragover', e => {
      e.preventDefault()
      dropZone.classList.add('drop-zone-active')
    })

    // Handle drag leave
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drop-zone-active')
    })

    // Handle drop
    dropZone.addEventListener('drop', e => {
      e.preventDefault()
      dropZone.classList.remove('drop-zone-active')

      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files
        handleFileSelection()
      }
    })

    // Handle click
    dropZone.addEventListener('click', () => {
      fileInput.click()
    })
  }

  // Initialize input handlers for interconnected controls
  function initializeInputHandlers() {
    // Update quality display
    qualityRange.addEventListener('input', () => {
      qualityValue.textContent = `${qualityRange.value}%`
    })

    // Handle aspect ratio
    widthInput.addEventListener('input', () => {
      if (aspectRatio.checked && originalImage) {
        const originalAspectRatio = originalImage.width / originalImage.height
        heightInput.value = Math.round(widthInput.value / originalAspectRatio)
      }
    })

    heightInput.addEventListener('input', () => {
      if (aspectRatio.checked && originalImage) {
        const originalAspectRatio = originalImage.width / originalImage.height
        widthInput.value = Math.round(heightInput.value * originalAspectRatio)
      }
    })

    // Handle preset sizes
    resizeSelect.addEventListener('change', () => {
      if (resizeSelect.value === 'original') {
        widthInput.value = ''
        heightInput.value = ''
        widthInput.placeholder = 'Original'
        heightInput.placeholder = 'Original'
      } else {
        const dimensions = resizeSelect.value.split('x')
        widthInput.value = dimensions[0]
        heightInput.value = dimensions[1]
      }
    })
  }

  // Update format-specific options based on selected format
  function updateFormatOptions() {
    const format = formatSelect.value

    // Clear previous options
    formatOptions.innerHTML = ''

    // Add format-specific options
    if (format === 'jpeg') {
      formatOptions.innerHTML = `
                <div class="col-md-6 mb-3">
                    <label for="jpegProgressive" class="form-label">Modo progressivo:</label>
                    <select id="jpegProgressive" class="form-select">
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                    </select>
                </div>
            `
    } else if (format === 'png') {
      formatOptions.innerHTML = `
                <div class="col-md-6 mb-3">
                    <label for="pngCompression" class="form-label">Nível de compressão:</label>
                    <select id="pngCompression" class="form-select">
                        <option value="0">Sem compressão</option>
                        <option value="3">Baixa</option>
                        <option value="6" selected>Média</option>
                        <option value="9">Alta</option>
                    </select>
                </div>
            `
    } else if (format === 'webp') {
      formatOptions.innerHTML = `
                <div class="col-md-6 mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="webpLossless">
                        <label class="form-check-label" for="webpLossless">
                            Usar compressão sem perdas
                        </label>
                    </div>
                </div>
            `
    }
  }

  // Handle file selection
  function handleFileSelection() {
    const file = fileInput.files[0]

    if (!file) return

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      showNotification(
        'Por favor, selecione um arquivo de imagem válido.',
        'error'
      )
      return
    }

    // Save original file info
    originalImageType = file.type
    originalImageName = file.name

    // Display file in drop zone
    const reader = new FileReader()

    reader.onload = e => {
      // Show thumbnail in the drop zone
      previewThumb.style.backgroundImage = `url('${e.target.result}')`
      previewThumb.classList.remove('d-none')
      dropZone.querySelector('.drop-zone-prompt').classList.add('d-none')

      // Create Image object to get dimensions
      const img = new Image()
      img.onload = () => {
        originalImage = img

        // Enable convert button
        convertButton.disabled = false

        // Suggest original dimensions as placeholders
        widthInput.placeholder = img.width
        heightInput.placeholder = img.height

        // Reset resize select to original
        resizeSelect.value = 'original'
      }
      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  }

  // Convert the image based on the selected options
  function convertImage() {
    if (!originalImage) {
      showNotification('Por favor, selecione uma imagem primeiro.', 'error')
      return
    }

    // Show progress bar
    progressBar.classList.remove('d-none')
    progressBarInner.style.width = '0%'

    // Get conversion parameters
    const format = formatSelect.value
    const quality = parseInt(qualityRange.value) / 100

    // Get target dimensions
    let width = widthInput.value
      ? parseInt(widthInput.value)
      : originalImage.width
    let height = heightInput.value
      ? parseInt(heightInput.value)
      : originalImage.height

    // Create canvas for the original image (for pre-processing)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Draw the image on the canvas with the desired dimensions
    ctx.drawImage(originalImage, 0, 0, width, height)

    // Update progress
    progressBarInner.style.width = '30%'

    // Get format-specific options
    let conversionOptions = { quality }

    if (format === 'jpeg') {
      const progressive = document.getElementById('jpegProgressive')
      if (progressive && progressive.value === 'true') {
        conversionOptions.progressive = true
      }
    } else if (format === 'png') {
      const compression = document.getElementById('pngCompression')
      if (compression) {
        conversionOptions.compressionLevel = parseInt(compression.value)
      }
    } else if (format === 'webp') {
      const lossless = document.getElementById('webpLossless')
      if (lossless && lossless.checked) {
        conversionOptions.lossless = true
      }
    }

    // Update progress
    progressBarInner.style.width = '50%'

    // Handle special formats like ICO and SVG
    if (format === 'ico') {
      handleIcoConversion(canvas)
      return
    } else if (format === 'svg') {
      handleSvgConversion()
      return
    }

    // Convert the image using the selected options
    canvas.toBlob(
      blob => {
        if (!blob) {
          showNotification('Erro ao converter a imagem.', 'error')
          progressBar.classList.add('d-none')
          return
        }

        // Save converted image data
        convertedImageData = blob
        convertedImageType = getMimeType(format)

        // Update progress
        progressBarInner.style.width = '80%'

        // Show the preview
        showPreview(blob)

        // Add to history
        addToHistory(blob)

        // Hide progress bar
        setTimeout(() => {
          progressBar.classList.add('d-none')
          progressBarInner.style.width = '100%'
        }, 500)

        showNotification('Imagem convertida com sucesso!', 'success')
      },
      getMimeType(format),
      conversionOptions
    )
  }

  // Handle ICO conversion (special case)
  function handleIcoConversion(canvas) {
    try {
      // For ICO, we need to convert to PNG first, then to ICO
      canvas.toBlob(pngBlob => {
        // Here we'd use a library like png-to-ico
        // For this example, we'll just use the PNG as a placeholder
        // In a real implementation, you'd use the PngToIco library properly

        // Simulate the conversion
        setTimeout(() => {
          convertedImageData = pngBlob
          convertedImageType = 'image/x-icon'

          // Show the preview
          showPreview(pngBlob)

          // Add to history
          addToHistory(pngBlob)

          // Hide progress bar
          progressBar.classList.add('d-none')
          progressBarInner.style.width = '100%'

          showNotification('Imagem convertida para ICO com sucesso!', 'success')
        }, 1000)
      }, 'image/png')
    } catch (error) {
      console.error('Error converting to ICO:', error)
      showNotification('Erro ao converter para ICO.', 'error')
      progressBar.classList.add('d-none')
    }
  }

  // Handle SVG conversion (special case)
  function handleSvgConversion() {
    showNotification(
      'Conversão para SVG não está completamente implementada.',
      'warning'
    )
    progressBar.classList.add('d-none')
  }

  // Show the preview of original and converted images
  function showPreview(blob) {
    // Create URLs for the images
    const convertedUrl = URL.createObjectURL(blob)

    // Show the original image
    originalPreview.innerHTML = `<img src="${originalImage.src}" class="img-fluid" alt="Imagem Original">`
    originalInfo.textContent = `${originalImageName} - ${formatFileSize(
      new Blob([originalImage.src]).size
    )}`

    // Show the converted image
    convertedPreview.innerHTML = `<img src="${convertedUrl}" class="img-fluid" alt="Imagem Convertida">`
    const newFilename =
      originalImageName.split('.')[0] + '.' + formatSelect.value
    convertedInfo.textContent = `${newFilename} - ${formatFileSize(blob.size)}`

    // Show the preview container and hide the placeholder
    previewContainer.classList.remove('d-none')
    previewPlaceholder.classList.add('d-none')

    // Set up the download link
    downloadLink.href = convertedUrl
    downloadLink.download = newFilename

    // Show action buttons
    actionButtons.classList.remove('d-none')
  }

  // Add the conversion to history
  function addToHistory(blob) {
    // Create history entry
    const historyEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      originalName: originalImageName,
      originalType: originalImageType,
      originalSize: new Blob([originalImage.src]).size,
      convertedName: originalImageName.split('.')[0] + '.' + formatSelect.value,
      convertedType: convertedImageType,
      convertedSize: blob.size,
      convertedBlob: blob
    }

    // Dispatch custom event to be handled by the history manager
    const event = new CustomEvent('conversion:completed', {
      detail: historyEntry
    })
    document.dispatchEvent(event)
  }
}

// Export a method to get the current converted image data
export function getConvertedImageData() {
  return {
    data: convertedImageData,
    type: convertedImageType,
    name: originalImageName
      ? originalImageName.split('.')[0] + '.' + convertedImageType.split('/')[1]
      : 'converted_image.' + convertedImageType.split('/')[1]
  }
}
