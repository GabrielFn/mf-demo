import montar from './montar';

// Permite rodar o remote sozinho (http://localhost:3003) para desenvolvimento.
// Faz o papel do shell: entrega um elemento, o prefixo e uma função de navegação.
const BASE = '/conta';

const navegar = (path) => {
  window.history.pushState({}, '', path.startsWith(BASE) ? path : BASE);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

if (!window.location.pathname.startsWith(BASE)) {
  window.history.replaceState({}, '', BASE);
}

const el = document.getElementById('root');
el.insertAdjacentHTML('beforebegin', '<h1 style="font-family: sans-serif">Conta (modo standalone)</h1>');
el.style.fontFamily = 'sans-serif';
montar({ el, basePath: BASE, navegar });
