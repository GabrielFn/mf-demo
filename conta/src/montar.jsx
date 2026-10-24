import { createRoot } from 'react-dom/client';
import ContaApp from './ContaApp';

// Contrato do padrão "mount": quem carrega este MFE só precisa saber disto.
//   el       -> elemento onde o MFE se desenha
//   basePath -> prefixo da URL que pertence ao MFE (ex.: "/conta")
//   navegar  -> função de navegação do shell (o MFE não conhece o roteador dele)
// Retorna a função que desmonta o MFE.
export default function montar({ el, basePath, navegar }) {
  const root = createRoot(el);
  root.render(<ContaApp basePath={basePath} navegar={navegar} />);
  console.info('[conta] montado em', basePath);

  return () => {
    // O host chama isto no cleanup de um efeito, ou seja, durante o commit
    // dele. Desmontar outra raiz de forma síncrona nesse momento gera o aviso
    // "Attempted to synchronously unmount a root while React was already
    // rendering"; adiar para depois do commit evita isso.
    setTimeout(() => {
      root.unmount();
      console.info('[conta] desmontado');
    });
  };
}
