// shareManager.js - Handle image sharing functionality
import { showNotification } from '../app.js'
import { getConvertedImageData } from './imageConverter.js'

export function initShareManager() {
  console.log('Initializing share manager functionality...')

  // DOM elements
  const shareButton = document.getElementById('shareButton')
  const shareModal = document.getElementById('shareModal')
  const shareLink = document.getElementById('shareLink')
  const copyLinkBtn = document.getElementById('copyLinkBtn')
  const shareBtns = document.querySelectorAll('.share-btn')

  // Initialize event listeners
  shareButton.addEventListener('click', openShareModal)
  copyLinkBtn.addEventListener('click', copyLinkToClipboard)

  // Initialize share buttons
  shareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform
      shareToSocialMedia(platform)
    })
  })

  // Open the share modal
  function openShareModal() {
    // Get the converted image data
    const imageData = getConvertedImageData()

    if (!imageData || !imageData.data) {
      showNotification('Nenhuma imagem convertida para compartilhar.', 'error')
      return
    }

    // Em vez de usar URL.createObjectURL(), que cria URLs temporárias locais,
    // vamos converter a imagem para um Data URL (Base64) que pode ser compartilhado
    const reader = new FileReader()

    reader.onload = function (event) {
      // O resultado é um Data URL que contém os dados da imagem codificados em Base64
      const dataUrl = event.target.result

      // Se o Data URL for muito grande, considere usar um serviço de hospedagem
      if (dataUrl.length > 2000000) {
        // ~2MB em Base64
        showNotification(
          'Imagem muito grande para compartilhar diretamente. Considere comprimi-la primeiro.',
          'warning'
        )
      }

      // Set the link in the modal
      shareLink.value = dataUrl

      // Show the modal
      const shareModalInstance = new bootstrap.Modal(shareModal)
      shareModalInstance.show()
    }

    reader.onerror = function () {
      showNotification(
        'Erro ao preparar a imagem para compartilhamento.',
        'error'
      )
    }

    // Converter o Blob para Data URL
    reader.readAsDataURL(imageData.data)
  }

  // Copy link to clipboard
  function copyLinkToClipboard() {
    // Select the text
    shareLink.select()
    shareLink.setSelectionRange(0, 99999) // For mobile devices

    // Copy to clipboard
    try {
      // Modern approach
      navigator.clipboard
        .writeText(shareLink.value)
        .then(() => {
          showNotification(
            'Link copiado para a área de transferência!',
            'success'
          )
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err)
          // Fallback to document.execCommand
          fallbackCopy()
        })
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      // Fallback to document.execCommand
      fallbackCopy()
    }

    // Fallback copy method
    function fallbackCopy() {
      const successful = document.execCommand('copy')

      if (successful) {
        showNotification(
          'Link copiado para a área de transferência!',
          'success'
        )
      } else {
        showNotification(
          'Falha ao copiar o link. Por favor, copie manualmente.',
          'error'
        )
      }
    }
  }

  // Share to social media
  function shareToSocialMedia(platform) {
    // Get the link
    const link = encodeURIComponent(shareLink.value)
    const text = encodeURIComponent('Confira esta imagem que eu converti!')

    // Create the share URL based on the platform
    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        // Para Facebook, o ideal seria usar um serviço de hospedagem de imagens
        // pois o Facebook não suporta bem Data URLs diretamente
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}`
        break

      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${link}`
        break

      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${link}`
        break

      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${link}&description=${text}`
        break

      default:
        showNotification(
          'Plataforma de compartilhamento não suportada.',
          'error'
        )
        return
    }

    // Open the share URL in a new window
    window.open(shareUrl, '_blank', 'width=600,height=500')
  }

  // Implementação adicional: usar a Web Share API quando disponível
  // Esta é uma abordagem moderna que funciona bem em dispositivos móveis
  function useWebShareAPI(title, url, file) {
    if (navigator.share) {
      const shareData = {
        title: title || 'Imagem Convertida',
        text: 'Confira esta imagem que eu converti!'
      }

      // Adicionar URL ou arquivo conforme disponível
      if (url) shareData.url = url
      if (file) shareData.files = [file]

      navigator
        .share(shareData)
        .then(() => {
          showNotification('Compartilhado com sucesso!', 'success')
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Erro ao compartilhar:', error)
            showNotification('Erro ao compartilhar.', 'error')
          }
        })
    } else {
      showNotification(
        'Web Share API não suportada neste navegador.',
        'warning'
      )
      return false
    }
    return true
  }

  // Adicionar botão para compartilhamento nativo
  const nativeShareBtn = document.createElement('button')
  nativeShareBtn.className = 'btn btn-primary mb-3 w-100'
  nativeShareBtn.innerHTML =
    '<i class="fas fa-share-alt me-2"></i>Compartilhar usando ferramentas nativas'
  nativeShareBtn.style.display = navigator.share ? 'block' : 'none'

  // Inserir após o modal body
  const modalBody = shareModal.querySelector('.modal-body')
  if (modalBody) {
    modalBody.appendChild(nativeShareBtn)

    nativeShareBtn.addEventListener('click', async () => {
      const imageData = getConvertedImageData()

      if (!imageData || !imageData.data) {
        showNotification('Nenhuma imagem para compartilhar.', 'error')
        return
      }

      // Criar um arquivo para compartilhar
      const fileName = 'imagem_convertida.' + imageData.type.split('/')[1]
      const file = new File([imageData.data], fileName, {
        type: imageData.type
      })

      // Tentar compartilhar com a Web Share API
      const shared = useWebShareAPI('Imagem Convertida', null, file)

      // Fechar o modal se compartilhado com sucesso
      if (shared) {
        const modalInstance = bootstrap.Modal.getInstance(shareModal)
        if (modalInstance) modalInstance.hide()
      }
    })
  }
}
