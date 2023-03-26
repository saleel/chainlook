import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/styles.scss';
import Modal from 'react-modal';
import App from './app';

const container = document.getElementById('root') as HTMLElement;

Modal.setAppElement(container);

const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
