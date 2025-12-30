import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { renderLayout } from './ui/layout';
import { startApp } from './app/app';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');

  if (appElement) {
    // 1. Renderiza o layout principal da aplicação na div #app
    renderLayout(appElement);

    // 2. Inicia a lógica da aplicação (WebSocket, Player, etc.)
    startApp();
  } else {
    console.error("❌ Elemento #app não encontrado no DOM. A aplicação não pode ser iniciada.");
  }
});
