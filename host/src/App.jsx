import { Suspense, useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import MfeMontado from './MfeMontado';
import { componenteRemoto } from './mfe';
import { softRedirect } from './soft-redirect';

// Rota -> qual MFE renderizar ("<remote>/<chave do exposes>")
const ROTAS = {
  '/': { mfe: 'produtos/ListaProdutos', nome: 'Catálogo de produtos' },
  '/carrinho': { mfe: 'checkout/Carrinho', nome: 'Carrinho' },
  // Padrão "mount": tudo abaixo de /conta pertence ao MFE, que tem rotas próprias
  '/conta': { mfe: 'conta/montar', nome: 'Minha conta', montado: true },
};

// Rotas de componente casam pelo caminho exato; rotas montadas, pelo prefixo
const encontrarRota = (path) =>
  Object.keys(ROTAS).find(
    (base) => path === base || (ROTAS[base].montado && path.startsWith(`${base}/`))
  );

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    // Soft redirect: troca a URL e a tela SEM recarregar a página
    const onNavegar = (e) => {
      const destino = e.detail.path;
      if (destino === window.location.pathname) return;

      window.history.pushState({}, '', destino);
      // pushState não avisa ninguém. Disparar um popstate faz o host E os MFEs
      // montados (que têm rotas próprias) relerem a URL pelo mesmo caminho
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    // Botões voltar/avançar do navegador
    const onPopState = () => setPath(window.location.pathname);
    const onAdicionado = (e) => setCarrinho((itens) => [...itens, e.detail]);

    window.addEventListener('[mfe] navegar', onNavegar);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('[produtos] adicionado', onAdicionado);
    // Cleanup: sem isso os listeners se acumulam (bug visto no teste-core)
    return () => {
      window.removeEventListener('[mfe] navegar', onNavegar);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('[produtos] adicionado', onAdicionado);
    };
  }, []);

  const base = encontrarRota(path);
  const rota = ROTAS[base];
  const Mfe = rota && !rota.montado && componenteRemoto(rota.mfe);
  const total = carrinho.reduce((soma, p) => soma + p.preco, 0);

  const link = (destino) => (e) => {
    e.preventDefault();
    softRedirect(destino);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Minha Loja (host - porta 3000)</h1>
        <nav style={{ display: 'flex', gap: 16 }}>
          <a href="/" onClick={link('/')}>Produtos</a>
          <a href="/carrinho" onClick={link('/carrinho')}>
            Carrinho ({carrinho.length}) - R$ {total.toFixed(2)}
          </a>
          <a href="/conta" onClick={link('/conta')}>Minha conta</a>
        </nav>
      </header>

      {!rota ? (
        <p>Página não encontrada.</p>
      ) : (
        // key={base}: ao trocar de rota, um erro anterior não "gruda" na tela nova.
        // É a base, não o path: navegar entre /conta/dados e /conta/seguranca
        // não pode remontar o MFE, quem troca a página é o roteador dele
        <ErrorBoundary key={base} nome={rota.nome}>
          {rota.montado ? (
            <MfeMontado id={rota.mfe} basePath={base} />
          ) : (
            <Suspense fallback={<p>Carregando {rota.nome.toLowerCase()}...</p>}>
              <Mfe itens={carrinho} onFinalizar={() => setCarrinho([])} />
            </Suspense>
          )}
        </ErrorBoundary>
      )}
    </div>
  );
}
