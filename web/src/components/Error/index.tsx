import React from 'react';
import { FiInfo } from 'react-icons/fi';

import './styles.css';

interface IProps {
  error: string;
}

const Error: React.FC<IProps> = ({ error }) => {
  return (
    <span className="error">
      <FiInfo />
      
      {error}
    </span>
  );
}

export default Error;