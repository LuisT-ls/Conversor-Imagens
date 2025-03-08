// imageCompressor.js - Handle image compression functionality
import { showNotification, formatFileSize, getMimeType } from '../app.js'

// Global variables
let originalImage = null
let originalImageType = ''
let originalImageName = ''
let compressedImageData = null

export function initImageCompressor() {
  console.log('Initializing image compressor functionality...')

  // DOM elements
  const compressorFileInput = document.getElementById('compressorFileInput')
  const compressionSettings = document.querySelector('.compression-settings')
  const compressionLevel = document.getElementById('compressionLevel')
  const compressionValue = document.getElementById('compressionValue')
  const targetSizeInput = document.getElementById('targetSizeInput')
  const keepFormat = document.getElementById('keepFormat')
  const compressionFormatOptions = document.getElementById(
    'compressionFormatOptions'
  )
  const compressionFormat = document.getElementById('compressionFormat')
  const compressButton = document.getElementById('compressButton')
  const compressionResults = document.getElementById('compressionResults')
  const originalCompressImage = document.getElementById('originalCompressImage')
  const originalCompressInfo = document.getElementById('originalCompressInfo')
  const compressedImage = document.getElementById('compressedImage')
  const compressedInfo = document.getElementById('compressedInfo')
  const downloadCompressedLink = document.getElementById(
    'downloadCompressedLink'
  )

  // Initialize event listeners
  compressorFileInput.addEventListener('change', handleFileSelection)
  compressionLevel.addEventListener('input', updateCompressionValue)
  keepFormat.addEventListener('change', toggleFormatOptions)
  compressButton.addEventListener('click', compressImage)

  // Update compression value display
  function updateCompressionValue() {
    compressionValue.textContent = `${compressionLevel.value}%`
  }

  // Toggle format options based on keep format checkbox
  function toggleFormatOptions() {
    if (keepFormat.checked) {
      compressionFormatOptions.classList.add('d-none')
    } else {
      compressionFormatOptions.classList.remove('d-none')
    }
  }

  // Handle file selection
  function handleFileSelection(event) {
    const file = event.target.files[0]

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

    // Read the file
    const reader = new FileReader()

    reader.onload = function (e) {
      // Create an image element to get dimensions
      const img = new Image()

      img.onload = function () {
        // Save the original image
        originalImage = {
          file: file,
          src: e.target.result,
          width: img.width,
          height: img.height,
          size: file.size
        }

        // Show compression settings
        compressionSettings.classList.remove('d-none')

        // Enable compress button
        compressButton.disabled = false

        // Hide results if previously shown
        compressionResults.classList.add('d-none')
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  }

  // Compress the image
  function compressImage() {
    if (!originalImage) {
      showNotification('Por favor, selecione uma imagem primeiro.', 'error')
      return
    }

    // Get compression settings
    const compressionQuality = parseInt(compressionLevel.value) / 100
    const targetSize = targetSizeInput.value
      ? parseInt(targetSizeInput.value) * 1024
      : null // Convert KB to bytes
    const useOriginalFormat = keepFormat.checked
    const format = useOriginalFormat
      ? originalImageType.split('/')[1]
      : compressionFormat.value

    // Create an image element
    const img = new Image()

    img.onload = function () {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image on the canvas
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // If target size is specified, use binary search to find the best quality
      if (targetSize) {
        compressToTargetSize(canvas, format, targetSize)
          .then(showResults)
          .catch(error => {
            console.error('Error compressing to target size:', error)
            showNotification('Erro ao comprimir para o tamanho alvo.', 'error')
          })
      } else {
        // Otherwise, use the specified quality
        canvas.toBlob(
          blob => {
            if (!blob) {
              showNotification('Erro ao comprimir a imagem.', 'error')
              return
            }

            compressedImageData = blob
            showResults(blob)
          },
          getMimeType(format),
          compressionQuality
        )
      }
    }

    img.src = originalImage.src
  }

  // Compress to target size using binary search
  function compressToTargetSize(canvas, format, targetSize) {
    return new Promise((resolve, reject) => {
      let min = 0.01 // Minimum quality
      let max = 1.0 // Maximum quality
      let current = 0.7 // Start with 0.7 quality
      let bestBlob = null
      let bestQuality = 0
      let iterations = 0
      const maxIterations = 10 // Limit iterations to prevent infinite loop

      // Binary search for the best quality that fits the target size
      function tryCompress() {
        iterations++

        // Convert using current quality
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Check if the blob is smaller than the target size
            if (blob.size <= targetSize) {
              // This quality works, save it and try higher
              bestBlob = blob
              bestQuality = current
              min = current
              current = (min + max) / 2
            } else {
              // Too big, try lower quality
              max = current
              current = (min + max) / 2
            }

            // Check if we're done
            if (iterations >= maxIterations || max - min < 0.01) {
              // Use the best blob we found, or the current one if none
              resolve(bestBlob || blob)
            } else {
              // Try again with new quality
              tryCompress()
            }
          },
          getMimeType(format),
          current
        )
      }

      // Start the binary search
      tryCompress()
    })
  }

  // Show compression results
  function showResults(blob) {
    // Save compressed image data
    compressedImageData = blob

    // Get the format extension
    const formatExt = blob.type.split('/')[1]

    // Create URLs for the images
    const originalUrl = originalImage.src
    const compressedUrl = URL.createObjectURL(blob)

    // Calculate compression ratio and percentage saved
    const compressionRatio = (originalImage.size / blob.size).toFixed(2)
    const percentageSaved = (
      (1 - blob.size / originalImage.size) *
      100
    ).toFixed(2)

    // Display the original image
    originalCompressImage.innerHTML = `<img src="${originalUrl}" class="img-fluid" alt="Imagem Original">`
    originalCompressInfo.innerHTML = `
            <div>Formato: ${originalImageType.split('/')[1].toUpperCase()}</div>
            <div>Tamanho: ${formatFileSize(originalImage.size)}</div>
            <div>Dimensões: ${originalImage.width} × ${
      originalImage.height
    }</div>
        `

    // Display the compressed image
    compressedImage.innerHTML = `<img src="${compressedUrl}" class="img-fluid" alt="Imagem Comprimida">`
    compressedInfo.innerHTML = `
            <div>Formato: ${formatExt.toUpperCase()}</div>
            <div>Tamanho: ${formatFileSize(blob.size)}</div>
            <div>Economia: ${percentageSaved}% (${formatFileSize(
      originalImage.size - blob.size
    )})</div>
            <div>Taxa de compressão: ${compressionRatio}:1</div>
        `

    // Set up download link
    const newFilename =
      originalImageName.split('.')[0] + '_comprimido.' + formatExt
    downloadCompressedLink.href = compressedUrl
    downloadCompressedLink.download = newFilename

    // Show results
    compressionResults.classList.remove('d-none')

    // Add to history
    addToHistory(blob, newFilename)

    showNotification('Imagem comprimida com sucesso!', 'success')
  }

  // Add the compression to history
  function addToHistory(blob, filename) {
    // Create history entry
    const historyEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      originalName: originalImageName,
      originalType: originalImageType,
      originalSize: originalImage.size,
      convertedName: filename,
      convertedType: blob.type,
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

// Get the compressed image data
export function getCompressedImageData() {
  if (!compressedImageData) return null

  return {
    data: compressedImageData,
    type: compressedImageData.type,
    name: originalImageName
      ? originalImageName.split('.')[0] +
        '_comprimido.' +
        compressedImageData.type.split('/')[1]
      : 'compressed_image.' + compressedImageData.type.split('/')[1]
  }
}
