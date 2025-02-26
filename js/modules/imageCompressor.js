// Módulo para o compressor de imagens
export function initImageCompressor() {
  // Elementos do DOM
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

  // Variáveis para armazenar dados da imagem
  let originalImage = null
  let originalImageType = ''
  let originalSize = 0
  let currentFile = null

  // Event Listeners
  compressorFileInput.addEventListener('change', handleFileSelect)
  compressionLevel.addEventListener('input', updateCompressionLabel)
  keepFormat.addEventListener('change', toggleFormatOptions)
  compressButton.addEventListener('click', compressImage)
  targetSizeInput.addEventListener('input', validateTargetSize)

  // Função para lidar com a seleção de arquivo
  function handleFileSelect(e) {
    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image/')) {
      showError('Por favor, selecione um arquivo de imagem válido.')
      return
    }

    currentFile = file
    originalSize = file.size
    originalImageType = file.type

    // Mostrar configurações de compressão
    compressionSettings.classList.remove('d-none')
    compressButton.disabled = false

    // Exibir preview da imagem original
    const reader = new FileReader()
    reader.onload = function (event) {
      // Criar uma imagem para obter dimensões
      originalImage = new Image()
      originalImage.onload = function () {
        // Exibir informações da imagem original
        showOriginalImage(event.target.result, file)
      }
      originalImage.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // Função para atualizar o valor do nível de compressão
  function updateCompressionLabel() {
    compressionValue.textContent = `${compressionLevel.value}%`
  }

  // Função para alternar opções de formato
  function toggleFormatOptions() {
    if (keepFormat.checked) {
      compressionFormatOptions.classList.add('d-none')
    } else {
      compressionFormatOptions.classList.remove('d-none')
    }
  }

  // Função para validar o tamanho alvo
  function validateTargetSize() {
    if (
      targetSizeInput.value &&
      (isNaN(targetSizeInput.value) || targetSizeInput.value <= 0)
    ) {
      targetSizeInput.setCustomValidity(
        'Por favor, insira um valor positivo em KB'
      )
    } else {
      targetSizeInput.setCustomValidity('')
    }
    targetSizeInput.reportValidity()
  }

  // Função para exibir a imagem original
  function showOriginalImage(src, file) {
    // Criar elemento de imagem e adicionar ao container
    originalCompressImage.innerHTML = ''
    const img = document.createElement('img')
    img.src = src
    img.className = 'img-fluid'
    img.alt = 'Imagem Original'
    originalCompressImage.appendChild(img)

    // Atualizar informações da imagem original
    const sizeInKB = (file.size / 1024).toFixed(2)
    originalCompressInfo.textContent = `${file.name} (${originalImage.width}x${originalImage.height}, ${sizeInKB} KB)`
  }

  // Função principal para comprimir a imagem
  function compressImage() {
    if (!currentFile) return

    const quality = parseInt(compressionLevel.value) / 100
    const targetSize = targetSizeInput.value
      ? parseInt(targetSizeInput.value) * 1024
      : null
    const outputFormat = keepFormat.checked
      ? originalImageType.split('/')[1]
      : compressionFormat.value

    // Criar um canvas para a compressão
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Definir dimensões do canvas
    canvas.width = originalImage.width
    canvas.height = originalImage.height

    // Desenhar a imagem no canvas
    ctx.drawImage(originalImage, 0, 0)

    // Comprimir a imagem
    compressWithCanvas(canvas, outputFormat, quality, targetSize)
  }

  // Função para comprimir usando canvas
  function compressWithCanvas(canvas, format, quality, targetSize) {
    let mimeType
    let outputQuality = quality

    // Definir o tipo MIME com base no formato
    switch (format) {
      case 'jpeg':
      case 'jpg':
        mimeType = 'image/jpeg'
        break
      case 'png':
        mimeType = 'image/png'
        break
      case 'webp':
        mimeType = 'image/webp'
        break
      default:
        mimeType = originalImageType
    }

    // Se houver um tamanho alvo, fazer compressão adaptativa
    if (targetSize) {
      adaptiveCompression(canvas, mimeType, outputQuality, targetSize)
    } else {
      // Compressão simples baseada no nível selecionado
      const dataUrl = canvas.toDataURL(mimeType, outputQuality)
      displayCompressedImage(dataUrl, mimeType)
    }
  }

  // Função para compressão adaptativa (tenta atingir o tamanho alvo)
  function adaptiveCompression(canvas, mimeType, initialQuality, targetSize) {
    let minQuality = 0.1
    let maxQuality = 1.0
    let currentQuality = initialQuality
    let iterations = 0
    const MAX_ITERATIONS = 10

    // Função de compressão binária para encontrar a qualidade ideal
    function compressStep() {
      // Limitar o número de iterações para evitar loops infinitos
      if (iterations > MAX_ITERATIONS) {
        const finalDataUrl = canvas.toDataURL(mimeType, currentQuality)
        displayCompressedImage(finalDataUrl, mimeType)
        return
      }

      iterations++

      const dataUrl = canvas.toDataURL(mimeType, currentQuality)
      const size = dataURLtoBlob(dataUrl).size

      // Verificar se chegamos perto o suficiente do tamanho alvo
      const difference = Math.abs(size - targetSize)
      if (difference <= targetSize * 0.05) {
        // 5% de tolerância
        displayCompressedImage(dataUrl, mimeType)
        return
      }

      // Ajustar a qualidade com base no tamanho atual
      if (size > targetSize) {
        maxQuality = currentQuality
        currentQuality = (minQuality + currentQuality) / 2
      } else {
        minQuality = currentQuality
        currentQuality = (currentQuality + maxQuality) / 2
      }

      // Próxima iteração
      compressStep()
    }

    // Iniciar processo de compressão adaptativa
    compressStep()
  }

  // Converte DataURL para Blob
  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,')
    const contentType = parts[0].split(':')[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }

    return new Blob([uInt8Array], { type: contentType })
  }

  // Função para exibir a imagem comprimida
  function displayCompressedImage(dataUrl, mimeType) {
    // Converter DataURL para Blob para obter o tamanho
    const blob = dataURLtoBlob(dataUrl)
    const compressedSize = blob.size

    // Criar uma imagem para exibir
    const img = document.createElement('img')
    img.className = 'img-fluid'
    img.alt = 'Imagem Comprimida'
    img.onload = function () {
      // Exibir resultados
      compressionResults.classList.remove('d-none')

      // Atualizar informações da imagem comprimida
      const reducedSize = (compressedSize / 1024).toFixed(2)
      const reductionPercent = (
        (1 - compressedSize / originalSize) *
        100
      ).toFixed(2)
      compressedInfo.textContent = `${img.width}x${img.height}, ${reducedSize} KB (redução de ${reductionPercent}%)`

      // Configurar link de download
      const fileExtension = mimeType.split('/')[1]
      const filename = `compressed_${Date.now()}.${fileExtension}`
      downloadCompressedLink.href = dataUrl
      downloadCompressedLink.download = filename

      // Notificar o usuário
      if (window.showNotification) {
        window.showNotification(
          'Compressão Concluída',
          `Tamanho reduzido em ${reductionPercent}%`,
          'success'
        )
      }
    }

    // Definir a imagem e inserir na página
    img.src = dataUrl
    compressedImage.innerHTML = ''
    compressedImage.appendChild(img)
  }

  // Função para mostrar erros
  function showError(message) {
    if (window.showNotification) {
      window.showNotification('Erro', message, 'error')
    } else {
      alert(message)
    }
  }
}
