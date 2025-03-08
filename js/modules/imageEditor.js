// imageEditor.js - Handle image editing functionality
import { showNotification } from '../app.js'

// Global variables
let canvas
let originalImage = null
let originalImageName = ''
let currentFilter = 'normal'
let adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0
}

export function initImageEditor() {
  console.log('Initializing image editor functionality...')

  // DOM elements
  const editorFileInput = document.getElementById('editorFileInput')
  const editorArea = document.querySelector('.editor-area')
  const editorActions = document.querySelector('.editor-actions')
  const editorCanvas = document.getElementById('editorCanvas')
  const brightnessRange = document.getElementById('brightnessRange')
  const contrastRange = document.getElementById('contrastRange')
  const saturationRange = document.getElementById('saturationRange')
  const filterButtons = document.querySelectorAll('.filter-btn')
  const cropTool = document.getElementById('cropTool')
  const rotateTool = document.getElementById('rotateTool')
  const flipTool = document.getElementById('flipTool')
  const textTool = document.getElementById('textTool')
  const resetEditor = document.getElementById('resetEditor')
  const saveEdits = document.getElementById('saveEdits')
  const exportEdits = document.getElementById('exportEdits')
  const textToolModal = document.getElementById('textToolModal')
  const addTextBtn = document.getElementById('addTextBtn')

  // Initialize Fabric.js canvas
  canvas = new fabric.Canvas(editorCanvas, {
    backgroundColor: '#f8f9fa',
    preserveObjectStacking: true
  })

  // Set canvas dimensions to fit the container
  updateCanvasSize()

  // Listen for window resize to adjust canvas size
  window.addEventListener('resize', updateCanvasSize)

  // Handle file selection
  editorFileInput.addEventListener('change', handleFileSelection)

  // Initialize adjustment controls
  initAdjustments()

  // Initialize filter buttons
  initFilterButtons()

  // Initialize tool buttons
  initToolButtons()

  // Initialize action buttons
  initActionButtons()

  // Update canvas size based on container
  function updateCanvasSize() {
    const containerWidth =
      document.querySelector('.canvas-container').offsetWidth
    canvas.setWidth(containerWidth)
    canvas.setHeight(containerWidth * 0.75) // 4:3 aspect ratio
    canvas.renderAll()
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
    originalImageName = file.name

    // Create a FileReader to read the image
    const reader = new FileReader()

    reader.onload = function (e) {
      // Load the image onto the canvas
      fabric.Image.fromURL(e.target.result, function (img) {
        // Save the original image
        originalImage = img

        // Reset adjustments and filters
        resetAdjustments()

        // Fit the image to the canvas
        fitImageToCanvas(img)

        // Show the editor area and actions
        editorArea.classList.remove('d-none')
        editorActions.classList.remove('d-none')

        showNotification('Imagem carregada com sucesso!', 'success')
      })
    }

    reader.readAsDataURL(file)
  }

  // Fit the image to the canvas
  function fitImageToCanvas(img) {
    // Clear the canvas
    canvas.clear()

    // Calculate scale to fit the canvas while preserving aspect ratio
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()

    const scaleX = canvasWidth / img.width
    const scaleY = canvasHeight / img.height
    const scale = Math.min(scaleX, scaleY) * 0.9 // 90% of the canvas size

    // Scale the image
    img.scale(scale)

    // Center the image on the canvas
    img.set({
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center'
    })

    // Add the image to the canvas
    canvas.add(img)
    canvas.renderAll()
  }

  // Initialize adjustment controls
  function initAdjustments() {
    // Brightness adjustment
    brightnessRange.addEventListener('input', function () {
      adjustments.brightness = parseInt(this.value)
      applyFilters()
    })

    // Contrast adjustment
    contrastRange.addEventListener('input', function () {
      adjustments.contrast = parseInt(this.value)
      applyFilters()
    })

    // Saturation adjustment
    saturationRange.addEventListener('input', function () {
      adjustments.saturation = parseInt(this.value)
      applyFilters()
    })
  }

  // Initialize filter buttons
  function initFilterButtons() {
    filterButtons.forEach(button => {
      button.addEventListener('click', function () {
        currentFilter = this.dataset.filter

        // Highlight the active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'))
        this.classList.add('active')

        applyFilters()
      })
    })
  }

  // Initialize tool buttons
  function initToolButtons() {
    // Crop tool
    cropTool.addEventListener('click', function () {
      if (!canvas.getActiveObject()) {
        showNotification('Selecione uma imagem primeiro.', 'warning')
        return
      }

      // Toggle crop mode
      const isCropping = this.classList.toggle('active')

      if (isCropping) {
        // Enable cropping mode
        canvas.getActiveObject().set({
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false
        })
        showNotification(
          'Modo de corte ativado. Redimensione a imagem para cortar.',
          'info'
        )
      } else {
        // Apply the crop
        applyCrop()
      }
    })

    // Rotate tool
    rotateTool.addEventListener('click', function () {
      const activeObject = canvas.getActiveObject()

      if (!activeObject) {
        showNotification('Selecione uma imagem primeiro.', 'warning')
        return
      }

      // Rotate the object by 90 degrees
      activeObject.rotate((activeObject.angle || 0) + 90)
      canvas.renderAll()
    })

    // Flip tool
    flipTool.addEventListener('click', function () {
      const activeObject = canvas.getActiveObject()

      if (!activeObject) {
        showNotification('Selecione uma imagem primeiro.', 'warning')
        return
      }

      // Flip the object horizontally
      activeObject.set('flipX', !activeObject.flipX)
      canvas.renderAll()
    })

    // Text tool
    textTool.addEventListener('click', function () {
      // Show the text tool modal
      const textToolModalInstance = new bootstrap.Modal(textToolModal)
      textToolModalInstance.show()
    })

    // Add text button
    addTextBtn.addEventListener('click', function () {
      // Get text properties
      const textInput = document.getElementById('textInput')
      const fontSelect = document.getElementById('fontSelect')
      const fontSizeInput = document.getElementById('fontSizeInput')
      const textColorInput = document.getElementById('textColorInput')
      const textBackgroundInput = document.getElementById('textBackgroundInput')
      const textBackgroundTransparent = document.getElementById(
        'textBackgroundTransparent'
      )

      // Create a text object
      const text = new fabric.Text(textInput.value, {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontFamily: fontSelect.value,
        fontSize: parseInt(fontSizeInput.value),
        fill: textColorInput.value,
        backgroundColor: textBackgroundTransparent.checked
          ? null
          : textBackgroundInput.value,
        originX: 'center',
        originY: 'center'
      })

      // Add the text to the canvas
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()

      // Hide the modal
      bootstrap.Modal.getInstance(textToolModal).hide()
      showNotification('Texto adicionado com sucesso!', 'success')
    })

    // Reset editor button
    resetEditor.addEventListener('click', function () {
      // Confirm reset
      if (confirm('Tem certeza que deseja redefinir todas as alterações?')) {
        resetAdjustments()

        // Restore original image
        if (originalImage) {
          fitImageToCanvas(originalImage)
          showNotification('Editor reiniciado com sucesso!', 'success')
        }
      }
    })
  }

  // Initialize action buttons
  function initActionButtons() {
    // Save edits button
    saveEdits.addEventListener('click', function () {
      if (!canvas.getObjects().length) {
        showNotification('Não há imagem para salvar.', 'warning')
        return
      }

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      })

      // Create download link
      const link = document.createElement('a')
      link.href = dataURL
      link.download = originalImageName.split('.')[0] + '_editado.png'
      link.click()

      showNotification('Imagem salva com sucesso!', 'success')
    })

    // Export to converter button
    exportEdits.addEventListener('click', function () {
      if (!canvas.getObjects().length) {
        showNotification('Não há imagem para exportar.', 'warning')
        return
      }

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      })

      // Create a blob from the data URL
      const blob = dataURLtoBlob(dataURL)

      // Create a File object
      const file = new File(
        [blob],
        originalImageName.split('.')[0] + '_editado.png',
        { type: 'image/png' }
      )

      // Create a new FileList object
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      // Set the file input value
      const fileInput = document.getElementById('fileInput')
      fileInput.files = dataTransfer.files

      // Trigger change event to load the image in the converter
      const event = new Event('change', { bubbles: true })
      fileInput.dispatchEvent(event)

      // Switch to converter tab
      document.querySelector('[href="#converterTab"]').click()

      showNotification('Imagem exportada para o conversor!', 'success')
    })
  }

  // Apply crop to the active object
  function applyCrop() {
    const activeObject = canvas.getActiveObject()

    if (!activeObject) {
      return
    }

    // Get the object's bounding box
    const boundingRect = activeObject.getBoundingRect()

    // Create a cropped version of the image
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = boundingRect.width
    croppedCanvas.height = boundingRect.height

    // Draw the cropped image
    const ctx = croppedCanvas.getContext('2d')
    ctx.drawImage(
      canvas.getElement(),
      boundingRect.left,
      boundingRect.top,
      boundingRect.width,
      boundingRect.height,
      0,
      0,
      boundingRect.width,
      boundingRect.height
    )

    // Create a new image from the cropped canvas
    fabric.Image.fromURL(croppedCanvas.toDataURL(), function (img) {
      // Replace the active object with the cropped image
      canvas.remove(activeObject)
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()

      showNotification('Imagem cortada com sucesso!', 'success')
    })
  }

  // Apply filters to the image
  function applyFilters() {
    const activeObject = canvas.getObjects()[0] // Assume the image is the first object

    if (!activeObject || !activeObject.filters) {
      return
    }

    // Clear existing filters
    activeObject.filters = []

    // Apply adjustments
    if (adjustments.brightness !== 0) {
      activeObject.filters.push(
        new fabric.Image.filters.Brightness({
          brightness: adjustments.brightness / 100
        })
      )
    }

    if (adjustments.contrast !== 0) {
      activeObject.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: adjustments.contrast / 100
        })
      )
    }

    if (adjustments.saturation !== 0) {
      activeObject.filters.push(
        new fabric.Image.filters.Saturation({
          saturation: 1 + adjustments.saturation / 100
        })
      )
    }

    // Apply selected filter
    if (currentFilter === 'grayscale') {
      activeObject.filters.push(new fabric.Image.filters.Grayscale())
    } else if (currentFilter === 'sepia') {
      activeObject.filters.push(new fabric.Image.filters.Sepia())
    } else if (currentFilter === 'vintage') {
      // Vintage is a combination of filters for a retro look
      activeObject.filters.push(new fabric.Image.filters.Sepia())
      activeObject.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: 0.1
        })
      )
      activeObject.filters.push(
        new fabric.Image.filters.Noise({
          noise: 20
        })
      )
    }

    // Apply the filters
    activeObject.applyFilters()
    canvas.renderAll()
  }

  // Reset all adjustments
  function resetAdjustments() {
    // Reset sliders
    brightnessRange.value = 0
    contrastRange.value = 0
    saturationRange.value = 0

    // Reset adjustments object
    adjustments = {
      brightness: 0,
      contrast: 0,
      saturation: 0
    }

    // Reset filter
    currentFilter = 'normal'
    filterButtons.forEach(btn => btn.classList.remove('active'))
    filterButtons[0].classList.add('active') // Select 'Normal'

    // Apply reset
    applyFilters()
  }

  // Convert data URL to Blob
  function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })
  }
}

// Get the edited image data
export function getEditedImageData() {
  if (!canvas) return null

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1
  })

  return dataURL
}
