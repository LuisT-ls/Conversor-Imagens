# Configuração do Google Analytics

## Passo a Passo Detalhado

### 1. Criar Conta no Google Analytics

1. **Acesse**: https://analytics.google.com/
2. **Clique**: "Começar a medir"
3. **Preencha**:
   - Nome da conta: "Conversor de Imagens"
   - Nome da propriedade: "Conversor de Imagens"
   - URL: `https://conversor-imagens.vercel.app/`
   - Categoria: "Tecnologia"
   - Fuso horário: "São Paulo"

### 2. Obter ID de Medição

1. **Vá em**: Administrador
2. **Clique**: "Configurações da propriedade"
3. **Copie**: O ID de medição (G-XXXXXXXXXX)

### 3. Atualizar o Código

**Substitua no arquivo `index.html`**:

```html
<!-- Antes -->
gtag('config', 'GA_MEASUREMENT_ID');

<!-- Depois -->
gtag('config', 'G-XXXXXXXXXX');
<!-- Seu ID real -->
```

### 4. Verificar Instalação

1. **Acesse**: Google Analytics
2. **Vá em**: Relatórios em tempo real
3. **Acesse**: Seu site
4. **Verifique**: Se aparece na lista de usuários ativos

## Configuração do Google Search Console

### 1. Adicionar Propriedade

1. **Acesse**: https://search.google.com/search-console
2. **Clique**: "Adicionar propriedade"
3. **Digite**: `https://conversor-imagens.vercel.app/`
4. **Escolha**: "Prefixo de URL"

### 2. Verificar Propriedade

**Opção A - Tag HTML**:

1. Copie a tag de verificação
2. Adicione no `<head>` do `index.html`
3. Aguarde a verificação

**Opção B - Arquivo HTML**:

1. Baixe o arquivo de verificação
2. Faça upload para o repositório
3. Aguarde a verificação

### 3. Enviar Sitemap

1. **Vá em**: Sitemaps
2. **Adicione**: `https://conversor-imagens.vercel.app/sitemap.xml`
3. **Clique**: "Enviar"

## Monitoramento

### Google Analytics - Métricas Importantes

- **Usuários**: Visitantes únicos
- **Sessões**: Interações completas
- **Taxa de rejeição**: Qualidade do conteúdo
- **Tempo na página**: Engajamento
- **Páginas por sessão**: Navegação

### Google Search Console - Métricas de SEO

- **Consultas**: Palavras-chave
- **Cliques**: Tráfego orgânico
- **CTR**: Taxa de cliques
- **Posição média**: Ranking
- **Cobertura**: Páginas indexadas

## Próximos Passos

1. **Implementar**: Google Analytics
2. **Configurar**: Search Console
3. **Monitorar**: Métricas semanais
4. **Otimizar**: Baseado nos dados
5. **Expandir**: Conteúdo e funcionalidades
