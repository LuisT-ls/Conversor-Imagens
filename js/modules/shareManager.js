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

    // Create a temporary URL for the image (normally this would be uploaded to a server)
    // For this example, we'll use a data URL, but in a real application,
    // you would upload the image to a server and get a shareable URL
    const tempUrl = URL.createObjectURL(imageData.data)

    // Set the link in the modal
    shareLink.value = tempUrl

    // Show the modal
    const shareModalInstance = new bootstrap.Modal(shareModal)
    shareModalInstance.show()

    // Clean up the URL when the modal is hidden
    shareModal.addEventListener(
      'hidden.bs.modal',
      () => {
        URL.revokeObjectURL(tempUrl)
      },
      { once: true }
    )
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

  // Check if the Web Share API is available
  function isWebShareSupported() {
    return navigator.share !== undefined
  }

  // Share using the Web Share API
  function shareWithWebShareAPI(url, title) {
    navigator
      .share({
        title: title || 'Imagem Convertida',
        url: url
      })
      .then(() => {
        showNotification('Compartilhamento concluído com sucesso!', 'success')
      })
      .catch(error => {
        // Check if the user canceled the share
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          showNotification('Erro ao compartilhar.', 'error')
        }
      })
  }
}
