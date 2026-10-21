import { lazy } from 'react';
import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';

// 1. Busca o manifest ({ nome: url do remoteEntry }) e registra os remotes.
//    Em produção esse JSON viria de uma API/CDN, atualizado a cada deploy de MFE.
export async function carregarManifest() {
  const resposta = await fetch('/mfe-manifest.json');
  if (!resposta.ok) throw new Error(`Manifest indisponível (${resposta.status})`);

  const manifest = await resposta.json();

  registerRemotes(
    Object.entries(manifest).map(([name, entry]) => ({ name, entry }))
  );

  return manifest;
}

// 2. Cria (uma vez só) um componente lazy para "<remote>/<módulo exposto>".
//    O cache evita recriar o lazy a cada render, o que remontaria o MFE.
const cache = {};

export function componenteRemoto(id) {
  cache[id] ??= lazy(() => loadRemote(id));
  return cache[id];
}
