// modules/imageEditor.js

let canvas, image
let originalImageData
let originalDimensions = { width: 0, height: 0 }
let currentFilter = 'normal'
let adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0
}

export function initImageEditor() {
  // Elementos DOM
  const fileInput = document.getElementById('editorFileInput')
  const editorArea = document.querySelector('.editor-area')
  const editorActions = document.querySelector('.editor-actions')
  const saveButton = document.getElementById('saveEdits')
  const exportButton = document.getElementById('exportEdits')
  const resetButton = document.getElementById('resetEditor')

  // Sliders de ajuste
  const brightnessSlider = document.getElementById('brightnessRange')
  const contrastSlider = document.getElementById('contrastRange')
  const saturationSlider = document.getElementById('saturationRange')

  // Botões de ferramentas
  const cropTool = document.getElementById('cropTool')
  const rotateTool = document.getElementById('rotateTool')
  const flipTool = document.getElementById('flipTool')
  const textTool = document.getElementById('textTool')

  // Botões de filtro
  const filterButtons = document.querySelectorAll('.filter-btn')

  // Inicializar o canvas do Fabric.js
  canvas = new fabric.Canvas('editorCanvas', {
    width: 800,
    height: 600,
    backgroundColor: '#f0f0f0',
    preserveObjectStacking: true
  })

  // Event Listeners
  fileInput.addEventListener('change', handleImageUpload)

  // Sliders de ajuste
  brightnessSlider.addEventListener('input', () => {
    adjustments.brightness = parseInt(brightnessSlider.value)
    applyAdjustments()
  })

  contrastSlider.addEventListener('input', () => {
    adjustments.contrast = parseInt(contrastSlider.value)
    applyAdjustments()
  })

  saturationSlider.addEventListener('input', () => {
    adjustments.saturation = parseInt(saturationSlider.value)
    applyAdjustments()
  })

  // Botões de ferramentas
  cropTool.addEventListener('click', activateCropTool)
  rotateTool.addEventListener('click', rotateImage)
  flipTool.addEventListener('click', flipImage)
  textTool.addEventListener('click', addText)

  // Botões de filtros
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter')
      applyFilter()

      // Atualizar UI - destacar botão selecionado
      filterButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  // Botão de redefinir
  resetButton.addEventListener('click', resetEdits)

  // Botões de salvar e exportar
  saveButton.addEventListener('click', saveImage)
  exportButton.addEventListener('click', exportToConverter)

  // Ajustar canvas quando a janela for redimensionada
  window.addEventListener('resize', resizeCanvas)
}

// Função para redimensionar o canvas
function resizeCanvas() {
  const container = document.querySelector('.canvas-container')
  if (!container) return

  const containerWidth = container.clientWidth

  // Ajustar o tamanho do canvas mantendo a proporção
  canvas.setWidth(containerWidth)
  canvas.setHeight(containerWidth * 0.75) // proporção 4:3

  // Reposicionar a imagem se existir
  if (image) {
    centerImage()
  }

  canvas.renderAll()
}

// Função para lidar com o upload da imagem
function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  // Verificar se é uma imagem
  if (!file.type.match('image.*')) {
    // Importar showNotification do app.js
    import('../app.js').then(module => {
      module.showNotification(
        'Erro',
        'Por favor, selecione um arquivo de imagem válido.',
        'error'
      )
    })
    return
  }

  const reader = new FileReader()

  reader.onload = function (event) {
    const imgObj = new Image()
    imgObj.src = event.target.result

    imgObj.onload = function () {
      // Armazenar as dimensões originais
      originalDimensions = {
        width: imgObj.width,
        height: imgObj.height
      }

      // Remover imagem atual, se existir
      if (image) {
        canvas.remove(image)
      }

      // Criar nova imagem Fabric
      fabric.Image.fromURL(imgObj.src, function (img) {
        // Armazenar a imagem original antes de qualquer transformação
        originalImageData = img.toObject()

        // Redimensionar imagem para caber no canvas
        const scale =
          Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9

        img.scale(scale)

        // Centralizar imagem no canvas
        img.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center'
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        image = img
        canvas.renderAll()

        // Mostrar área de edição e botões
        document.querySelector('.editor-area').classList.remove('d-none')
        document.querySelector('.editor-actions').classList.remove('d-none')

        // Redefinir os controles
        resetControls()
      })
    }
  }

  reader.readAsDataURL(file)
}

// Função para centralizar a imagem no canvas
function centerImage() {
  if (!image) return

  image.set({
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center'
  })
}

// Função para aplicar os ajustes à imagem
function applyAdjustments() {
  if (!image) return

  // Armazenar todas as propriedades atuais da imagem antes de modificá-la
  const currentProps = {
    left: image.left,
    top: image.top,
    width: image.width,
    height: image.height,
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    angle: image.angle,
    flipX: image.flipX,
    flipY: image.flipY,
    originX: image.originX,
    originY: image.originY
  }

  // Clonar a imagem original
  fabric.Image.fromObject(originalImageData, function (img) {
    // Aplicar os ajustes
    img.filters = []

    // Brilho
    if (adjustments.brightness !== 0) {
      img.filters.push(
        new fabric.Image.filters.Brightness({
          brightness: adjustments.brightness / 100
        })
      )
    }

    // Contraste
    if (adjustments.contrast !== 0) {
      img.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: adjustments.contrast / 100
        })
      )
    }

    // Saturação
    if (adjustments.saturation !== 0) {
      img.filters.push(
        new fabric.Image.filters.Saturation({
          saturation: adjustments.saturation / 100
        })
      )
    }

    // Aplicar o filtro atual
    applyCurrentFilter(img)

    // Aplicar todos os filtros
    img.applyFilters()

    // Substituir a imagem mantendo TODAS as propriedades exatas
    canvas.remove(image)

    // Definir as dimensões e propriedades exatas
    img.set(currentProps)

    // Garantir que as dimensões sejam as mesmas
    img.width = currentProps.width
    img.height = currentProps.height

    canvas.add(img)
    canvas.setActiveObject(img)
    image = img
    canvas.renderAll()
  })
}

// Função para aplicar o filtro selecionado
function applyFilter() {
  if (!image) return
  applyAdjustments()
}

// Aplicar o filtro atual à imagem
function applyCurrentFilter(img) {
  switch (currentFilter) {
    case 'grayscale':
      img.filters.push(new fabric.Image.filters.Grayscale())
      break
    case 'sepia':
      img.filters.push(new fabric.Image.filters.Sepia())
      break
    case 'vintage':
      // Vintage é uma combinação de efeitos
      img.filters.push(new fabric.Image.filters.Sepia())
      img.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: 0.15
        })
      )
      // Verificar se o filtro Noise existe (depende da versão do Fabric.js)
      if (fabric.Image.filters.Noise) {
        img.filters.push(
          new fabric.Image.filters.Noise({
            noise: 10
          })
        )
      }
      break
    // Caso 'normal' não precisa de filtro
  }
}

// Ferramenta de corte
function activateCropTool() {
  if (!image) return

  // Desabilitar todas as outras ferramentas
  deactivateAllTools()

  // Criar retângulo para corte
  const cropRect = new fabric.Rect({
    left: image.left - image.getScaledWidth() / 4,
    top: image.top - image.getScaledHeight() / 4,
    width: image.getScaledWidth() / 2,
    height: image.getScaledHeight() / 2,
    fill: 'rgba(0, 109, 253, 0.1)',
    stroke: '#0d6efd',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    cornerColor: '#0d6efd',
    transparentCorners: false
  })

  canvas.add(cropRect)
  canvas.setActiveObject(cropRect)

  // Criar overlay para escurecer a área fora do retângulo de corte
  const overlay = document.createElement('div')
  overlay.className = 'crop-overlay'
  overlay.style.position = 'absolute'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.right = '0'
  overlay.style.bottom = '0'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '999'
  overlay.style.pointerEvents = 'none'
  document.querySelector('.canvas-container').appendChild(overlay)

  // Adicionar mensagem de instrução
  const instructionMsg = document.createElement('div')
  instructionMsg.className = 'crop-instruction'
  instructionMsg.style.position = 'absolute'
  instructionMsg.style.top = '10px'
  instructionMsg.style.left = '50%'
  instructionMsg.style.transform = 'translateX(-50%)'
  instructionMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
  instructionMsg.style.color = 'white'
  instructionMsg.style.padding = '8px 15px'
  instructionMsg.style.borderRadius = '5px'
  instructionMsg.style.zIndex = '1001'
  instructionMsg.textContent = 'Ajuste a área de recorte e confirme abaixo'
  document.querySelector('.canvas-container').appendChild(instructionMsg)

  // Adicionar botões para confirmar ou cancelar o corte
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'crop-buttons'
  buttonContainer.style.position = 'fixed'
  buttonContainer.style.bottom = '20px'
  buttonContainer.style.left = '50%'
  buttonContainer.style.transform = 'translateX(-50%)'
  buttonContainer.style.zIndex = '1000'
  buttonContainer.style.display = 'flex'
  buttonContainer.style.gap = '10px'

  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'btn btn-success'
  confirmBtn.innerHTML = '<i class="fas fa-check me-2"></i>Confirmar Recorte'

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn btn-danger'
  cancelBtn.innerHTML = '<i class="fas fa-times me-2"></i>Cancelar'

  buttonContainer.appendChild(confirmBtn)
  buttonContainer.appendChild(cancelBtn)
  document.body.appendChild(buttonContainer)

  // Função para remover todas as adições da ferramenta de recorte
  const cleanupCropTool = () => {
    canvas.remove(cropRect)
    document.body.removeChild(buttonContainer)
    document.querySelector('.canvas-container').removeChild(overlay)
    document.querySelector('.canvas-container').removeChild(instructionMsg)
  }

  confirmBtn.addEventListener('click', () => {
    // Aplicar corte
    cropImage(cropRect)
    cleanupCropTool()
  })

  cancelBtn.addEventListener('click', () => {
    cleanupCropTool()
  })

  // Ajustar o overlay conforme o retângulo é movido/redimensionado
  canvas.on('object:moving', updateOverlay)
  canvas.on('object:scaling', updateOverlay)

  function updateOverlay() {
    // Aqui você poderia atualizar visualmente o overlay
    // Por exemplo, adicionando uma máscara para escurecer tudo exceto a área de recorte
    // Isso requer implementação adicional com manipulação de canvas
  }
}

// Função para cortar a imagem
function cropImage(cropRect) {
  if (!image) return

  // Calcular coordenadas para corte
  const imgEl = image.getElement()

  // Guardar transformações atuais
  const currentAngle = image.angle || 0
  const currentFlipX = image.flipX || false
  const currentFlipY = image.flipY || false
  const currentScaleX = image.scaleX || 1
  const currentScaleY = image.scaleY || 1

  // Resetar temporariamente as transformações para cortar corretamente
  image.set({
    angle: 0,
    flipX: false,
    flipY: false
  })
  canvas.renderAll()

  // Obter posição e dimensões precisas
  const imgLeft = image.left - (image.width * currentScaleX) / 2
  const imgTop = image.top - (image.height * currentScaleY) / 2

  // Calcular coordenadas do recorte em relação à imagem original
  const cropLeft = (cropRect.left - imgLeft) / currentScaleX
  const cropTop = (cropRect.top - imgTop) / currentScaleY
  const cropWidth = cropRect.width / currentScaleX
  const cropHeight = cropRect.height / currentScaleY

  // Criar canvas temporário para corte
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = cropWidth
  tempCanvas.height = cropHeight
  const ctx = tempCanvas.getContext('2d')

  // Cortar a imagem
  ctx.drawImage(
    imgEl,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  )

  // Criar nova imagem a partir do corte
  fabric.Image.fromURL(tempCanvas.toDataURL(), function (newImg) {
    // Atualizar as dimensões originais
    originalDimensions = {
      width: cropWidth,
      height: cropHeight
    }

    // Remover imagem antiga
    canvas.remove(image)

    // Armazenar a nova imagem como original para futuros ajustes
    originalImageData = newImg.toObject()

    // Aplicar escala para caber no canvas
    const scale =
      Math.min(canvas.width / newImg.width, canvas.height / newImg.height) * 0.9

    newImg.set({
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
      angle: currentAngle, // Restaurar o ângulo original
      flipX: currentFlipX, // Restaurar o espelhamento original
      flipY: currentFlipY // Restaurar o espelhamento original
    })

    canvas.add(newImg)
    canvas.setActiveObject(newImg)
    image = newImg

    // Mostrar notificação de sucesso
    import('../app.js').then(module => {
      module.showNotification(
        'Sucesso',
        'Imagem recortada com sucesso!',
        'success'
      )
    })

    // Resetar ajustes
    resetControls()

    canvas.renderAll()
  })
}

// Função para girar a imagem
function rotateImage() {
  if (!image) return

  // Girar 90 graus no sentido horário
  image.rotate((image.angle || 0) + 90)
  canvas.renderAll()
}

// Função para espelhar a imagem
function flipImage() {
  if (!image) return

  // Alternar espelhamento horizontal
  image.set('flipX', !image.flipX)
  canvas.renderAll()
}

// Função para adicionar texto
function addText() {
  if (!canvas) return

  const text = new fabric.IText('Digite seu texto', {
    left: canvas.width / 2,
    top: canvas.height / 2,
    fill: '#000000',
    fontFamily: 'Arial',
    fontSize: 30,
    originX: 'center',
    originY: 'center'
  })

  canvas.add(text)
  canvas.setActiveObject(text)
  text.enterEditing()
  canvas.renderAll()
}

// Função para resetar as edições
function resetEdits() {
  if (!image || !originalImageData) return

  // Restaurar a imagem original
  fabric.Image.fromObject(originalImageData, function (img) {
    canvas.remove(image)

    // Redimensionar imagem para caber no canvas
    const scale =
      Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9

    img.set({
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale
    })

    canvas.add(img)
    canvas.setActiveObject(img)
    image = img

    // Resetar controles
    resetControls()

    canvas.renderAll()
  })
}

// Função para resetar os controles
function resetControls() {
  // Resetar sliders
  document.getElementById('brightnessRange').value = 0
  document.getElementById('contrastRange').value = 0
  document.getElementById('saturationRange').value = 0

  // Resetar filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active')
    if (btn.getAttribute('data-filter') === 'normal') {
      btn.classList.add('active')
    }
  })

  // Resetar variáveis de estado
  adjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0
  }
  currentFilter = 'normal'
}

// Função para desativar todas as ferramentas
function deactivateAllTools() {
  // Remover todos os objetos que não sejam a imagem
  const objects = canvas.getObjects()
  for (let i = objects.length - 1; i >= 0; i--) {
    if (objects[i] !== image) {
      canvas.remove(objects[i])
    }
  }

  // Remover quaisquer botões de confirmação
  const confirmBtns = document.querySelectorAll('button.position-fixed')
  confirmBtns.forEach(btn => document.body.removeChild(btn))
}

// Função para salvar a imagem
function saveImage() {
  if (!canvas || !image) return

  // Criar canvas temporário com as dimensões exatas da imagem
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')

  // Determinar dimensões finais (considerando rotação)
  let finalWidth, finalHeight
  const angle = (image.angle || 0) % 180

  if (angle === 90 || angle === -90) {
    // Se rotacionado 90 graus, trocar largura e altura
    finalWidth = image.getScaledHeight()
    finalHeight = image.getScaledWidth()
  } else {
    finalWidth = image.getScaledWidth()
    finalHeight = image.getScaledHeight()
  }

  tempCanvas.width = finalWidth
  tempCanvas.height = finalHeight

  // Definir cor de fundo (opcional)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, finalWidth, finalHeight)

  // Criar um canvas temporário de Fabric para renderizar apenas a imagem
  const tempFabricCanvas = new fabric.StaticCanvas()
  tempFabricCanvas.setWidth(finalWidth)
  tempFabricCanvas.setHeight(finalHeight)

  // Clonar a imagem atual e ajustar para o novo canvas
  const clonedImage = fabric.util.object.clone(image)
  clonedImage.set({
    left: finalWidth / 2,
    top: finalHeight / 2,
    originX: 'center',
    originY: 'center'
  })

  tempFabricCanvas.add(clonedImage)
  tempFabricCanvas.renderAll()

  // Obter a URL de dados do canvas
  const dataURL = tempFabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    width: finalWidth,
    height: finalHeight
  })

  // Criar link para download
  const link = document.createElement('a')
  link.href = dataURL
  link.download = 'imagem_editada.png'
  link.click()

  // Mostrar notificação
  import('../app.js').then(module => {
    module.showNotification('Sucesso', 'Imagem salva com sucesso!', 'success')
  })
}

// Função para exportar para o conversor
function exportToConverter() {
  if (!canvas || !image) return

  // Criar canvas temporário com as dimensões exatas da imagem
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')

  // Determinar dimensões finais (considerando rotação)
  let finalWidth, finalHeight
  const angle = (image.angle || 0) % 180

  if (angle === 90 || angle === -90) {
    // Se rotacionado 90 graus, trocar largura e altura
    finalWidth = image.getScaledHeight()
    finalHeight = image.getScaledWidth()
  } else {
    finalWidth = image.getScaledWidth()
    finalHeight = image.getScaledHeight()
  }

  tempCanvas.width = finalWidth
  tempCanvas.height = finalHeight

  // Definir cor de fundo (opcional)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, finalWidth, finalHeight)

  // Criar um canvas temporário de Fabric para renderizar apenas a imagem
  const tempFabricCanvas = new fabric.StaticCanvas()
  tempFabricCanvas.setWidth(finalWidth)
  tempFabricCanvas.setHeight(finalHeight)

  // Clonar a imagem atual e ajustar para o novo canvas
  const clonedImage = fabric.util.object.clone(image)
  clonedImage.set({
    left: finalWidth / 2,
    top: finalHeight / 2,
    originX: 'center',
    originY: 'center'
  })

  tempFabricCanvas.add(clonedImage)
  tempFabricCanvas.renderAll()

  // Obter a URL de dados do canvas
  const dataURL = tempFabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    width: finalWidth,
    height: finalHeight
  })

  // Transferir para o conversor
  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      // Criar um objeto de arquivo
      const file = new File([blob], 'imagem_editada.png', { type: 'image/png' })

      // Criar um evento de transferência de arquivos
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      // Definir o arquivo para o input de arquivo do conversor
      const converterInput = document.querySelector(
        '#converterTab input[type="file"]'
      )
      if (converterInput) {
        converterInput.files = dataTransfer.files
        converterInput.dispatchEvent(new Event('change', { bubbles: true }))

        // Mudar para a aba do conversor
        const converterTabEl = document.querySelector(
          'button[data-bs-target="#converterTab"]'
        )
        if (converterTabEl) {
          const tab = new bootstrap.Tab(converterTabEl)
          tab.show()

          // Mostrar notificação
          import('../app.js').then(module => {
            module.showNotification(
              'Exportado',
              'Imagem exportada para o conversor!',
              'info'
            )
          })
        }
      }
    })
    .catch(error => {
      console.error('Erro ao exportar imagem:', error)
      import('../app.js').then(module => {
        module.showNotification(
          'Erro',
          'Não foi possível exportar a imagem.',
          'error'
        )
      })
    })
}
