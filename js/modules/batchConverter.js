// modules/batchConverter.js
import { showNotification } from '../app.js'

export function initBatchConverter() {
  // Elementos da interface
  const batchFileInput = document.getElementById('batchFileInput')
  const batchFileList = document.getElementById('batchFileList')
  const batchPlaceholder = document.getElementById('batchPlaceholder')
  const batchFileListContainer = document.querySelector('.batch-file-list')
  const convertBatchButton = document.getElementById('convertBatchButton')
  const batchDownload = document.getElementById('batchDownload')
  const downloadAllButton = document.getElementById('downloadAllButton')
  const batchQualityRange = document.getElementById('batchQualityRange')
  const batchQualityValue = document.getElementById('batchQualityValue')
  const batchFormatSelect = document.getElementById('batchFormatSelect')
  const batchResizeSelect = document.getElementById('batchResizeSelect')

  // Arrays para armazenar arquivos e imagens processadas
  let batchFiles = []
  let processedImages = []

  // Inicializa os event listeners
  function initEventListeners() {
    // Listener para seleção de arquivos
    batchFileInput.addEventListener('change', handleFileSelection)

    // Listener para atualização do valor de qualidade
    batchQualityRange.addEventListener('input', () => {
      batchQualityValue.textContent = `${batchQualityRange.value}%`
    })

    // Listener para o botão de conversão em lote
    convertBatchButton.addEventListener('click', convertAllImages)

    // Listener para o botão de download de todas as imagens
    downloadAllButton.addEventListener('click', downloadAllImages)
  }

  // Manipula a seleção de arquivos
  function handleFileSelection(e) {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    // Limpa a lista anterior se houver
    if (batchFiles.length > 0) {
      batchFiles = []
      batchFileList.innerHTML = ''
      processedImages = []
      batchDownload.classList.add('d-none')
    }

    // Adiciona os arquivos à lista
    files.forEach(file => {
      // Verifica se é um tipo de imagem válido
      if (!file.type.match('image.*')) {
        showNotification(
          'Arquivo Inválido',
          `${file.name} não é uma imagem válida.`,
          'error'
        )
        return
      }

      // Adiciona ao array de arquivos
      batchFiles.push({
        file: file,
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pendente',
        processedImage: null
      })
    })

    // Atualiza a UI
    updateBatchFileList()

    // Mostra o botão de conversão se houver arquivos
    if (batchFiles.length > 0) {
      convertBatchButton.disabled = false
      batchPlaceholder.classList.add('d-none')
      batchFileListContainer.classList.remove('d-none')
    }
  }

  // Atualiza a lista de arquivos na interface
  function updateBatchFileList() {
    batchFileList.innerHTML = ''

    batchFiles.forEach(fileObj => {
      const file = fileObj.file
      const row = document.createElement('tr')
      row.id = fileObj.id

      // Formata o tamanho do arquivo
      const fileSize = formatFileSize(file.size)

      // Status da conversão
      let statusBadge = `<span class="badge bg-secondary">Pendente</span>`
      if (fileObj.status === 'processando') {
        statusBadge = `<span class="badge bg-primary">Processando</span>`
      } else if (fileObj.status === 'concluído') {
        statusBadge = `<span class="badge bg-success">Concluído</span>`
      } else if (fileObj.status === 'erro') {
        statusBadge = `<span class="badge bg-danger">Erro</span>`
      }

      // Botões de ação
      let actionButtons = `
        <button class="btn btn-sm btn-outline-danger remove-file" data-id="${fileObj.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      `

      if (fileObj.status === 'concluído') {
        actionButtons += `
          <button class="btn btn-sm btn-outline-primary ms-1 download-file" data-id="${fileObj.id}">
            <i class="fas fa-download"></i>
          </button>
        `
      }

      // Define o conteúdo da linha
      row.innerHTML = `
        <td class="align-middle">
          <div class="d-flex align-items-center">
            <div class="file-icon me-2">
              <i class="fas fa-file-image text-primary"></i>
            </div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-type text-muted small">${file.type}</div>
            </div>
          </div>
        </td>
        <td class="align-middle">${fileSize}</td>
        <td class="align-middle">${statusBadge}</td>
        <td class="align-middle">${actionButtons}</td>
      `

      batchFileList.appendChild(row)
    })

    // Adiciona event listeners para os botões de ação
    document.querySelectorAll('.remove-file').forEach(button => {
      button.addEventListener('click', removeFile)
    })

    document.querySelectorAll('.download-file').forEach(button => {
      button.addEventListener('click', downloadSingleFile)
    })
  }

  // Remove um arquivo da lista
  function removeFile(e) {
    const fileId = e.currentTarget.getAttribute('data-id')
    const fileIndex = batchFiles.findIndex(file => file.id === fileId)

    if (fileIndex !== -1) {
      batchFiles.splice(fileIndex, 1)
      updateBatchFileList()

      // Se não houver mais arquivos, resetar a interface
      if (batchFiles.length === 0) {
        batchPlaceholder.classList.remove('d-none')
        batchFileListContainer.classList.add('d-none')
        convertBatchButton.disabled = true
        batchDownload.classList.add('d-none')
      }

      // Se todas as imagens processadas foram removidas, esconde o botão de download
      const hasProcessedImages = batchFiles.some(
        file => file.status === 'concluído'
      )
      if (!hasProcessedImages) {
        batchDownload.classList.add('d-none')
      }
    }
  }

  // Converte todas as imagens selecionadas
  async function convertAllImages() {
    if (batchFiles.length === 0) return

    // Desabilita o botão durante a conversão
    convertBatchButton.disabled = true
    convertBatchButton.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Processando...'

    // Obtém as configurações selecionadas
    const outputFormat = batchFormatSelect.value
    const quality = parseInt(batchQualityRange.value) / 100
    const resizeOption = batchResizeSelect.value

    // Limpa imagens processadas anteriormente
    processedImages = []

    // Converte cada imagem
    for (let i = 0; i < batchFiles.length; i++) {
      const fileObj = batchFiles[i]
      fileObj.status = 'processando'
      updateBatchFileList()

      try {
        // Carrega a imagem
        const loadedImage = await loadImage(fileObj.file)

        // Converte a imagem
        const processedImage = await convertImage(
          loadedImage,
          outputFormat,
          quality,
          resizeOption
        )

        // Atualiza o status
        fileObj.status = 'concluído'
        fileObj.processedImage = processedImage
        processedImages.push(processedImage)

        updateBatchFileList()
      } catch (error) {
        console.error('Erro ao processar a imagem:', error)
        fileObj.status = 'erro'
        updateBatchFileList()
        showNotification(
          'Erro de Conversão',
          `Falha ao processar ${fileObj.file.name}`,
          'error'
        )
      }
    }

    // Restaura o botão
    convertBatchButton.disabled = false
    convertBatchButton.innerHTML =
      '<i class="fas fa-sync-alt me-2"></i>Converter Todos'

    // Mostra o botão de download se houver imagens processadas
    if (processedImages.length > 0) {
      batchDownload.classList.remove('d-none')
      showNotification(
        'Conversão Concluída',
        `${processedImages.length} imagens processadas com sucesso!`,
        'success'
      )
    }
  }

  // Carrega uma imagem a partir de um arquivo
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          element: img,
          filename: file.name,
          width: img.width,
          height: img.height
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Falha ao carregar a imagem'))
      }

      img.src = url
    })
  }

  // Converte uma imagem com as configurações especificadas
  function convertImage(loadedImage, format, quality, resizeOption) {
    return new Promise((resolve, reject) => {
      try {
        // Cria o canvas para desenhar a imagem
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Define as dimensões do canvas
        let width = loadedImage.width
        let height = loadedImage.height

        // Aplica o redimensionamento se necessário
        if (resizeOption !== 'original') {
          const [targetWidth, targetHeight] = resizeOption
            .split('x')
            .map(Number)
          const aspectRatio = width / height

          if (width > targetWidth || height > targetHeight) {
            if (aspectRatio > 1) {
              // Imagem é mais larga do que alta
              width = targetWidth
              height = Math.round(width / aspectRatio)
            } else {
              // Imagem é mais alta do que larga
              height = targetHeight
              width = Math.round(height * aspectRatio)
            }
          }
        }

        // Define as dimensões do canvas
        canvas.width = width
        canvas.height = height

        // Desenha a imagem no canvas
        ctx.drawImage(loadedImage.element, 0, 0, width, height)

        // Obtém o formato MIME
        let mimeType
        switch (format) {
          case 'jpeg':
            mimeType = 'image/jpeg'
            break
          case 'png':
            mimeType = 'image/png'
            break
          case 'webp':
            mimeType = 'image/webp'
            break
          default:
            mimeType = 'image/jpeg'
        }

        // Converte o canvas para o formato desejado
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Falha ao converter a imagem'))
              return
            }

            // Obtém o nome do arquivo original e altera a extensão
            const originalName = loadedImage.filename
            const baseName =
              originalName.substring(0, originalName.lastIndexOf('.')) ||
              originalName
            const newFilename = `${baseName}.${format}`

            // Cria URL para o blob
            const blobUrl = URL.createObjectURL(blob)

            resolve({
              blob: blob,
              url: blobUrl,
              name: newFilename,
              size: blob.size,
              originalWidth: loadedImage.width,
              originalHeight: loadedImage.height,
              newWidth: width,
              newHeight: height,
              format: format,
              mimeType: mimeType
            })
          },
          mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  // Download de um único arquivo
  function downloadSingleFile(e) {
    const fileId = e.currentTarget.getAttribute('data-id')
    const fileObj = batchFiles.find(file => file.id === fileId)

    if (fileObj && fileObj.processedImage) {
      const downloadLink = document.createElement('a')
      downloadLink.href = fileObj.processedImage.url
      downloadLink.download = fileObj.processedImage.name
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  // Download de todas as imagens em um arquivo ZIP
  async function downloadAllImages() {
    if (processedImages.length === 0) return

    try {
      // Altera o botão para indicar o progresso
      downloadAllButton.disabled = true
      downloadAllButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Criando ZIP...'

      // Cria um novo arquivo ZIP
      const zip = new JSZip()

      // Adiciona cada imagem processada ao ZIP
      for (const image of processedImages) {
        zip.file(image.name, image.blob)
      }

      // Gera o arquivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Cria um link de download para o arquivo ZIP
      const zipUrl = URL.createObjectURL(zipBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = zipUrl
      downloadLink.download = `imagens_convertidas_${new Date()
        .toISOString()
        .slice(0, 10)}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Limpa o URL do blob
      URL.revokeObjectURL(zipUrl)

      // Restaura o botão
      downloadAllButton.disabled = false
      downloadAllButton.innerHTML =
        '<i class="fas fa-download me-2"></i>Baixar Todas as Imagens (ZIP)'

      showNotification(
        'Download Concluído',
        'Arquivo ZIP criado com sucesso!',
        'success'
      )
    } catch (error) {
      console.error('Erro ao criar o arquivo ZIP:', error)
      downloadAllButton.disabled = false
      downloadAllButton.innerHTML =
        '<i class="fas fa-download me-2"></i>Baixar Todas as Imagens (ZIP)'
      showNotification(
        'Erro no Download',
        'Falha ao criar o arquivo ZIP',
        'error'
      )
    }
  }

  // Formata o tamanho do arquivo para exibição
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Inicializa o módulo
  initEventListeners()

  // Retorna métodos públicos, caso necessário para integração com outros módulos
  return {
    addFiles: files => {
      batchFileInput.files = files
      const event = new Event('change')
      batchFileInput.dispatchEvent(event)
    }
  }
}
