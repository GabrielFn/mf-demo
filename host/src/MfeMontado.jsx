import { useEffect, useRef, useState } from 'react';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { softRedirect } from './soft-redirect';

const TIMEOUT_MS = 10000;

function comTimeout(promessa, id) {
  return Promise.race([
    promessa,
    new Promise((_, rejeitar) =>
      setTimeout(() => rejeitar(new Error(`${id}: tempo esgotado`)), TIMEOUT_MS)
    ),
  ]);
}

// Padrão "mount": carrega um MFE que expõe montar({ el, basePath, navegar })
// e entrega a ele uma <div> vazia. Diferente de componenteRemoto (mfe.js), aqui
// o host não renderiza o MFE: só diz ONDE e A PARTIR DE QUAL URL ele vive.
export default function MfeMontado({ id, basePath }) {
  const el = useRef(null);
  const [montado, setMontado] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Se o usuário sair da rota antes do remote carregar, não monta nada
    let cancelado = false;
    let desmontar;

    comTimeout(loadRemote(id), id)
      .then((modulo) => {
        if (cancelado) return;
        desmontar = modulo.default({ el: el.current, basePath, navegar: softRedirect });
        setMontado(true);
      })
      .catch((e) => !cancelado && setErro(e));

    // Sem isto, cada troca de rota deixaria uma raiz React órfã na memória
    return () => {
      cancelado = true;
      desmontar?.();
    };
  }, [id, basePath]);

  // Relança no render para o <ErrorBoundary> do App tratar como os outros MFEs
  if (erro) throw erro;

  return (
    <>
      {!montado && <p>Carregando...</p>}
      <div ref={el} />
    </>
  );
}
