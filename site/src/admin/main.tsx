// Painel: cadastrar vídeos (capa vai pro MinIO pela API) e atualizar os números sem API.
// Tudo acontece no navegador, depois do login no Keycloak; a página em si não tem dado nenhum.
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../styles/global.css';
import './painel.css';
import { createRoot } from 'react-dom/client';
import { Painel } from './Painel';

createRoot(document.getElementById('raiz')!).render(<Painel />);
