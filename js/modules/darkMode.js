// darkMode.js - Handle dark/light theme switching

export function initDarkMode() {
  console.log('Initializing dark mode functionality...')

  const themeToggle = document.getElementById('themeToggle')
  const themeText = document.getElementById('themeText')
  const themeIcon = themeToggle.querySelector('i')

  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  // Set initial theme based on saved preference or system preference
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme')
    updateThemeToggle(true)
  }

  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-theme')
    updateThemeToggle(isDarkMode)

    // Save user preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  })

  // Update button text and icon based on current theme
  function updateThemeToggle(isDarkMode) {
    if (isDarkMode) {
      themeText.textContent = 'Tema Claro'
      themeIcon.classList.remove('fa-moon')
      themeIcon.classList.add('fa-sun')
      themeToggle.classList.remove('btn-outline-light')
      themeToggle.classList.add('btn-outline-warning')
    } else {
      themeText.textContent = 'Tema Escuro'
      themeIcon.classList.remove('fa-sun')
      themeIcon.classList.add('fa-moon')
      themeToggle.classList.remove('btn-outline-warning')
      themeToggle.classList.add('btn-outline-light')
    }
  }

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      // Only apply if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        const shouldBeDark = e.matches
        document.body.classList.toggle('dark-theme', shouldBeDark)
        updateThemeToggle(shouldBeDark)
      }
    })
}
