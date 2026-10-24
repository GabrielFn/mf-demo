import { useEffect, useState } from 'react';

// Sub-rotas internas: o host não sabe que elas existem, só que "/conta/*" é deste MFE
const PAGINAS = {
  '/dados': { titulo: 'Dados pessoais', conteudo: 'Nome: Cliente Demo · E-mail: cliente@exemplo.com' },
  '/seguranca': { titulo: 'Segurança', conteudo: 'Autenticação em dois fatores: ativada' },
};

const subrotaAtual = (basePath) =>
  window.location.pathname.slice(basePath.length) || '/dados';

export default function ContaApp({ basePath, navegar }) {
  const [subrota, setSubrota] = useState(() => subrotaAtual(basePath));

  useEffect(() => {
    // Toda navegação (deste MFE, do host ou do botão voltar) termina num
    // popstate, então basta reler a URL para saber qual página mostrar
    const onPopState = () => setSubrota(subrotaAtual(basePath));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [basePath]);

  const pagina = PAGINAS[subrota];

  return (
    <div style={{ border: '2px dashed darkorange', padding: 16, borderRadius: 8 }}>
      <small style={{ color: 'darkorange' }}>
        MFE "conta" (porta 3003) montado com raiz React e rotas próprias
      </small>
      <nav style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        {Object.entries(PAGINAS).map(([rota, { titulo }]) => (
          <button
            key={rota}
            disabled={rota === subrota}
            onClick={() => navegar(basePath + rota)}
          >
            {titulo}
          </button>
        ))}
      </nav>
      {pagina ? (
        <>
          <h3>{pagina.titulo}</h3>
          <p>{pagina.conteudo}</p>
        </>
      ) : (
        <p>Página "{subrota}" não existe na conta.</p>
      )}
      <button onClick={() => navegar('/')}>← Voltar para a loja</button>
    </div>
  );
}
