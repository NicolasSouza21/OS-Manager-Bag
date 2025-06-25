// Local: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // 👈 IMPORT ADICIONADO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 ENVOLVA O <App /> COM O <BrowserRouter /> 👇 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)