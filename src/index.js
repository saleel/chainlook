import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.scss';
import './icons.css';
import Modal from 'react-modal';
import App from './app';

const container = document.getElementById('root');
Modal.setAppElement(container);

const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
