/**
 * Dark Mode Manager
 * Gerencia a alternância entre tema claro e escuro
 */

export function initDarkMode() {
  const themeToggleBtn = document.getElementById('themeToggle')

  // Verificar se há uma preferência salva no localStorage
  const savedTheme = localStorage.getItem('theme')

  // Verificar preferência do sistema se não houver tema salvo
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  // Definir tema inicial
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    document.documentElement.setAttribute('data-theme', 'dark')
    showToast('Modo escuro ativado', 'info')
  }

  // Adicionar event listener para o botão de toggle
  themeToggleBtn.addEventListener('click', toggleTheme)

  // Adicionar listener para mudanças na preferência do sistema
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      const newTheme = e.matches ? 'dark' : 'light'
      // Apenas mudar automaticamente se o usuário não tiver definido uma preferência manualmente
      if (!localStorage.getItem('theme')) {
        setTheme(newTheme)
        showToast(
          `Modo ${
            newTheme === 'dark' ? 'escuro' : 'claro'
          } aplicado conforme preferência do sistema`,
          'info'
        )
      }
    })

  // Adicionar estilos para animação de ripple
  addRippleStyle()
}

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  setTheme(newTheme)
  animateThemeSwitch()

  // Mostrar notificação
  showToast(
    `Modo ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`,
    'success'
  )
}

// Função para definir o tema
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)

  // Atualizar metadados para browsers móveis que mudam a cor da barra de status
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#212529' : '#ffffff'
    )
  }
}

// Animação para a troca de tema
function animateThemeSwitch() {
  const themeBtn = document.getElementById('themeToggle')

  // Adicionar classe para animação
  themeBtn.classList.add('theme-switching')

  // Remover depois da transição
  setTimeout(() => {
    themeBtn.classList.remove('theme-switching')
  }, 500)

  // Criar efeito de ripple
  createRippleEffect(themeBtn)
}

// Criar efeito de ondulação ao clicar
function createRippleEffect(button) {
  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)

  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.position = 'absolute'
  circle.style.top = '50%'
  circle.style.left = '50%'
  circle.style.transform = 'translate(-50%, -50%)'
  circle.style.borderRadius = '50%'
  circle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
  circle.style.animation = 'ripple 0.6s linear'
  circle.style.pointerEvents = 'none'

  button.appendChild(circle)

  // Remover após a animação
  setTimeout(() => {
    circle.remove()
  }, 600)
}

// Mostrar notificação usando Toastify
function showToast(message, type = 'info') {
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
      },
      stopOnFocus: true
    }).showToast()
  } else {
    // Fallback se Toastify não estiver disponível
    console.log(`Toast ${type}: ${message}`)
  }
}

// Adicione este CSS ao documento se não estiver definido em outro lugar
function addRippleStyle() {
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style')
    style.id = 'ripple-style'
    style.textContent = `
          @keyframes ripple {
              0% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(0.3);
              }
              100% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(3);
              }
          }
          
          .theme-switching {
              animation: pulse 0.5s ease;
          }
          
          @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
          }
      `
    document.head.appendChild(style)
  }
}
