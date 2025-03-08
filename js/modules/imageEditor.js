/**
 * Image Editor Module
 * Gerencia a edição de imagens usando Fabric.js
 */

let canvas
let originalImage
let currentFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  filter: 'normal'
}

export function initImageEditor() {
  const editorFileInput = document.getElementById('editorFileInput')
  const cropTool = document.getElementById('cropTool')
  const rotateTool = document.getElementById('rotateTool')
  const flipTool = document.getElementById('flipTool')
  const textTool = document.getElementById('textTool')
  const resetEditor = document.getElementById('resetEditor')
  const saveEdits = document.getElementById('saveEdits')
  const exportEdits = document.getElementById('exportEdits')
  const editorArea = document.querySelector('.editor-area')
  const editorActions = document.querySelector('.editor-actions')

  // Inicializar ajustes de imagem
  const brightnessRange = document.getElementById('brightnessRange')
  const contrastRange = document.getElementById('contrastRange')
  const saturationRange = document.getElementById('saturationRange')

  // Inicializar filtros
  const filterButtons = document.querySelectorAll('.filter-btn')

  // Inicializar canvas quando o arquivo for selecionado
  editorFileInput.addEventListener('change', event => {
    if (event.target.files && event.target.files[0]) {
      initCanvas()
      loadImage(event.target.files[0])

      // Mostrar a área do editor
      editorArea.classList.remove('d-none')
      editorActions.classList.remove('d-none')
    }
  })

  // Event listeners para ferramentas
  if (cropTool) cropTool.addEventListener('click', toggleCrop)
  if (rotateTool) rotateTool.addEventListener('click', rotateImage)
  if (flipTool) flipTool.addEventListener('click', flipImage)
  if (textTool) textTool.addEventListener('click', openTextModal)
  if (resetEditor) resetEditor.addEventListener('click', resetEditorChanges)
  if (saveEdits) saveEdits.addEventListener('click', saveEditedImage)
  if (exportEdits) exportEdits.addEventListener('click', exportToConverter)

  // Event listeners para ajustes
  if (brightnessRange)
    brightnessRange.addEventListener('input', updateBrightness)
  if (contrastRange) contrastRange.addEventListener('input', updateContrast)
  if (saturationRange)
    saturationRange.addEventListener('input', updateSaturation)

  // Event listeners para filtros
  filterButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      applyFilter(e.target.dataset.filter)

      // Atualizar classe ativa
      filterButtons.forEach(b => b.classList.remove('active'))
      e.target.classList.add('active')
    })
  })

  // Event listeners para o modal de texto
  const addTextBtn = document.getElementById('addTextBtn')
  if (addTextBtn) {
    addTextBtn.addEventListener('click', addTextToImage)
  }

  // Verificar se estamos em tema escuro para ajustar o canvas
  checkDarkMode()

  // Observar mudanças no tema
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
}

// Inicializar o canvas do editor
function initCanvas() {
  const canvasElement = document.getElementById('editorCanvas')

  // Destruir canvas existente se houver
  if (canvas) {
    canvas.dispose()
  }

  // Obter o tamanho do contêiner
  const container =
    document.querySelector('.canvas-container') ||
    document.querySelector('.editor-area')
  const containerWidth = container ? container.clientWidth : 800

  // Definir dimensões iniciais mais adequadas
  const canvasWidth = Math.min(containerWidth - 20, 800) // Subtrair margem
  const canvasHeight = Math.floor(canvasWidth * 0.75) // Proporção 4:3 mais comum para imagens

  // Criar novo canvas com tamanho adequado
  canvas = new fabric.Canvas('editorCanvas', {
    backgroundColor: '#f5f5f5',
    preserveObjectStacking: true,
    width: canvasWidth,
    height: canvasHeight,
    selection: true, // Permitir seleção de objetos
    interactive: true // Garantir que o canvas seja interativo
  })

  // Ajustar cor de fundo do canvas para o tema atual
  adjustCanvasBackground()

  // Adicionar tratamento de redimensionamento com throttle para evitar múltiplas chamadas
  let resizeTimeout
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(adjustCanvasSize, 250)
  })

  console.log(
    `Canvas initialized with dimensions: ${canvasWidth}x${canvasHeight}`
  )
}

// Verificar e ajustar para o modo escuro
function checkDarkMode() {
  if (canvas) {
    adjustCanvasBackground()
  }
}

// Ajustar a cor de fundo do canvas com base no tema
function adjustCanvasBackground() {
  const isDarkMode =
    document.documentElement.getAttribute('data-theme') === 'dark'
  if (canvas) {
    canvas.backgroundColor = isDarkMode ? '#2c3035' : '#f5f5f5'
    canvas.renderAll()
  }
}

// Carregar imagem no canvas
function loadImage(file) {
  // Mostrar spinner ou indicação de carregamento
  showLoadingState(true)

  const reader = new FileReader()

  reader.onload = e => {
    const imgUrl = e.target.result

    // Carregar a imagem primeiro para obter suas dimensões nativas
    const tmpImg = new Image()
    tmpImg.onload = function () {
      const imgWidth = this.width
      const imgHeight = this.height
      console.log(`Original image dimensions: ${imgWidth}x${imgHeight}`)

      // Ajustar o canvas para melhor acomodar a imagem
      adjustCanvasToImage(imgWidth, imgHeight)

      // Agora carregar a imagem no Fabric.js
      fabric.Image.fromURL(imgUrl, img => {
        // Armazenar imagem original para resets
        originalImage = img

        // Redimensionar imagem para caber no canvas
        const scale = calculateImageScale(img)
        console.log(`Applied scale factor: ${scale}`)
        img.scale(scale)

        // Centralizar imagem no canvas
        img.set({
          originX: 'center',
          originY: 'center',
          left: canvas.width / 2,
          top: canvas.height / 2,
          selectable: true // Garantir que a imagem seja selecionável
        })

        // Limpar canvas e adicionar a imagem
        canvas.clear()
        canvas.add(img)
        canvas.setActiveObject(img)

        // Definir o zoom do canvas para garantir visibilidade total
        canvas.setZoom(1)
        canvas.renderAll()

        // Esconder indicação de carregamento
        showLoadingState(false)

        // Resetar todos os controles
        resetControls()

        // Mostrar feedback
        showNotification('Imagem carregada com sucesso', 'success')
      })
    }

    tmpImg.src = imgUrl
  }

  reader.onerror = () => {
    showLoadingState(false)
    showNotification('Erro ao carregar a imagem', 'error')
  }

  reader.readAsDataURL(file)
}

function adjustCanvasToImage(imgWidth, imgHeight) {
  if (!canvas) return

  const container =
    document.querySelector('.canvas-container') ||
    document.querySelector('.editor-area')
  if (!container) return

  const containerWidth = container.clientWidth - 20 // Subtrair margem
  let canvasWidth, canvasHeight

  // Calcular a melhor proporção para o canvas
  const imgRatio = imgHeight / imgWidth

  if (imgRatio > 1) {
    // Imagem na vertical (retrato)
    canvasHeight = Math.min(containerWidth * 0.85, 600)
    canvasWidth = canvasHeight / imgRatio
  } else {
    // Imagem na horizontal (paisagem) ou quadrada
    canvasWidth = Math.min(containerWidth, 800)
    canvasHeight = canvasWidth * imgRatio

    // Garantir altura mínima
    if (canvasHeight < 300) {
      canvasHeight = 300
      // Ajustar largura para manter proporção
      canvasWidth = canvasHeight / imgRatio
    }
  }

  // Garantir que o canvas não seja muito pequeno
  canvasWidth = Math.max(canvasWidth, 400)
  canvasHeight = Math.max(canvasHeight, 300)

  // Atualizar dimensões do canvas
  canvas.setDimensions({
    width: Math.floor(canvasWidth),
    height: Math.floor(canvasHeight)
  })

  console.log(`Canvas adjusted to: ${canvas.width}x${canvas.height}`)
}

// Calcular escala apropriada para a imagem
function calculateImageScale(img) {
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const imgWidth = img.width
  const imgHeight = img.height

  // Adicionar margem de 5% para não encostar nos bordos
  const maxWidth = canvasWidth * 0.95
  const maxHeight = canvasHeight * 0.95

  // Calcular escala para largura e altura
  const scaleX = maxWidth / imgWidth
  const scaleY = maxHeight / imgHeight

  // Usar a menor escala para garantir que a imagem caiba completamente
  return Math.min(scaleX, scaleY, 1) // Limitar a 1 para não ampliar pequenas imagens
}

// Ajustar tamanho do canvas com base na janela
function adjustCanvasSize() {
  if (!canvas) return

  const container = document.querySelector('.canvas-container')
  if (!container) return

  const containerWidth = container.clientWidth

  // Preservar proporção atual do canvas
  const currentRatio = canvas.height / canvas.width

  // Calcular novas dimensões mantendo a proporção
  const newWidth = Math.min(containerWidth - 20, 800) // Margem de 20px
  const newHeight = Math.floor(newWidth * currentRatio)

  // Atualizar dimensões do canvas
  canvas.setDimensions({
    width: newWidth,
    height: newHeight
  })

  // Reposicionar objetos
  canvas.centerObject(canvas.getObjects()[0])

  // Reajustar escala dos objetos se necessário
  if (canvas.getObjects().length > 0) {
    const mainImage = canvas.getObjects()[0]
    if (mainImage && mainImage.type === 'image') {
      const scale = calculateImageScale(mainImage)

      // Só aplicar nova escala se for significativamente diferente
      if (Math.abs(mainImage.scaleX - scale) > 0.05) {
        mainImage.scale(scale)
      }

      // Centralizar a imagem
      mainImage.set({
        left: newWidth / 2,
        top: newHeight / 2
      })
    }
  }

  canvas.renderAll()
}

// Mostrar estado de carregamento
function showLoadingState(isLoading) {
  const container = document.querySelector('.canvas-container')

  if (isLoading) {
    // Adicionar indicador de carregamento
    const loader = document.createElement('div')
    loader.className = 'canvas-loader'
    loader.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><span>Carregando imagem...</span>'

    if (container) {
      container.appendChild(loader)
    }
  } else {
    // Remover indicador de carregamento
    const loader = document.querySelector('.canvas-loader')
    if (loader) {
      loader.remove()
    }
  }
}

// Atualizar brilho da imagem
function updateBrightness(e) {
  const value = parseFloat(e.target.value)
  currentFilters.brightness = value
  applyFilters()
}

// Atualizar contraste da imagem
function updateContrast(e) {
  const value = parseFloat(e.target.value)
  currentFilters.contrast = value
  applyFilters()
}

// Atualizar saturação da imagem
function updateSaturation(e) {
  const value = parseFloat(e.target.value)
  currentFilters.saturation = value
  applyFilters()
}

// Aplicar filtro especial à imagem (p&b, sépia, etc.)
function applyFilter(filterName) {
  currentFilters.filter = filterName
  applyFilters()
}

// Aplicar todos os filtros à imagem
function applyFilters() {
  if (!canvas || canvas.getObjects().length === 0) return

  const img = canvas.getObjects()[0]
  if (!img) return

  // Remover filtros existentes
  img.filters = []

  // Aplicar brilho
  if (currentFilters.brightness !== 0) {
    img.filters.push(
      new fabric.Image.filters.Brightness({
        brightness: currentFilters.brightness / 100
      })
    )
  }

  // Aplicar contraste
  if (currentFilters.contrast !== 0) {
    img.filters.push(
      new fabric.Image.filters.Contrast({
        contrast: currentFilters.contrast / 100
      })
    )
  }

  // Aplicar saturação
  if (currentFilters.saturation !== 0) {
    img.filters.push(
      new fabric.Image.filters.Saturation({
        saturation: currentFilters.saturation / 100
      })
    )
  }

  // Aplicar filtros especiais
  switch (currentFilters.filter) {
    case 'grayscale':
      img.filters.push(new fabric.Image.filters.Grayscale())
      break
    case 'sepia':
      img.filters.push(new fabric.Image.filters.Sepia())
      break
    case 'vintage':
      // Combinação de filtros para efeito vintage
      img.filters.push(new fabric.Image.filters.Sepia())
      img.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: 0.15
        })
      )
      img.filters.push(
        new fabric.Image.filters.Brightness({
          brightness: -0.05
        })
      )
      break
  }

  // Aplicar filtros
  img.applyFilters()
  canvas.renderAll()
}

// Função para redefinir o editor
function resetEditorChanges() {
  if (!originalImage || !canvas) return

  // Confirmar reset
  if (confirm('Tem certeza que deseja redefinir todas as alterações?')) {
    // Limpar canvas
    canvas.clear()

    // Criar nova instância da imagem original
    originalImage.clone(clonedImg => {
      // Redimensionar e centralizar
      const scale = calculateImageScale(clonedImg)
      clonedImg.scale(scale)

      clonedImg.set({
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2
      })

      // Adicionar ao canvas
      canvas.add(clonedImg)
      canvas.setActiveObject(clonedImg)
      canvas.renderAll()

      // Resetar controles
      resetControls()

      showNotification('Editor redefinido com sucesso', 'success')
    })
  }
}

// Resetar os controles para os valores padrão
function resetControls() {
  // Resetar valores dos sliders
  document.getElementById('brightnessRange').value = 0
  document.getElementById('contrastRange').value = 0
  document.getElementById('saturationRange').value = 0

  // Resetar filtros
  const filterButtons = document.querySelectorAll('.filter-btn')
  filterButtons.forEach(btn => btn.classList.remove('active'))
  document.querySelector('[data-filter="normal"]').classList.add('active')

  // Resetar objeto de filtros
  currentFilters = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: 'normal'
  }
}

// Função de recorte (crop)
function toggleCrop() {
  if (!canvas || canvas.getObjects().length === 0) return

  const cropTool = document.getElementById('cropTool')

  // Verificar se já está no modo de recorte
  const isCropping = cropTool.classList.contains('active')

  if (isCropping) {
    // Desativar modo de recorte
    cropTool.classList.remove('active')

    // Remover retângulo de recorte se existir
    const cropRect = canvas.getObjects().find(obj => obj.id === 'cropRect')
    if (cropRect) {
      applyCrop(cropRect)
      canvas.remove(cropRect)
    }
  } else {
    // Ativar modo de recorte
    cropTool.classList.add('active')

    // Adicionar retângulo de recorte
    const img = canvas.getObjects()[0]

    if (img) {
      const left = img.left - (img.width * img.scaleX) / 2 + 20
      const top = img.top - (img.height * img.scaleY) / 2 + 20
      const width = img.width * img.scaleX - 40
      const height = img.height * img.scaleY - 40

      const rect = new fabric.Rect({
        id: 'cropRect',
        left: left,
        top: top,
        width: width,
        height: height,
        stroke: '#4a6bff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        fill: 'rgba(74, 107, 255, 0.1)',
        cornerColor: '#4a6bff',
        cornerSize: 10,
        transparentCorners: false,
        hasRotatingPoint: false
      })

      canvas.add(rect)
      canvas.setActiveObject(rect)
    }
  }
}

// Aplicar o recorte
function applyCrop(cropRect) {
  if (!canvas || canvas.getObjects().length === 0) return

  const img = canvas.getObjects()[0]
  if (!img || !img.isType('image')) return

  // Obter coordenadas do retângulo e da imagem
  const imgLeft = img.left - (img.width * img.scaleX) / 2
  const imgTop = img.top - (img.height * img.scaleY) / 2
  const cropLeft = cropRect.left
  const cropTop = cropRect.top

  // Converter para coordenadas locais da imagem
  const localLeft = (cropLeft - imgLeft) / img.scaleX
  const localTop = (cropTop - imgTop) / img.scaleY
  const localWidth = cropRect.width / img.scaleX
  const localHeight = cropRect.height / img.scaleY

  // Criar um canvas temporário para o recorte
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = img.width
  tempCanvas.height = img.height

  // Desenhar a imagem original no canvas temporário
  const ctx = tempCanvas.getContext('2d')

  // Converter objeto fabric.Image para HTMLImageElement
  const imgEl = new Image()
  imgEl.src = img._element.src

  ctx.drawImage(imgEl, 0, 0, img.width, img.height)

  // Criar outro canvas para o recorte final
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = localWidth
  cropCanvas.height = localHeight

  // Recortar a imagem
  const cropCtx = cropCanvas.getContext('2d')
  cropCtx.drawImage(
    tempCanvas,
    localLeft,
    localTop,
    localWidth,
    localHeight,
    0,
    0,
    localWidth,
    localHeight
  )

  // Criar nova imagem com o recorte
  fabric.Image.fromURL(cropCanvas.toDataURL(), croppedImg => {
    // Remover imagem original
    canvas.remove(img)

    // Ajustar e adicionar nova imagem
    const scale = calculateImageScale(croppedImg)
    croppedImg.scale(scale)

    croppedImg.set({
      originX: 'center',
      originY: 'center',
      left: canvas.width / 2,
      top: canvas.height / 2
    })

    canvas.add(croppedImg)
    canvas.setActiveObject(croppedImg)
    canvas.renderAll()

    // Atualizar imagem original para referência futura
    originalImage = croppedImg

    showNotification('Imagem recortada com sucesso', 'success')
  })
}

// Rotacionar imagem em 90 graus
function rotateImage() {
  if (!canvas || canvas.getObjects().length === 0) return

  const img = canvas.getActiveObject()
  if (!img) return

  // Rotacionar 90 graus no sentido horário
  const currentAngle = img.angle || 0
  img.rotate(currentAngle + 90)

  canvas.renderAll()
  showNotification('Imagem rotacionada', 'info')
}

// Espelhar imagem horizontalmente
function flipImage() {
  if (!canvas || canvas.getObjects().length === 0) return

  const img = canvas.getActiveObject()
  if (!img) return

  // Espelhar horizontalmente
  img.set('flipX', !img.flipX)

  canvas.renderAll()
  showNotification('Imagem espelhada', 'info')
}

// Abrir modal para adicionar texto
function openTextModal() {
  const textModal = new bootstrap.Modal(
    document.getElementById('textToolModal')
  )
  textModal.show()
}

// Adicionar texto à imagem
function addTextToImage() {
  if (!canvas) return

  // Obter valores do formulário
  const textInput = document.getElementById('textInput')
  const fontSelect = document.getElementById('fontSelect')
  const fontSizeInput = document.getElementById('fontSizeInput')
  const textColorInput = document.getElementById('textColorInput')
  const textBackgroundInput = document.getElementById('textBackgroundInput')
  const textBackgroundTransparent = document.getElementById(
    'textBackgroundTransparent'
  )

  const text = textInput.value.trim()

  if (!text) {
    showNotification('Por favor, digite algum texto', 'warning')
    return
  }

  // Criar objeto de texto
  const textObj = new fabric.Text(text, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: fontSelect.value,
    fontSize: parseInt(fontSizeInput.value),
    fill: textColorInput.value,
    backgroundColor: textBackgroundTransparent.checked
      ? null
      : textBackgroundInput.value,
    padding: 5
  })

  // Adicionar ao canvas
  canvas.add(textObj)
  canvas.setActiveObject(textObj)
  canvas.renderAll()

  // Mover o foco para fora do modal antes de fechá-lo
  document.getElementById('textTool').focus()

  // Fechar modal
  const textModal = bootstrap.Modal.getInstance(
    document.getElementById('textToolModal')
  )
  textModal.hide()

  // Limpar campos
  textInput.value = ''

  showNotification('Texto adicionado à imagem', 'success')
}

// Salvar imagem editada
function saveEditedImage() {
  if (!canvas) return

  try {
    // Desativar qualquer objeto selecionado
    canvas.discardActiveObject()
    canvas.renderAll()

    // Converter canvas para arquivo
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1
    })

    // Criar link de download
    const link = document.createElement('a')
    link.download = 'imagem-editada.png'
    link.href = dataUrl

    // Simular clique para iniciar download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('Imagem salva com sucesso', 'success')
  } catch (error) {
    console.error('Erro ao salvar imagem:', error)
    showNotification('Erro ao salvar a imagem', 'error')
  }
}

// Exportar para o conversor
// Substitua a função exportToConverter atual por esta versão melhorada
function exportToConverter() {
  if (!canvas) return

  try {
    // Desativar qualquer objeto selecionado
    canvas.discardActiveObject()
    canvas.renderAll()

    // Converter canvas para arquivo
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1
    })

    // Converter Data URL para Blob
    const blob = dataURLtoBlob(dataUrl)
    const file = new File([blob], 'imagem-editada.png', { type: 'image/png' })

    // Armazenar no sessionStorage
    sessionStorage.setItem('editedImage', dataUrl)

    // Alternar para a aba do conversor
    const converterTab = document.querySelector('a[href="#converterTab"]')
    if (converterTab) {
      const tab = new bootstrap.Tab(converterTab)
      tab.show()

      // Disparar o evento editedImageAvailable
      setTimeout(() => {
        const event = new CustomEvent('editedImageAvailable')
        document.dispatchEvent(event)
        console.log('Evento editedImageAvailable disparado')
      }, 100)

      showNotification('Imagem exportada para o conversor', 'success')
    }
  } catch (error) {
    console.error('Erro ao exportar imagem:', error)
    showNotification('Erro ao exportar a imagem', 'error')
  }
}

// Converter Data URL para Blob
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const uInt8Array = new Uint8Array(raw.length)

  for (let i = 0; i < raw.length; i++) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}

// Mostrar notificação
function showNotification(message, type = 'info') {
  // Verificar se Toastify está disponível
  if (typeof Toastify === 'function') {
    const toastBg = {
      success: 'linear-gradient(to right, #28a745, #20c997)',
      error: 'linear-gradient(to right, #dc3545, #e74c3c)',
      warning: 'linear-gradient(to right, #ffc107, #fd7e14)',
      info: 'linear-gradient(to right, #4a6bff, #6d5dfc)'
    }

    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'bottom',
      position: 'right',
      style: {
        background: toastBg[type]
      }
    }).showToast()
  } else {
    // Fallback
    alert(message)
  }
}
