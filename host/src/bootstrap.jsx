import { createRoot } from 'react-dom/client';
import App from './App';
import { carregarManifest } from './mfe';

const root = createRoot(document.getElementById('root'));

// O shell só renderiza depois de saber onde está cada MFE
carregarManifest()
  .then(() => root.render(<App />))
  .catch((erro) => root.render(<p>Falha ao iniciar: {erro.message}</p>));
