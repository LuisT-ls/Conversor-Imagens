// historyManager.js

// Função para inicializar o gerenciador de histórico
export function initHistoryManager() {
  // Carregar o histórico salvo no localStorage
  loadHistory()

  // Adicionar evento de clique para o botão de limpar histórico
  document
    .getElementById('clearHistoryBtn')
    .addEventListener('click', clearHistory)

  // Adicionar evento de clique para o botão de exportar histórico
  document
    .getElementById('exportHistoryBtn')
    .addEventListener('click', exportHistory)
}

// Função para adicionar uma nova entrada ao histórico
export function addToHistory(originalFile, convertedFormat, fileSize) {
  const historyEntry = {
    date: new Date().toLocaleString(),
    originalFile,
    convertedFormat,
    fileSize
  }

  // Recuperar o histórico atual do localStorage
  const history = JSON.parse(localStorage.getItem('conversionHistory')) || []

  // Adicionar a nova entrada ao histórico
  history.push(historyEntry)

  // Salvar o histórico atualizado no localStorage
  localStorage.setItem('conversionHistory', JSON.stringify(history))

  // Atualizar a exibição do histórico na interface
  updateHistoryDisplay()
}

// Função para carregar o histórico do localStorage e exibi-lo
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('conversionHistory')) || []
  updateHistoryDisplay(history)
}

// Função para atualizar a exibição do histórico na interface
function updateHistoryDisplay(
  history = JSON.parse(localStorage.getItem('conversionHistory')) || []
) {
  const historyList = document.getElementById('historyList')
  const historyPlaceholder = document.getElementById('historyPlaceholder')
  const historyListContainer = document.querySelector('.history-list')

  // Limpar a lista atual
  historyList.innerHTML = ''

  if (history.length > 0) {
    // Ocultar o placeholder e mostrar a lista
    historyPlaceholder.classList.add('d-none')
    historyListContainer.classList.remove('d-none')

    // Adicionar cada entrada do histórico à tabela
    history.forEach(entry => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.originalFile}</td>
        <td>${entry.convertedFormat}</td>
        <td>${entry.fileSize}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="downloadEntry('${entry.originalFile}')">
            <i class="fas fa-download"></i>
          </button>
        </td>
      `
      historyList.appendChild(row)
    })
  } else {
    // Mostrar o placeholder e ocultar a lista
    historyPlaceholder.classList.remove('d-none')
    historyListContainer.classList.add('d-none')
  }
}

// Função para limpar o histórico
function clearHistory() {
  localStorage.removeItem('conversionHistory')
  updateHistoryDisplay()
}

// Função para exportar o histórico como um arquivo JSON
function exportHistory() {
  const history = JSON.parse(localStorage.getItem('conversionHistory')) || []
  const blob = new Blob([JSON.stringify(history, null, 2)], {
    type: 'application/json'
  })
  saveAs(blob, 'conversion_history.json')
}

// Função para simular o download de uma entrada (pode ser implementada conforme necessário)
window.downloadEntry = function (filename) {
  // Implementar a lógica de download aqui
  console.log(`Downloading ${filename}`)
}
