# Conversor de Imagens Avançado

Um aplicativo web completo para conversão, edição, compressão e processamento em lote de imagens.

## 🌟 Funcionalidades

### Conversor de Imagens

- Converte imagens para diferentes formatos (WebP, JPEG, PNG, ICO, SVG)
- Ajuste de qualidade e configurações específicas por formato
- Redimensionamento de imagens com preservação de proporção
- Visualização comparativa de antes e depois
- Download direto ou compartilhamento das imagens convertidas

### Editor de Imagens

- Ajustes de brilho, contraste e saturação
- Filtros pré-definidos (Escala de cinza, Sépia, Vintage)
- Ferramentas de corte, rotação e espelhamento
- Adição de texto com configurações personalizáveis
- Exportação para o conversor ou download direto

### Conversão em Lote

- Processamento simultâneo de múltiplas imagens
- Configurações padronizadas para todas as imagens
- Download individual ou em pacote ZIP
- Visualização do progresso e resultados

### Compressor de Imagens

- Compressão inteligente com controle de qualidade
- Opção para alvo de tamanho específico
- Mantém ou altera o formato original
- Visualização comparativa do resultado

### Histórico de Conversões

- Registro automático de todas as operações
- Visualização detalhada com estatísticas
- Download direto do histórico
- Exportação do histórico em formato JSON

## 🚀 Tecnologias Utilizadas

- **HTML5 & CSS3** - Estrutura e estilização
- **JavaScript (ES6+)** - Lógica de programação modular
- **Bootstrap 5** - Framework de UI responsivo
- **Fabric.js** - Manipulação avançada de canvas para edição de imagens
- **JSZip** - Criação de arquivos ZIP para download em lote
- **FileSaver.js** - API de download de arquivos
- **Toastify** - Notificações elegantes

## 🛠️ Instalação e Uso

1. Clone o repositório:

   ```bash
   git clone https://github.com/LuisT-ls/Conversor-Imagens
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd Conversor-Imagens
   ```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local:

   ```bash
   # Usando Python para criar um servidor local simples
   python -m http.server 8000
   # Ou para Python 2.x
   python -m SimpleHTTPServer 8000
   ```

4. Acesse `http://localhost:8000` em seu navegador.

## 📂 Estrutura do Projeto

```
.
├── assets/
│   └── css/
│       ├── main.css
│       └── modules/
│           ├── base/
│           ├── components/
│           ├── features/
│           ├── layout/
│           └── utils/
├── js/
│   ├── app.js
│   └── modules/
│       ├── batchConverter.js
│       ├── darkMode.js
│       ├── historyManager.js
│       ├── imageCompressor.js
│       ├── imageConverter.js
│       ├── imageEditor.js
│       └── shareManager.js
├── index.html
├── LICENSE
└── README.md
```

## 🧩 Arquitetura

O projeto segue uma arquitetura modular, onde cada funcionalidade é implementada em um módulo JavaScript separado. Isso proporciona:

- **Manutenibilidade**: Fácil de manter e atualizar
- **Escalabilidade**: Novas funcionalidades podem ser adicionadas sem afetar o código existente
- **Reutilização**: Componentes podem ser reutilizados em diferentes partes da aplicação
- **Separação de responsabilidades**: Cada módulo tem uma responsabilidade específica

## 💡 Recursos Avançados

- **Tema Escuro**: Modo escuro completo para reduzir o cansaço visual
- **Interface Responsiva**: Funciona em dispositivos desktop, tablet e móveis
- **Armazenamento Local**: Histórico salvo no navegador usando localStorage
- **Web Share API**: Integração com APIs modernas de compartilhamento (quando disponível)
- **Processamento Client-Side**: Todas as operações são realizadas localmente, sem envio de dados

## 🔒 Privacidade

- Todas as operações são realizadas localmente no navegador do usuário
- Nenhuma imagem é enviada para servidores externos
- Sem rastreamento ou coleta de dados

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

- **Luis Tei** - [GitHub](https://github.com/LuisT-ls) | [LinkedIn](https://linkedin.com/in/luis-tei) | [Instagram](https://instagram.com/luis.tei)

---

🌟 Se você achou este projeto útil, considere deixar uma estrela no repositório!
