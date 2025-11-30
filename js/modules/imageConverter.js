// imageConverter.js - Handle image conversion functionality
import {
  showNotification,
  formatFileSize,
  getMimeType,
  createBlobUrl,
  createDownloadLink
} from '../app.js'
// Importamos o módulo inteiro e usaremos historyManager.addToHistory()
import * as historyManager from './historyManager.js'

// Global variables to store image data
let originalImage = null
let convertedImage = null
let originalFileInfo = null

export function initImageConverter() {
  console.log('Initializing image converter functionality...')

  // DOM elements
  const dropZone = document.getElementById('dropZone')
  const fileInput = document.getElementById('fileInput')
  const formatSelect = document.getElementById('formatSelect')
  const qualityRange = document.getElementById('qualityRange')
  const qualityValue = document.getElementById('qualityValue')
  const widthInput = document.getElementById('widthInput')
  const heightInput = document.getElementById('heightInput')
  const aspectRatio = document.getElementById('aspectRatio')
  const resizeSelect = document.getElementById('resizeSelect')
  const convertButton = document.getElementById('convertButton')
  const progressBar = document.getElementById('progressBar')
  const originalPreview = document.getElementById('originalPreview')
  const convertedPreview = document.getElementById('convertedPreview')
  const originalInfo = document.getElementById('originalInfo')
  const convertedInfo = document.getElementById('convertedInfo')
  const preview = document.getElementById('preview')
  const actionButtons = document.querySelector('.action-buttons')
  const downloadLink = document.getElementById('downloadLink')
  const formatOptions = document.getElementById('formatOptions')
  const previewContainer = document.querySelector('.preview-container')
  const previewPlaceholder = document.querySelector('.preview-placeholder')

  // Initialize event listeners
  dropZone.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', handleFileSelect)
  formatSelect.addEventListener('change', updateFormatOptions)
  qualityRange.addEventListener('input', updateQualityValue)
  convertButton.addEventListener('click', convertImage)
  resizeSelect.addEventListener('change', handleResizeSelect)
  widthInput.addEventListener('input', handleWidthInput)
  heightInput.addEventListener('input', handleHeightInput)

  // Initialize drag and drop functionality
  initDragAndDrop()

  // Initialize default values
  updateQualityValue()
  updateFormatOptions()

  // Function to handle file selection
  function handleFileSelect(event) {
    const file = event.target.files[0]
    if (file && file.type.match('image.*')) {
      processSelectedFile(file)
    } else {
      showNotification(
        'Por favor, selecione um arquivo de imagem válido.',
        'error'
      )
    }
  }

  // Process the selected file
  function processSelectedFile(file) {
    // Store original file info
    originalFileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    }

    // Create a file reader to read the file
    const reader = new FileReader()

    // Show loading indicator
    const dropZonePrompt = dropZone.querySelector('.drop-zone-prompt')
    const dropZoneThumb = dropZone.querySelector('.drop-zone-thumb')

    dropZonePrompt.classList.add('d-none')
    dropZoneThumb.classList.remove('d-none')
    dropZoneThumb.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>'

    // When the file is loaded
    reader.onload = function (e) {
      // Store the original image
      originalImage = e.target.result

      // Create an image element to get dimensions
      const img = new Image()
      img.onload = function () {
        // Set original dimensions
        originalFileInfo.width = img.width
        originalFileInfo.height = img.height

        // Update the drop zone with a thumbnail
        dropZoneThumb.innerHTML = ''
        dropZoneThumb.style.backgroundImage = `url(${originalImage})`

        // Enable the convert button
        convertButton.disabled = false

        // Reset the input fields
        widthInput.value = ''
        heightInput.value = ''
        widthInput.placeholder = img.width
        heightInput.placeholder = img.height
        resizeSelect.value = 'original'

        // Show notification
        showNotification('Imagem carregada com sucesso!', 'success')
      }

      img.src = originalImage
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  }

  // Initialize drag and drop functionality
  function initDragAndDrop() {
    // Prevent default drag behaviors function
    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Prevent default drag behaviors only on the drop zone
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false)
      // Only prevent on body for drop events to allow file drops, but not on navigation
      if (eventName === 'drop') {
        document.body.addEventListener(eventName, function(e) {
          // Don't prevent if clicking on navigation links
          if (!e.target.closest('nav') && !e.target.closest('a[data-bs-toggle="tab"]')) {
            preventDefaults(e)
          }
        }, false)
      }
    })

    // Highlight drop zone when a file is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false)
    })

    // Remove highlight when a file is dragged away
    ;['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false)
    })

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false)

    function highlight() {
      dropZone.classList.add('drop-zone-active')
    }

    function unhighlight() {
      dropZone.classList.remove('drop-zone-active')
    }

    function handleDrop(e) {
      const dt = e.dataTransfer
      const file = dt.files[0]

      if (file && file.type.match('image.*')) {
        processSelectedFile(file)
      } else {
        showNotification('Por favor, solte apenas arquivos de imagem.', 'error')
      }
    }
  }

  // Update quality value display
  function updateQualityValue() {
    qualityValue.textContent = `${qualityRange.value}%`
  }

  // Update format-specific options
  function updateFormatOptions() {
    const format = formatSelect.value

    // Clear previous options
    formatOptions.innerHTML = ''

    // Add format-specific options
    let optionsHTML = ''

    switch (format) {
      case 'webp':
        optionsHTML = `
          <div class="col-md-6 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="webpLossless">
              <label class="form-check-label" for="webpLossless">Usar compressão sem perdas</label>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="webpAlpha" checked>
              <label class="form-check-label" for="webpAlpha">Preservar transparência</label>
            </div>
          </div>
        `
        break

      case 'jpeg':
        optionsHTML = `
          <div class="col-md-6 mb-3">
            <label for="jpegProgressive" class="form-label">Modo:</label>
            <select id="jpegProgressive" class="form-select">
              <option value="false">Baseline (Padrão)</option>
              <option value="true">Progressivo</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="jpegSubsampling" class="form-label">Subamostragem de crominância:</label>
            <select id="jpegSubsampling" class="form-select">
              <option value="4:2:0">4:2:0 (Boa compressão)</option>
              <option value="4:2:2">4:2:2 (Equilibrado)</option>
              <option value="4:4:4">4:4:4 (Melhor qualidade)</option>
            </select>
          </div>
        `
        break

      case 'png':
        optionsHTML = `
          <div class="col-md-6 mb-3">
            <label for="pngCompression" class="form-label">Nível de compressão:</label>
            <select id="pngCompression" class="form-select">
              <option value="0">Sem compressão (0)</option>
              <option value="3">Baixo (3)</option>
              <option value="6" selected>Médio (6)</option>
              <option value="9">Alto (9)</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pngAlpha" checked>
              <label class="form-check-label" for="pngAlpha">Preservar transparência</label>
            </div>
          </div>
        `
        break

      case 'svg':
        optionsHTML = `
          <div class="col-md-6 mb-3">
            <label for="svgPrecision" class="form-label">Precisão do traçado:</label>
            <select id="svgPrecision" class="form-select">
              <option value="1">Baixa</option>
              <option value="5" selected>Média</option>
              <option value="10">Alta</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="svgOptimize" checked>
              <label class="form-check-label" for="svgOptimize">Otimizar SVG</label>
            </div>
          </div>
        `
        break

      case 'ico':
        optionsHTML = `
          <div class="col-md-6 mb-3">
            <label for="icoSizes" class="form-label">Tamanhos:</label>
            <select id="icoSizes" class="form-select" multiple size="4">
              <option value="16" selected>16x16</option>
              <option value="24">24x24</option>
              <option value="32" selected>32x32</option>
              <option value="48" selected>48x48</option>
              <option value="64">64x64</option>
              <option value="128">128x128</option>
            </select>
            <small class="form-text text-muted">Ctrl+clique para selecionar múltiplos</small>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="icoTransparent" checked>
              <label class="form-check-label" for="icoTransparent">Preservar transparência</label>
            </div>
          </div>
          <div class="col-12 mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="icoAllFormats">
              <label class="form-check-label" for="icoAllFormats">
                <strong>Criar todos os formatos de favicon</strong> (inclui PNG, ICO e Web Manifest)
              </label>
              <small class="form-text text-muted d-block">
                Gera uma pasta "favicon" com todos os arquivos necessários para um site completo
              </small>
            </div>
          </div>
        `
        break
    }

    formatOptions.innerHTML = optionsHTML
  }

  // Handle resize select change
  function handleResizeSelect() {
    const value = resizeSelect.value

    if (value === 'original') {
      widthInput.value = ''
      heightInput.value = ''
      widthInput.placeholder = originalFileInfo.width
      heightInput.placeholder = originalFileInfo.height
    } else {
      const dimensions = value.split('x')
      widthInput.value = dimensions[0]
      heightInput.value = dimensions[1]
    }
  }

  // Handle width input change (maintain aspect ratio if needed)
  function handleWidthInput() {
    if (aspectRatio.checked && widthInput.value && originalFileInfo) {
      const ratio = originalFileInfo.height / originalFileInfo.width
      heightInput.value = Math.round(widthInput.value * ratio)
    }
  }

  // Handle height input change (maintain aspect ratio if needed)
  function handleHeightInput() {
    if (aspectRatio.checked && heightInput.value && originalFileInfo) {
      const ratio = originalFileInfo.width / originalFileInfo.height
      widthInput.value = Math.round(heightInput.value * ratio)
    }
  }

  // Main function to convert image
  async function convertImage() {
    if (!originalImage) {
      showNotification('Por favor, selecione uma imagem primeiro.', 'error')
      return
    }

    try {
      // Show progress bar
      progressBar.classList.remove('d-none')
      const progressBarInner = progressBar.querySelector('.progress-bar')
      progressBarInner.style.width = '0%'

      // Get conversion parameters
      const format = formatSelect.value
      const quality = parseInt(qualityRange.value) / 100

      // Get dimensions
      let width = widthInput.value
        ? parseInt(widthInput.value)
        : originalFileInfo.width
      let height = heightInput.value
        ? parseInt(heightInput.value)
        : originalFileInfo.height

      // Animate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 5
        if (progress > 90) clearInterval(progressInterval)
        progressBarInner.style.width = `${progress}%`
      }, 50)

      // Convert the image based on the selected format
      let result

      // Create a temporary canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Load the original image
      const img = new Image()

      // Create a promise to handle image loading
      const imageLoaded = new Promise(resolve => {
        img.onload = resolve
        img.src = originalImage
      })

      // Wait for the image to load
      await imageLoaded

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw the image on the canvas with the specified dimensions
      ctx.drawImage(img, 0, 0, width, height)

      // Convert based on format
      switch (format) {
        case 'webp': {
          const webpLossless =
            document.getElementById('webpLossless')?.checked || false
          const webpAlpha =
            document.getElementById('webpAlpha')?.checked || true

          result = await convertToWebP(canvas, {
            quality: webpLossless ? 1 : quality,
            lossless: webpLossless,
            alpha: webpAlpha
          })
          break
        }

        case 'jpeg': {
          const progressive =
            document.getElementById('jpegProgressive')?.value === 'true'

          result = await convertToJPEG(canvas, {
            quality,
            progressive
          })
          break
        }

        case 'png': {
          const pngAlpha = document.getElementById('pngAlpha')?.checked || true
          const compression = parseInt(
            document.getElementById('pngCompression')?.value || 6
          )

          result = await convertToPNG(canvas, {
            compressionLevel: compression,
            alpha: pngAlpha
          })
          break
        }

        case 'svg': {
          const precision = parseInt(
            document.getElementById('svgPrecision')?.value || 5
          )
          const optimize =
            document.getElementById('svgOptimize')?.checked || true

          result = await convertToSVG(canvas, {
            precision,
            optimize
          })
          break
        }

        case 'ico': {
          // Get selected sizes
          const sizeSelect = document.getElementById('icoSizes')
          const sizes = Array.from(sizeSelect.selectedOptions).map(option =>
            parseInt(option.value)
          )
          const transparent =
            document.getElementById('icoTransparent')?.checked || true
          const createAllFormats =
            document.getElementById('icoAllFormats')?.checked || false

          if (createAllFormats) {
            result = await createAllFaviconFormats(canvas, {
              sizes: sizes.length ? sizes : [16, 32, 48],
              transparent
            })
          } else {
            result = await convertToICO(canvas, {
              sizes: sizes.length ? sizes : [16, 32, 48],
              transparent
            })
          }
          break
        }

        default:
          throw new Error(`Formato não suportado: ${format}`)
      }

      // Clear the interval and set progress to 100%
      clearInterval(progressInterval)
      progressBarInner.style.width = '100%'

      // Store the converted image
      convertedImage = result

      // Update the previews
      updatePreviews()

      // Add to history
      historyManager.addToHistory({
        originalName: originalFileInfo.name,
        originalSize: originalFileInfo.size,
        originalType: originalFileInfo.type,
        convertedSize: result.data.size,
        convertedType: result.type,
        convertedData: result.data,
        convertedName: generateFileName(originalFileInfo.name, format),
        timestamp: new Date().toISOString()
      })

      // Hide progress bar after a small delay
      setTimeout(() => {
        progressBar.classList.add('d-none')
      }, 500)

      // Show notification
      showNotification('Imagem convertida com sucesso!', 'success')
    } catch (error) {
      console.error('Error converting image:', error)
      progressBar.classList.add('d-none')
      showNotification(`Erro ao converter imagem: ${error.message}`, 'error')
    }
  }

  // Update preview area with original and converted images
  async function updatePreviews() {
    if (!originalImage || !convertedImage) return

    // Show preview container and hide placeholder
    previewContainer.classList.remove('d-none')
    previewPlaceholder.classList.add('d-none')

    // Update original image preview
    originalPreview.innerHTML = ''
    const originalImg = document.createElement('img')
    originalImg.src = originalImage
    originalImg.className = 'img-fluid'
    originalPreview.appendChild(originalImg)

    // Update original image info
    originalInfo.textContent = `${originalFileInfo.width}x${
      originalFileInfo.height
    } - ${formatFileSize(originalFileInfo.size)}`

    // Update converted image preview
    convertedPreview.innerHTML = ''

    // Handle SVG differently
    if (convertedImage.type === 'image/svg+xml') {
      try {
        // Decodificar o blob para string
        const svgString = new TextDecoder().decode(
          new Uint8Array(await convertedImage.data.arrayBuffer())
        )

        // Inserir diretamente o SVG como HTML
        convertedPreview.innerHTML = svgString

        // Pegar o elemento SVG inserido e ajustar suas dimensões
        const svgElement = convertedPreview.querySelector('svg')
        if (svgElement) {
          svgElement.setAttribute('width', '100%')
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          svgElement.removeAttribute('height')
        }
      } catch (e) {
        console.error('Erro ao processar SVG:', e)
        // Fallback: mostrar como link para download
        const link = document.createElement('a')
        link.href = URL.createObjectURL(convertedImage.data)
        link.textContent = 'Clique para visualizar SVG'
        link.download = 'imagem.svg'
        link.className = 'btn btn-primary'
        convertedPreview.appendChild(link)
      }
    } else {
      const convertedImg = document.createElement('img')
      convertedImg.src = URL.createObjectURL(convertedImage.data)
      convertedImg.className = 'img-fluid'
      convertedPreview.appendChild(convertedImg)
    }

    // Handle favicon package specially
    if (convertedImage.isFaviconPackage) {
      // Update converted image info for favicon package
      convertedInfo.textContent = `Pacote de Favicon - ${formatFileSize(
        convertedImage.data.size
      )}`

      // Set up the download link for ZIP file
      const baseName =
        originalFileInfo.name.substring(
          0,
          originalFileInfo.name.lastIndexOf('.')
        ) || originalFileInfo.name
      downloadLink.href = URL.createObjectURL(convertedImage.data)
      downloadLink.download = `${baseName}-favicon-package.zip`

      // Add favicon installation guide
      addFaviconInstallationGuide()
    } else {
      // Update converted image info
      convertedInfo.textContent = `${convertedImage.width}x${
        convertedImage.height
      } - ${formatFileSize(convertedImage.data.size)}`

      // Set up the download link
      const format = formatSelect.value
      const fileName = generateFileName(originalFileInfo.name, format)
      downloadLink.href = URL.createObjectURL(convertedImage.data)
      downloadLink.download = fileName
    }

    // Show action buttons
    actionButtons.classList.remove('d-none')
  }

  // Convert canvas to WebP format
  async function convertToWebP(canvas, options = {}) {
    return new Promise(resolve => {
      canvas.toBlob(
        blob => {
          resolve({
            data: blob,
            type: 'image/webp',
            width: canvas.width,
            height: canvas.height
          })
        },
        'image/webp',
        options.quality
      )
    })
  }

  // Convert canvas to JPEG format
  async function convertToJPEG(canvas, options = {}) {
    return new Promise(resolve => {
      // Draw white background for JPEG (because JPEG doesn't support transparency)
      if (options.fillBackground !== false) {
        const ctx = canvas.getContext('2d')
        const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.putImageData(oldData, 0, 0)
      }

      canvas.toBlob(
        blob => {
          resolve({
            data: blob,
            type: 'image/jpeg',
            width: canvas.width,
            height: canvas.height
          })
        },
        'image/jpeg',
        options.quality
      )
    })
  }

  // Convert canvas to PNG format
  async function convertToPNG(canvas, options = {}) {
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve({
          data: blob,
          type: 'image/png',
          width: canvas.width,
          height: canvas.height
        })
      }, 'image/png')
    })
  }

  // Convert canvas to SVG format
  async function convertToSVG(canvas, options = {}) {
    // Obter os dados da imagem do canvas
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixelData = imageData.data

    // Determinar a precisão (quantos pixels pular)
    const precision = options.precision || 5

    // Iniciar o SVG com um elemento de fundo branco
    let svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">`

    // Adicionar um retângulo de fundo branco
    svgString += `<rect width="${canvas.width}" height="${canvas.height}" fill="white"/>`

    // Agrupar pixels semelhantes para reduzir o tamanho do SVG
    const regions = []

    // Percorrer a imagem com a precisão especificada
    for (let y = 0; y < canvas.height; y += precision) {
      let currentRegion = null

      for (let x = 0; x < canvas.width; x += precision) {
        const index = (y * canvas.width + x) * 4
        const r = pixelData[index]
        const g = pixelData[index + 1]
        const b = pixelData[index + 2]
        const a = pixelData[index + 3]

        // Ignorar pixels totalmente transparentes
        if (a < 10) {
          if (currentRegion) {
            regions.push(currentRegion)
            currentRegion = null
          }
          continue
        }

        const color = `rgb(${r},${g},${b})`

        // Se não há região atual ou a cor é diferente, criar uma nova região
        if (!currentRegion || currentRegion.color !== color) {
          if (currentRegion) {
            regions.push(currentRegion)
          }

          currentRegion = {
            color: color,
            y: y,
            startX: x,
            endX: x + precision
          }
        } else {
          // Estender a região atual
          currentRegion.endX = x + precision
        }
      }

      // Adicionar a última região da linha
      if (currentRegion) {
        regions.push(currentRegion)
      }
    }

    // Adicionar retângulos para cada região
    for (const region of regions) {
      const width = region.endX - region.startX

      // Ignorar regiões muito pequenas
      if (width < precision) continue

      svgString += `<rect x="${region.startX}" y="${region.y}" width="${width}" height="${precision}" fill="${region.color}" />`
    }

    // Fechar a tag SVG
    svgString += '</svg>'

    // Criar um Blob com o SVG
    const blob = new Blob([svgString], { type: 'image/svg+xml' })

    return {
      data: blob,
      type: 'image/svg+xml',
      width: canvas.width,
      height: canvas.height
    }
  }

  // Create all favicon formats (PNG, ICO, Web Manifest)
  async function createAllFaviconFormats(canvas, options = {}) {
    const sizes = options.sizes || [16, 32, 48]
    const transparent = options.transparent !== false

    // Create different sized canvases for each favicon format
    const faviconSizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ]

    // Create PNG files for each size
    const pngFiles = []
    for (const favicon of faviconSizes) {
      const iconCanvas = document.createElement('canvas')
      iconCanvas.width = favicon.size
      iconCanvas.height = favicon.size

      const ctx = iconCanvas.getContext('2d')

      // Clear canvas with transparent background if needed
      if (transparent) {
        ctx.clearRect(0, 0, favicon.size, favicon.size)
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, favicon.size, favicon.size)
      }

      // Draw the image
      ctx.drawImage(canvas, 0, 0, favicon.size, favicon.size)

      // Convert to PNG blob
      const pngBlob = await new Promise(resolve => {
        iconCanvas.toBlob(resolve, 'image/png')
      })

      pngFiles.push({
        name: favicon.name,
        data: pngBlob
      })
    }

    // Create ICO file
    const icoResult = await convertToICO(canvas, {
      sizes: [16, 32, 48],
      transparent
    })

    // Create Web Manifest
    const webManifest = {
      name: 'Meu Site',
      short_name: 'Site',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone'
    }

    const manifestBlob = new Blob([JSON.stringify(webManifest, null, 2)], {
      type: 'application/json'
    })

    // Create ZIP file with all favicon files
    const JSZip = window.JSZip
    if (!JSZip) {
      throw new Error(
        'JSZip library not loaded. Please include JSZip in your HTML.'
      )
    }

    const zip = new JSZip()
    const faviconFolder = zip.folder('favicon')

    // Add all PNG files
    for (const pngFile of pngFiles) {
      faviconFolder.file(pngFile.name, pngFile.data)
    }

    // Add ICO file
    faviconFolder.file('favicon.ico', icoResult.data)

    // Add Web Manifest
    faviconFolder.file('site.webmanifest', manifestBlob)

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    return {
      data: zipBlob,
      type: 'application/zip',
      width: canvas.width,
      height: canvas.height,
      isFaviconPackage: true,
      faviconFiles: pngFiles,
      icoFile: icoResult,
      webManifest: webManifest
    }
  }

  // Convert canvas to ICO format
  async function convertToICO(canvas, options = {}) {
    // Tamanhos de ícones a serem gerados
    const sizes = options.sizes || [16, 32, 48]

    // Criar um canvas para cada tamanho de ícone
    const iconCanvases = sizes.map(size => {
      const iconCanvas = document.createElement('canvas')
      iconCanvas.width = size
      iconCanvas.height = size

      // Desenhar a imagem redimensionada no canvas
      const ctx = iconCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, size, size)

      return { size, canvas: iconCanvas }
    })

    // Criar um arquivo ICO manualmente
    // Estrutura do arquivo ICO: https://en.wikipedia.org/wiki/ICO_(file_format)

    // 1. Cabeçalho do arquivo ICO (6 bytes)
    const header = new Uint8Array(6)
    // Reservado (deve ser 0)
    header[0] = 0
    header[1] = 0
    // Tipo (1 = ICO)
    header[2] = 1
    header[3] = 0
    // Número de imagens
    header[4] = iconCanvases.length
    header[5] = 0

    // 2. Diretório de imagens (16 bytes por imagem)
    const directory = new Uint8Array(16 * iconCanvases.length)

    // 3. Converter cada canvas para PNG
    const pngPromises = iconCanvases.map(({ canvas }) => {
      return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png')
      })
    })

    // Aguardar todas as conversões PNG
    const pngBlobs = await Promise.all(pngPromises)

    // Converter Blobs em ArrayBuffers
    const pngArrayBuffers = await Promise.all(
      pngBlobs.map(blob => blob.arrayBuffer())
    )

    // Calcular o deslocamento para os dados da imagem
    let imageDataOffset = 6 + 16 * iconCanvases.length // Cabeçalho + diretório

    // Preencher o diretório e preparar os buffers de imagem
    for (let i = 0; i < iconCanvases.length; i++) {
      const { size } = iconCanvases[i]
      const pngArrayBuffer = pngArrayBuffers[i]
      const pngData = new Uint8Array(pngArrayBuffer)

      // Largura (0 significa 256)
      directory[i * 16] = size === 256 ? 0 : size
      // Altura (0 significa 256)
      directory[i * 16 + 1] = size === 256 ? 0 : size
      // Número de cores da paleta (0 para PNG pois usamos true color)
      directory[i * 16 + 2] = 0
      // Reservado (deve ser 0)
      directory[i * 16 + 3] = 0
      // Planos de cor (deve ser 1 para ICO)
      directory[i * 16 + 4] = 1
      directory[i * 16 + 5] = 0
      // Bits por pixel (32 para PNG com transparência)
      directory[i * 16 + 6] = 32
      directory[i * 16 + 7] = 0
      // Tamanho da imagem em bytes
      directory[i * 16 + 8] = pngData.length & 0xff
      directory[i * 16 + 9] = (pngData.length >> 8) & 0xff
      directory[i * 16 + 10] = (pngData.length >> 16) & 0xff
      directory[i * 16 + 11] = (pngData.length >> 24) & 0xff
      // Offset para os dados da imagem
      directory[i * 16 + 12] = imageDataOffset & 0xff
      directory[i * 16 + 13] = (imageDataOffset >> 8) & 0xff
      directory[i * 16 + 14] = (imageDataOffset >> 16) & 0xff
      directory[i * 16 + 15] = (imageDataOffset >> 24) & 0xff

      // Atualizar o offset para a próxima imagem
      imageDataOffset += pngData.length
    }

    // Combinar todos os buffers
    const totalLength =
      6 +
      16 * iconCanvases.length +
      pngArrayBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
    const icoBuffer = new Uint8Array(totalLength)

    // Copiar o cabeçalho
    icoBuffer.set(header, 0)

    // Copiar o diretório
    icoBuffer.set(directory, 6)

    // Copiar os dados das imagens
    let currentOffset = 6 + 16 * iconCanvases.length
    for (let i = 0; i < pngArrayBuffers.length; i++) {
      const pngData = new Uint8Array(pngArrayBuffers[i])
      icoBuffer.set(pngData, currentOffset)
      currentOffset += pngData.length
    }

    // Criar Blob a partir do buffer combinado
    const blob = new Blob([icoBuffer], { type: 'image/x-icon' })

    return {
      data: blob,
      type: 'image/x-icon',
      width: canvas.width,
      height: canvas.height
    }
  }

  // Add favicon installation guide to the preview area
  function addFaviconInstallationGuide() {
    // Create installation guide container
    const guideContainer = document.createElement('div')
    guideContainer.className = 'favicon-installation-guide mt-4 p-3 bg-light rounded'
    guideContainer.innerHTML = `
      <h5 class="mb-3">
        <i class="fas fa-info-circle text-primary"></i>
        Guia de Instalação do Favicon
      </h5>
      
      <div class="mb-3">
        <h6>1. Download dos Arquivos</h6>
        <p>Use o botão de download acima para baixar o pacote ZIP. Extraia os arquivos e coloque-os no diretório raiz do seu site:</p>
        <ul class="list-unstyled">
          <li><i class="fas fa-file-image text-success"></i> android-chrome-192x192.png</li>
          <li><i class="fas fa-file-image text-success"></i> android-chrome-512x512.png</li>
          <li><i class="fas fa-file-image text-success"></i> apple-touch-icon.png</li>
          <li><i class="fas fa-file-image text-success"></i> favicon-16x16.png</li>
          <li><i class="fas fa-file-image text-success"></i> favicon-32x32.png</li>
          <li><i class="fas fa-file-image text-success"></i> favicon.ico</li>
          <li><i class="fas fa-file-code text-info"></i> site.webmanifest</li>
        </ul>
      </div>
      
      <div class="mb-3">
        <h6>2. Adicionar Tags HTML</h6>
        <p>Copie as seguintes tags e cole-as no <code>&lt;head&gt;</code> do seu HTML:</p>
        <div class="bg-dark text-light p-3 rounded position-relative">
          <button class="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2" onclick="copyHtmlTags()">
            <i class="fas fa-copy"></i> Copiar
          </button>
          <pre class="mb-0"><code>&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;
&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"&gt;
&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"&gt;
&lt;link rel="manifest" href="/site.webmanifest"&gt;</code></pre>
        </div>
      </div>
      
      <div class="alert alert-info">
        <i class="fas fa-lightbulb"></i>
        <strong>Dica:</strong> Estes arquivos são compatíveis com todos os navegadores modernos e dispositivos móveis.
      </div>
    `

    // Add the guide to the preview area
    const previewArea = document.querySelector('.preview-container')
    if (previewArea) {
      // Remove any existing guide
      const existingGuide = previewArea.querySelector('.favicon-installation-guide')
      if (existingGuide) {
        existingGuide.remove()
      }
      
      // Add new guide
      previewArea.appendChild(guideContainer)
    }
  }

  // Function to copy HTML tags to clipboard
  window.copyHtmlTags = function() {
    const htmlTags = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`
    
    navigator.clipboard.writeText(htmlTags).then(() => {
      showNotification('Tags HTML copiadas para a área de transferência!', 'success')
    }).catch(() => {
      showNotification('Erro ao copiar tags HTML', 'error')
    })
  }

  // Generate a filename for the converted image
  function generateFileName(originalName, format) {
    // Remove the original extension
    const baseName =
      originalName.substring(0, originalName.lastIndexOf('.')) || originalName
    return `${baseName}.${format}`
  }

  document.addEventListener('editedImageAvailable', handleEditedImage)

  // Função para carregar imagem editada do editor
  function handleEditedImage() {
    // Tentar obter a imagem do sessionStorage
    const imageDataUrl = sessionStorage.getItem('editedImage')

    if (!imageDataUrl) {
      console.error('Imagem editada não encontrada no sessionStorage')
      return
    }

    // Converter o Data URL para um File/Blob
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        // Criar um arquivo a partir do blob
        const file = new File([blob], 'imagem-editada.png', {
          type: 'image/png'
        })

        // Processar o arquivo como se tivesse sido selecionado pelo usuário
        processSelectedFile(file)

        // Limpar o sessionStorage
        sessionStorage.removeItem('editedImage')

        showNotification('Imagem do editor carregada com sucesso!', 'success')
      })
      .catch(error => {
        console.error('Erro ao carregar imagem editada:', error)
        showNotification('Erro ao carregar imagem do editor', 'error')
      })
  }
}

// Exposed function to get the current converted image data
export function getConvertedImageData() {
  return convertedImage
}
