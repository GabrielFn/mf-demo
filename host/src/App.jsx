import { Suspense, useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { componenteRemoto } from './mfe';
import { softRedirect } from './soft-redirect';

// Rota -> qual MFE renderizar ("<remote>/<chave do exposes>")
const ROTAS = {
  '/': { mfe: 'produtos/ListaProdutos', nome: 'Catálogo de produtos' },
  '/carrinho': { mfe: 'checkout/Carrinho', nome: 'Carrinho' },
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    // Soft redirect: troca a URL e a tela SEM recarregar a página
    const onNavegar = (e) => {
      const destino = e.detail.path;
      if (destino === window.location.pathname) return;

      window.history.pushState({}, '', destino);
      setPath(destino);
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

  const rota = ROTAS[path];
  const Mfe = rota && componenteRemoto(rota.mfe);
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
        </nav>
      </header>

      {!rota ? (
        <p>Página não encontrada.</p>
      ) : (
        // key={path}: ao trocar de rota, um erro anterior não "gruda" na tela nova
        <ErrorBoundary key={path} nome={rota.nome}>
          <Suspense fallback={<p>Carregando {rota.nome.toLowerCase()}...</p>}>
            <Mfe itens={carrinho} onFinalizar={() => setCarrinho([])} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
