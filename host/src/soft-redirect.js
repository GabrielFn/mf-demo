// Exposto via Module Federation ("host/soft-redirect"): todos os MFEs usam
// a mesma implementação, mantida pelo core. Se o contrato de navegação mudar,
// muda só aqui e os MFEs recebem a nova versão sem rebuild.
export function softRedirect(path) {
  window.dispatchEvent(new CustomEvent('[mfe] navegar', { detail: { path } }));
}
