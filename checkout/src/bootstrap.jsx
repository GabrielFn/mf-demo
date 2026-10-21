import { createRoot } from 'react-dom/client';
import Carrinho from './Carrinho';

// Standalone (http://localhost:3002): dados falsos no lugar das props do host
const ITENS_FAKE = [
  { id: 1, nome: 'Teclado', preco: 199.9 },
  { id: 2, nome: 'Mouse', preco: 89.9 },
];

createRoot(document.getElementById('root')).render(
  <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
    <h1>Checkout (modo standalone)</h1>
    <Carrinho itens={ITENS_FAKE} onFinalizar={() => alert('Finalizado!')} />
  </div>
);
