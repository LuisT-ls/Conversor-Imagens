/**
 * Módulo de controle do modo escuro/claro
 * Permite ao usuário alternar entre temas da interface
 */

// Função para inicializar o modo escuro
export function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle')
  const themeText = document.getElementById('themeText')
  const themeIcon = themeToggle.querySelector('i')

  // Verificar se há preferência salva no localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true'

  // Aplicar tema inicial
  if (isDarkMode) {
    document.body.classList.add('dark-mode')
    updateThemeUI(true)
  }

  // Adicionar evento de clique ao botão
  themeToggle.addEventListener('click', () => {
    // Verificar estado atual do modo escuro
    const currentIsDarkMode = document.body.classList.contains('dark-mode')

    // Alternar modo
    document.body.classList.toggle('dark-mode')

    // Salvar preferência no localStorage
    localStorage.setItem('darkMode', !currentIsDarkMode)

    // Atualizar UI do botão
    updateThemeUI(!currentIsDarkMode)
  })

  // Função para atualizar a aparência do botão de tema
  function updateThemeUI(isDark) {
    if (isDark) {
      themeIcon.classList.remove('fa-moon')
      themeIcon.classList.add('fa-sun')
      themeText.textContent = 'Tema Claro'
      themeToggle.classList.remove('btn-outline-light')
      themeToggle.classList.add('btn-outline-warning')
    } else {
      themeIcon.classList.remove('fa-sun')
      themeIcon.classList.add('fa-moon')
      themeText.textContent = 'Tema Escuro'
      themeToggle.classList.remove('btn-outline-warning')
      themeToggle.classList.add('btn-outline-light')
    }
  }

  // Verificar preferência do sistema operacional
  function checkSystemPreference() {
    // Verificar se o usuário já definiu uma preferência manualmente
    if (localStorage.getItem('darkMode') === null) {
      // Se o sistema preferir modo escuro e o usuário não tiver preferência salva
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        document.body.classList.add('dark-mode')
        updateThemeUI(true)
        localStorage.setItem('darkMode', 'true')
      }
    }

    // Adicionar listener para mudanças na preferência do sistema
    if (window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          // Só alterar automaticamente se o usuário não tiver definido manualmente
          if (localStorage.getItem('darkMode') === null) {
            const newIsDarkMode = e.matches
            document.body.classList.toggle('dark-mode', newIsDarkMode)
            updateThemeUI(newIsDarkMode)
            localStorage.setItem('darkMode', newIsDarkMode)
          }
        })
    }
  }

  // Verificar preferência do sistema na inicialização
  checkSystemPreference()
}
