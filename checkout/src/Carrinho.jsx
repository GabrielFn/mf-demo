import { useState } from 'react';
// Vem do core em runtime ("host" é um remote deste MFE)
import { softRedirect } from 'host/soft-redirect';

// Recebe o estado do host via props: o "contrato" entre shell e MFE
export default function Carrinho({ itens = [], onFinalizar }) {
  const [finalizado, setFinalizado] = useState(false);
  const total = itens.reduce((soma, p) => soma + p.preco, 0);

  const finalizar = () => {
    onFinalizar?.();
    setFinalizado(true);
  };

  return (
    <div style={{ border: '2px dashed purple', padding: 16, borderRadius: 8 }}>
      <small style={{ color: 'purple' }}>
        Componente vindo do remote "checkout" (porta 3002)
      </small>

      {finalizado ? (
        <p>Pedido finalizado com sucesso!</p>
      ) : itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul>
            {itens.map((p, i) => (
              <li key={i}>
                {p.nome} - R$ {p.preco.toFixed(2)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: R$ {total.toFixed(2)}</strong>
          </p>
          <button onClick={finalizar}>Finalizar compra</button>{' '}
        </>
      )}

      <button onClick={() => softRedirect('/')}>← Continuar comprando</button>
    </div>
  );
}
