import { Component } from 'react';

// Isola falhas: se o remote estiver fora do ar, só este pedaço da tela quebra
export default class ErrorBoundary extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{ border: '2px solid crimson', padding: 16, borderRadius: 8 }}>
          <strong>{this.props.nome} indisponível.</strong>
          <p>O resto da aplicação continua funcionando.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
