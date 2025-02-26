// app.js
import { initDarkMode } from './modules/darkMode.js'
import { initImageConverter } from './modules/imageConverter.js'
import { initImageEditor } from './modules/imageEditor.js'
import { initBatchConverter } from './modules/batchConverter.js'
import { initImageCompressor } from './modules/imageCompressor.js'
import { initHistoryManager } from './modules/historyManager.js'
import { initShareManager } from './modules/shareManager.js'

// Função para inicializar todas as funcionalidades
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos
  initDarkMode()
  initImageConverter()
  initImageEditor()
  initBatchConverter()
  initImageCompressor()
  initHistoryManager()
  initShareManager()

  // Inicializar tooltips e popovers do Bootstrap
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  )
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Criar notificação de boas-vindas
  showNotification(
    'Bem-vindo ao Conversor de Imagens Pro!',
    'Arraste uma imagem ou clique para começar.'
  )

  // Detectar e definir suporte para WebP
  checkWebPSupport()
})

// Função para mostrar notificações toast
function showNotification(title, message, type = 'info') {
  const bgColors = {
    success: 'linear-gradient(to right, #00b09b, #96c93d)',
    error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
    info: 'linear-gradient(to right, #2193b0, #6dd5ed)',
    warning: 'linear-gradient(to right, #f7b733, #fc4a1a)'
  }

  Toastify({
    text: `<b>${title}</b><br>${message}`,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    style: {
      background: bgColors[type]
    },
    className: 'info',
    escapeMarkup: false
  }).showToast()
}

// Função para verificar suporte a WebP
function checkWebPSupport() {
  const webpImg = new Image()
  webpImg.onload = function () {
    const hasWebP = webpImg.width > 0 && webpImg.height > 0
    localStorage.setItem('webpSupport', hasWebP)
    console.log('WebP Support:', hasWebP)
  }
  webpImg.onerror = function () {
    localStorage.setItem('webpSupport', false)
    console.log('WebP Support: false')
  }
  webpImg.src =
    'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
}

// Exportar funções utilitárias para serem usadas em outros módulos
export { showNotification }
