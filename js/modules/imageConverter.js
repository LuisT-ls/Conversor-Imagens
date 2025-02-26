/**
 * Módulo para gerenciar a conversão de imagens
 * Este módulo implementa funcionalidades para carregar, pré-visualizar e converter imagens
 */

import { showNotification } from '../app.js'

export function initImageConverter() {
  // Elementos da interface
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
  const formatOptions = document.getElementById('formatOptions')

  // Variáveis para armazenar dados da imagem
  let originalImage = null
  let originalFileName = ''
  let originalFileType = ''
  let originalFileSize = 0
  let convertedImage = null
  let originalWidth = 0
  let originalHeight = 0
  let aspectRatioValue = 0

  // Inicializar eventos
  initEvents()
  updateFormatOptions()

  /**
   * Inicializa os eventos de interface do usuário
   */
  function initEvents() {
    // Evento de clique na dropzone
    dropZone.addEventListener('click', () => {
      fileInput.click()
    })

    // Eventos de drag and drop
    dropZone.addEventListener('dragover', e => {
      e.preventDefault()
      dropZone.classList.add('drop-zone-active')
    })

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drop-zone-active')
    })

    dropZone.addEventListener('drop', e => {
      e.preventDefault()
      dropZone.classList.remove('drop-zone-active')

      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    })

    // Evento de seleção de arquivo
    fileInput.addEventListener('change', e => {
      if (e.target.files.length) {
        handleFileSelect(e.target.files[0])
      }
    })

    // Atualizar o valor da qualidade exibido
    qualityRange.addEventListener('input', () => {
      qualityValue.textContent = `${qualityRange.value}%`
    })

    // Gerenciar a proporção da imagem (aspect ratio)
    widthInput.addEventListener('input', () => {
      if (aspectRatio.checked && aspectRatioValue && widthInput.value) {
        const newWidth = parseInt(widthInput.value)
        const newHeight = Math.round(newWidth / aspectRatioValue)
        heightInput.value = newHeight
      }
    })

    heightInput.addEventListener('input', () => {
      if (aspectRatio.checked && aspectRatioValue && heightInput.value) {
        const newHeight = parseInt(heightInput.value)
        const newWidth = Math.round(newHeight * aspectRatioValue)
        widthInput.value = newWidth
      }
    })

    // Predefinições de tamanho
    resizeSelect.addEventListener('change', () => {
      const value = resizeSelect.value

      if (value === 'original') {
        widthInput.value = originalWidth
        heightInput.value = originalHeight
      } else {
        const dimensions = value.split('x')
        widthInput.value = dimensions[0]
        heightInput.value = dimensions[1]
      }
    })

    // Ação de conversão
    convertButton.addEventListener('click', convertImage)

    // Atualizar opções de formato quando o formato é alterado
    formatSelect.addEventListener('change', updateFormatOptions)
  }

  /**
   * Manipula a seleção de um arquivo de imagem
   * @param {File} file - O arquivo de imagem selecionado
   */
  function handleFileSelect(file) {
    // Verificar se o arquivo é uma imagem
    if (!file.type.match('image.*')) {
      showNotification(
        'Erro',
        'Por favor, selecione um arquivo de imagem válido.',
        'error'
      )
      return
    }

    // Armazenar informações do arquivo original
    originalFileName = file.name
    originalFileType = file.type
    originalFileSize = file.size

    // Atualizar visual da dropzone
    const previewThumb = document.getElementById('previewThumb')
    const dropZonePrompt = dropZone.querySelector('.drop-zone-prompt')

    // Criar um objeto URL para a imagem
    const reader = new FileReader()

    reader.onload = e => {
      // Mostrar thumbnail na dropzone
      previewThumb.style.backgroundImage = `url('${e.target.result}')`
      previewThumb.classList.remove('d-none')
      dropZonePrompt.classList.add('d-none')

      // Carregar a imagem para obter dimensões
      const img = new Image()
      img.onload = () => {
        originalWidth = img.width
        originalHeight = img.height
        aspectRatioValue = img.width / img.height

        // Definir campos de dimensão para os valores originais
        widthInput.placeholder = originalWidth
        heightInput.placeholder = originalHeight

        // Armazenar a imagem original
        originalImage = e.target.result

        // Habilitar o botão de conversão
        convertButton.disabled = false

        // Mostrar informações da imagem
        showNotification(
          'Imagem carregada',
          `${file.name} (${formatBytes(file.size)})`,
          'success'
        )
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  }

  /**
   * Atualiza as opções específicas para o formato de saída selecionado
   */
  function updateFormatOptions() {
    const format = formatSelect.value
    formatOptions.innerHTML = ''

    // Adicionar opções específicas para cada formato
    switch (format) {
      case 'webp':
        // Opção de lossless para WebP
        formatOptions.innerHTML = `
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="losslessWebp">
              <label class="form-check-label" for="losslessWebp">Compressão sem perdas (lossless)</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="alphaWebp" checked>
              <label class="form-check-label" for="alphaWebp">Preservar transparência</label>
            </div>
          </div>
        `
        break

      case 'jpeg':
        // Opções para JPEG
        formatOptions.innerHTML = `
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="progressiveJpeg">
              <label class="form-check-label" for="progressiveJpeg">JPEG progressivo</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="optimizeJpeg" checked>
              <label class="form-check-label" for="optimizeJpeg">Otimizar</label>
            </div>
          </div>
        `
        break

      case 'png':
        // Opções para PNG
        formatOptions.innerHTML = `
          <div class="col-md-12">
            <label class="form-label">Nível de compressão:</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" name="pngCompression" id="pngFast" value="fast" checked>
              <label class="btn btn-outline-primary" for="pngFast">Rápido</label>
              
              <input type="radio" class="btn-check" name="pngCompression" id="pngDefault" value="default">
              <label class="btn btn-outline-primary" for="pngDefault">Padrão</label>
              
              <input type="radio" class="btn-check" name="pngCompression" id="pngHighest" value="highest">
              <label class="btn btn-outline-primary" for="pngHighest">Máxima</label>
            </div>
          </div>
        `
        break

      case 'ico':
        // Opções para ICO
        formatOptions.innerHTML = `
          <div class="col-md-12">
            <label class="form-label">Tamanhos de ícone:</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="ico16" checked>
              <label class="form-check-label" for="ico16">16x16</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="ico32" checked>
              <label class="form-check-label" for="ico32">32x32</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="ico48">
              <label class="form-check-label" for="ico48">48x48</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="ico64">
              <label class="form-check-label" for="ico64">64x64</label>
            </div>
          </div>
        `
        break

      case 'svg':
        // Opções para SVG
        formatOptions.innerHTML = `
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="svgOptimize" checked>
              <label class="form-check-label" for="svgOptimize">Otimizar SVG</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="svgRemoveText">
              <label class="form-check-label" for="svgRemoveText">Remover textos</label>
            </div>
          </div>
        `
        break
    }

    // Adaptar a UI para o modo escuro, se necessário
    if (document.body.classList.contains('dark-mode')) {
      document.querySelectorAll('input, select').forEach(el => {
        el.classList.add('dark-input')
      })
    }
  }

  /**
   * Executa a conversão da imagem
   */
  function convertImage() {
    if (!originalImage) {
      showNotification(
        'Erro',
        'Nenhuma imagem carregada para conversão.',
        'error'
      )
      return
    }

    // Mostrar barra de progresso
    progressBar.classList.remove('d-none')
    progressBarInner.style.width = '0%'

    // Função para simular progresso (já que imageConversion não tem eventos de progresso)
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 5
      if (progress <= 90) {
        progressBarInner.style.width = `${progress}%`
      }
    }, 100)

    // Obter configurações
    const format = formatSelect.value
    const quality = parseInt(qualityRange.value) / 100

    // Obter dimensões para redimensionamento
    let targetWidth = widthInput.value
      ? parseInt(widthInput.value)
      : originalWidth
    let targetHeight = heightInput.value
      ? parseInt(heightInput.value)
      : originalHeight

    // Criar uma imagem para processar
    const img = new Image()
    img.onload = async () => {
      try {
        // Criar um canvas para manipular a imagem
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')

        // Desenhar a imagem no canvas com as novas dimensões
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // Obter opções específicas do formato
        const options = getFormatSpecificOptions(format)

        // Converter a imagem baseado no formato selecionado
        let blob
        let outputType = `image/${format}`

        if (format === 'webp') {
          const lossless =
            document.getElementById('losslessWebp')?.checked || false
          const alpha = document.getElementById('alphaWebp')?.checked || true
          blob = await imageConversion.canvastoFile(
            canvas,
            quality,
            outputType,
            originalFileName,
            lossless,
            alpha
          )
        } else if (format === 'jpeg') {
          outputType = 'image/jpeg'
          blob = await imageConversion.canvastoFile(
            canvas,
            quality,
            outputType,
            originalFileName
          )
        } else if (format === 'png') {
          outputType = 'image/png'
          blob = await imageConversion.canvastoFile(
            canvas,
            quality,
            outputType,
            originalFileName
          )
        } else if (format === 'ico') {
          // Para ICO, gerar os tamanhos selecionados
          outputType = 'image/png' // Usar PNG como intermediário

          // Criar uma Promise para lidar com toBlob assíncrono
          blob = await new Promise(resolve => {
            canvas.toBlob(
              blob => {
                resolve(blob)
              },
              outputType,
              quality
            )
          })

          // Aqui você poderia adicionar código extra para converter o PNG para ICO
          // Porém, isso geralmente requer uma biblioteca específica

          // Avisar o usuário que a conversão é parcial
          showNotification(
            'Aviso',
            'Conversão para ICO é limitada no navegador. O arquivo foi exportado como PNG.',
            'warning'
          )
        } else if (format === 'svg') {
          // Converter para SVG é mais complexo e requer bibliotecas específicas
          showNotification(
            'Aviso',
            'Conversão para SVG requer recursos adicionais.',
            'warning'
          )
          clearInterval(progressInterval)
          progressBar.classList.add('d-none')
          return
        }

        // Converter o blob para URL
        const convertedImageUrl = URL.createObjectURL(blob)
        convertedImage = convertedImageUrl

        // Atualizar a prévia
        updatePreview(img.src, convertedImageUrl, format, blob.size)

        // Configurar o link de download
        const fileExtension = format === 'jpeg' ? 'jpg' : format
        const newFileName =
          originalFileName.substring(0, originalFileName.lastIndexOf('.')) +
          '.' +
          fileExtension
        downloadLink.href = convertedImageUrl
        downloadLink.download = newFileName

        // Completar a barra de progresso
        progressBarInner.style.width = '100%'

        // Adicionar à lista de histórico
        saveToHistory(originalFileName, newFileName, format, blob.size)

        // Mostrar notificação de sucesso
        showNotification(
          'Sucesso',
          `Imagem convertida para ${format.toUpperCase()}.`,
          'success'
        )
      } catch (error) {
        console.error('Erro na conversão:', error)
        showNotification('Erro', 'Falha ao converter a imagem.', 'error')
      } finally {
        clearInterval(progressInterval)
        setTimeout(() => {
          progressBar.classList.add('d-none')
        }, 500)
      }
    }

    img.src = originalImage
  }

  /**
   * Obtém opções específicas para o formato selecionado
   * @param {string} format - O formato de saída
   * @returns {Object} - Opções específicas do formato
   */
  function getFormatSpecificOptions(format) {
    const options = {}

    switch (format) {
      case 'webp':
        options.lossless =
          document.getElementById('losslessWebp')?.checked || false
        options.alpha = document.getElementById('alphaWebp')?.checked || true
        break

      case 'jpeg':
        options.progressive =
          document.getElementById('progressiveJpeg')?.checked || false
        options.optimize =
          document.getElementById('optimizeJpeg')?.checked || true
        break

      case 'png':
        const compressionLevel =
          document.querySelector('input[name="pngCompression"]:checked')
            ?.value || 'default'
        options.compressionLevel = compressionLevel
        break

      case 'ico':
        options.sizes = []
        if (document.getElementById('ico16')?.checked) options.sizes.push(16)
        if (document.getElementById('ico32')?.checked) options.sizes.push(32)
        if (document.getElementById('ico48')?.checked) options.sizes.push(48)
        if (document.getElementById('ico64')?.checked) options.sizes.push(64)
        break

      case 'svg':
        options.optimize =
          document.getElementById('svgOptimize')?.checked || true
        options.removeText =
          document.getElementById('svgRemoveText')?.checked || false
        break
    }

    return options
  }

  /**
   * Atualiza a prévia da imagem original e convertida
   * @param {string} originalUrl - URL da imagem original
   * @param {string} convertedUrl - URL da imagem convertida
   * @param {string} format - Formato da imagem convertida
   * @param {number} convertedSize - Tamanho em bytes da imagem convertida
   */
  function updatePreview(originalUrl, convertedUrl, format, convertedSize) {
    // Mostrar container de prévia
    previewContainer.classList.remove('d-none')
    previewPlaceholder.classList.add('d-none')
    actionButtons.classList.remove('d-none')

    // Configurar imagem original
    originalPreview.innerHTML = `<img src="${originalUrl}" class="img-fluid" alt="Imagem Original">`
    originalInfo.textContent = `${originalFileName} (${formatBytes(
      originalFileSize
    )}) - ${originalWidth}x${originalHeight}px`

    // Configurar imagem convertida
    convertedPreview.innerHTML = `<img src="${convertedUrl}" class="img-fluid" alt="Imagem Convertida">`

    // Calcular redução de tamanho
    const reduction = (
      ((originalFileSize - convertedSize) / originalFileSize) *
      100
    ).toFixed(1)
    const reductionText =
      reduction > 0
        ? `Redução de ${reduction}%`
        : `Aumento de ${Math.abs(reduction)}%`

    // Obter dimensões atuais
    const newWidth = widthInput.value
      ? parseInt(widthInput.value)
      : originalWidth
    const newHeight = heightInput.value
      ? parseInt(heightInput.value)
      : originalHeight

    // Atualizar informações da imagem convertida
    const fileExtension = format === 'jpeg' ? 'jpg' : format
    const newFileName =
      originalFileName.substring(0, originalFileName.lastIndexOf('.')) +
      '.' +
      fileExtension
    convertedInfo.textContent = `${newFileName} (${formatBytes(
      convertedSize
    )}) - ${newWidth}x${newHeight}px - ${reductionText}`
  }

  /**
   * Salva a conversão atual no histórico
   * @param {string} originalName - Nome do arquivo original
   * @param {string} convertedName - Nome do arquivo convertido
   * @param {string} format - Formato da conversão
   * @param {number} size - Tamanho do arquivo convertido
   */
  function saveToHistory(originalName, convertedName, format, size) {
    // Obter histórico existente ou criar novo
    const history = JSON.parse(
      localStorage.getItem('conversionHistory') || '[]'
    )

    // Adicionar novo item ao histórico
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      originalName: originalName,
      convertedName: convertedName,
      format: format,
      size: size,
      url: convertedImage // URL para o blob (será perdido ao fechar o navegador)
    })

    // Limitar tamanho do histórico a 20 itens
    if (history.length > 20) {
      history.pop()
    }

    // Salvar o histórico atualizado
    localStorage.setItem('conversionHistory', JSON.stringify(history))

    // Disparar evento para notificar outros módulos
    const event = new CustomEvent('historyUpdated')
    document.dispatchEvent(event)
  }

  /**
   * Formata bytes para uma representação legível (KB, MB, etc)
   * @param {number} bytes - Número de bytes
   * @param {number} decimals - Número de casas decimais
   * @returns {string} - Representação formatada
   */
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}
