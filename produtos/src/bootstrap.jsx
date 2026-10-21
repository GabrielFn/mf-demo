import { createRoot } from 'react-dom/client';
import ListaProdutos from './ListaProdutos';

// Permite rodar o remote sozinho (http://localhost:3001) para desenvolvimento
createRoot(document.getElementById('root')).render(
  <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
    <h1>Produtos (modo standalone)</h1>
    <ListaProdutos />
  </div>
);
