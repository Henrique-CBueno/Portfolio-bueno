import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/global.css';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import type { Dados } from './lib/tipos';

// a página chega pronta do build (prerender.mjs); o React só assume o HTML que já está lá
const dados = JSON.parse(document.getElementById('dados')!.textContent!) as Dados;
hydrateRoot(document.getElementById('raiz')!, <App dados={dados} />);
