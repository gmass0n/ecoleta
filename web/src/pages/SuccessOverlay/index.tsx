import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

import './styles.css';

const SuccessOverlay: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const body = document.querySelector('body');
      
    if(body) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
      
      body.classList.add('no-scroll');
      
      setTimeout(() => {
        body.classList.remove('no-scroll');
        history.push('');
      }, 2000);
    }
  }, [history])

  return (
    <div id="success-overlay">
      <div className="linear-progress" />

      <FiCheckCircle />

      <h2>Cadastro concluído!</h2>
    </div>
  );
};

export default SuccessOverlay;