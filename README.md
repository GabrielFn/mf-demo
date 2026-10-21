# mf-demo

Projeto de estudo de **microfrontends com Module Federation** (Webpack 5 + `@module-federation/enhanced`) e React 18.

São três aplicações independentes, cada uma com seu próprio build e servidor, que se juntam **no navegador, em tempo de execução**:

| App        | Porta | Papel                                                                        |
| ---------- | ----- | ---------------------------------------------------------------------------- |
| `host`     | 3000  | Shell (core): layout, roteamento, estado do carrinho. Expõe `soft-redirect`. |
| `produtos` | 3001  | MFE do catálogo. Expõe `./ListaProdutos`.                                    |
| `checkout` | 3002  | MFE do carrinho. Expõe `./Carrinho`.                                         |

```
              mfe-manifest.json
                     │ (URLs dos remotes)
                     ▼
            ┌──────────────────┐
            │   host (3000)    │── expõe ──▶ host/soft-redirect
            └──────────────────┘                  ▲
        carrega │          │ carrega              │ importam
                ▼          ▼                      │
     ┌──────────────┐  ┌──────────────┐           │
     │ produtos     │  │ checkout     │───────────┘
     │ (3001)       │  │ (3002)       │
     └──────────────┘  └──────────────┘
          React e react-dom: uma única instância (singleton)
```

## Como rodar

Requer Node 18+.

```bash
npm install
npm start        # sobe as 3 apps em paralelo
```

- http://localhost:3000: a aplicação completa (host + MFEs)
- http://localhost:3001 e http://localhost:3002: cada MFE rodando sozinho (standalone)

Para gerar o build de produção das três apps (pasta `dist/` de cada uma):

```bash
npm run build
```

## Estrutura

```
mf-demo/
├── package.json              # npm workspaces + scripts que rodam tudo junto
├── host/
│   ├── public/mfe-manifest.json   # onde está cada MFE
│   ├── webpack.config.js          # expõe soft-redirect, sem remotes fixos
│   └── src/
│       ├── index.js               # async boundary
│       ├── bootstrap.jsx          # carrega o manifest e depois renderiza
│       ├── mfe.js                 # registerRemotes / loadRemote
│       ├── soft-redirect.js       # exposto para os MFEs
│       ├── App.jsx                # rotas, carrinho, escuta de eventos
│       └── ErrorBoundary.jsx      # isola falhas de cada MFE
├── produtos/
│   ├── webpack.config.js          # expõe ./ListaProdutos, consome host
│   └── src/ListaProdutos.jsx
└── checkout/
    ├── webpack.config.js          # expõe ./Carrinho, consome host
    └── src/Carrinho.jsx
```

## Conceitos demonstrados

### Host e remote

- **Remote** é a app que **oferece** código. Ela gera um `remoteEntry.js`, um índice dos módulos que expõe.
- **Host** é a app que **consome** esse código em runtime.
- Uma app pode ser as duas coisas: aqui o `host` consome os MFEs e também expõe o `soft-redirect` para eles.

### `exposes`

O que cada remote disponibiliza (`produtos/webpack.config.js`):

```js
exposes: { './ListaProdutos': './src/ListaProdutos' }
```

No host, esse módulo é referenciado como `produtos/ListaProdutos` (`<remote>/<chave>`).

### `shared` e `singleton`

```js
shared: {
  react: { singleton: true, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
}
```

As apps negociam e usam **uma única cópia** do React. Sem isso, cada MFE traria a sua e os hooks quebrariam ("Invalid hook call"). O contador de cliques em `ListaProdutos` prova que os hooks funcionam dentro do host.

### Async boundary

Todo `src/index.js` contém apenas:

```js
import('./bootstrap');
```

O import dinâmico dá tempo ao Module Federation de negociar as dependências compartilhadas antes de o React executar. Sem isso surge o erro *"Shared module is not available for eager consumption"*.

### Carregamento dinâmico via manifest

O host **não tem URLs de MFEs no build** (`remotes: {}`). Elas vêm de `host/public/mfe-manifest.json`:

```json
{
  "produtos": "http://localhost:3001/remoteEntry.js",
  "checkout": "http://localhost:3002/remoteEntry.js"
}
```

O código está em `host/src/mfe.js`:

1. `carregarManifest()` busca o JSON e chama `registerRemotes()`.
2. `componenteRemoto('checkout/Carrinho')` cria um `lazy(() => loadRemote(...))`, com cache para não remontar o MFE a cada render.

**Por que isso importa:** fazer deploy ou rollback de um MFE é só trocar uma URL no manifest, sem rebuild do shell. Em produção, esse JSON viria de uma API ou CDN.

### Soft redirect

É a navegação entre MFEs **sem recarregar a página**:

1. O MFE chama `softRedirect('/carrinho')`, importado do core (`host/soft-redirect`).
2. A função dispara o evento `[mfe] navegar`.
3. O host escuta, faz `history.pushState` e renderiza o MFE da nova rota.
4. Os botões voltar e avançar do navegador funcionam via `popstate`.

Os MFEs não conhecem o roteador do host. Eles só conhecem o contrato exposto pelo core, então mudar a navegação exige alterar apenas `host/src/soft-redirect.js`.

### Comunicação entre MFEs

| Direção       | Mecanismo                                              | Exemplo                                |
| ------------- | ------------------------------------------------------ | -------------------------------------- |
| MFE → host    | `CustomEvent` no `window`                              | `[produtos] adicionado` com o produto  |
| host → MFE    | Props                                                  | `<Carrinho itens onFinalizar />`       |
| MFE → MFE     | Pelo host: o estado do carrinho mora no shell          | produtos adiciona, checkout exibe      |
| Código comum  | Módulo exposto pelo core                               | `host/soft-redirect`                   |

### Isolamento de falhas

Cada MFE é renderizado dentro de `<ErrorBoundary>` + `<Suspense>`. Se um remote estiver fora do ar, só aquele pedaço da tela mostra um aviso, e o restante da aplicação continua funcionando.

## Experimentos sugeridos

1. **Deploy independente:** com tudo rodando, altere um texto em `produtos/src/ListaProdutos.jsx` e recarregue o host. A mudança aparece sem tocar no host.
2. **Falha isolada:** pare o checkout, ou aponte a URL dele no manifest para uma porta inexistente, e abra `/carrinho`. Aparece "Carrinho indisponível", e o header e a rota de produtos continuam funcionando.
3. **Soft redirect:** no DevTools, aba Network, navegue entre Produtos e Carrinho. Não há nova requisição do documento, apenas o `remoteEntry.js` de cada MFE na primeira visita.
4. **Estado preservado:** adicione itens, vá ao carrinho e volte. O carrinho continua, porque a página nunca recarregou.
5. **Singleton:** no DevTools, aba Network, confirme que o React é baixado uma única vez.

## Trade-offs

- **Quando usar:** vários times que precisam de deploys independentes. Para um time pequeno, um monólito modular costuma ser mais simples.
- **Custos:** mais complexidade operacional, risco de conflito de versões entre MFEs, mais requisições de rede e testes de integração mais difíceis.
- **Acoplamento ao core:** os MFEs dependem do `host` no ar para importar o `soft-redirect`. Rodando standalone, o host também precisa estar rodando.
- **Estado de módulo:** `softRedirect` não guarda estado, então múltiplas instâncias não são problema. Um módulo exposto **com estado** (uma fila global, um cache) precisa que todos os MFEs recebam a mesma instância.
- **URLs fixas:** a URL do core está escrita no config dos MFEs. Num projeto real, ela viria de variáveis de ambiente por ambiente (dev, staging, prod).

## Observação sobre versões

O projeto usa `@module-federation/enhanced@2.9.2`, e o `package.json` da raiz fixa `webpack` em `5.111.1` via `overrides`:

- O `enhanced` importa arquivos **internos** do webpack (`webpack/lib/util/...`). O webpack 5.112 reorganizou essa pasta, e o build falha com `Cannot find module 'webpack/lib/util/extractUrlAndGlobal'`.
- Declarar `webpack@5.111.1` nas apps não basta: dependências transitivas recentes (ex.: `schema-utils@4.8.1`) exigem `webpack ^5.112` como peer, e o npm instala uma cópia aninhada do 5.112.
- `overrides` força **todas** as cópias da árvore para a mesma versão. É o mecanismo do npm para controlar dependências transitivas.

Quando sair uma versão do `enhanced` compatível com o webpack 5.112+, basta atualizá-la e ajustar ou remover o `overrides`.
