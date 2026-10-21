import { useState } from 'react';
// Vem do core em runtime ("host" é um remote deste MFE)
import { softRedirect } from 'host/soft-redirect';

const PRODUTOS = [
  { id: 1, nome: 'Teclado', preco: 199.9 },
  { id: 2, nome: 'Mouse', preco: 89.9 },
  { id: 3, nome: 'Monitor', preco: 1299.0 },
];

export default function ListaProdutos() {
  // Estado local: prova que hooks funcionam (React singleton compartilhado)
  const [adicionados, setAdicionados] = useState(0);

  const adicionar = (produto) => {
    setAdicionados((n) => n + 1);
    // Comunicação desacoplada: o remote só emite um evento, sem conhecer o host
    window.dispatchEvent(
      new CustomEvent('[produtos] adicionado', { detail: produto })
    );
  };

  return (
    <div style={{ border: '2px dashed green', padding: 16, borderRadius: 8 }}>
      <small style={{ color: 'green' }}>
        Componente vindo do remote "produtos" (porta 3001)
      </small>
      <ul>
        {PRODUTOS.map((p) => (
          <li key={p.id} style={{ margin: '8px 0' }}>
            {p.nome} - R$ {p.preco.toFixed(2)}{' '}
            <button onClick={() => adicionar(p)}>Adicionar</button>
          </li>
        ))}
      </ul>
      <p>Cliques neste componente: {adicionados}</p>
      <button onClick={() => softRedirect('/carrinho')}>Ver carrinho →</button>
    </div>
  );
}
