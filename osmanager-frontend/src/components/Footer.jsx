import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaPhone, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2 className="footer-logo">
            BAG <span>CLEANER</span>
          </h2>
          <p className="footer-tagline">Manutenção de Big Bags</p>
        </div>

        <div className="footer-section links">
          <h3>Navegação</h3>
          <ul>
            <li><Link to="#">Home</Link></li>
            <li><Link to="#">Bag Cleaner</Link></li>
            <li><Link to="#">Serviços</Link></li>
            <li><Link to="#">Logística</Link></li>
          </ul>
        </div>

        <div className="footer-section links">
          <h3>Acesso Rápido</h3>
          <ul>
            <li><Link to="#">Acesso Cliente</Link></li>
            <li><Link to="#">Contato</Link></li>
            <li><Link to="#">Trabalhe Conosco</Link></li>
            <li><Link to="#">Engebag</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contato</h3>
          <ul>
            <li><FaPhone /> (19) 3456-2110 ramal: 217</li>
            <li><FaWhatsapp /> (19) 99740-2156 (Comercial)</li>
            <li><FaWhatsapp /> (19) 99738-7371 (Logística)</li>
            <li><FaWhatsapp /> (19) 99655-0081 (RH)</li>
          </ul>
        </div>

        <div className="footer-section address">
          <h3>Endereço</h3>
          <p>
            <FaMapMarkerAlt /> <strong>BAG CLEANER Manutenção de Big Bags LTDA</strong><br />
            R. João Ometto, Nº 39<br />
            CEP: 13498-002 - Iracemápolis
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Bag Cleaner | Todos os direitos reservados
      </div>

      {/* Ícone flutuante do WhatsApp */}
      <a 
        href="https://wa.me/5519997402156" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </footer>
  );
}

export default Footer;