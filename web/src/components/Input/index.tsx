import React, { InputHTMLAttributes } from 'react';

import Error from '../Error';

import './styles.css';

interface IProps extends InputHTMLAttributes<HTMLInputElement>{
  name: string;
  label: string;
  error?: string;
}

const Input: React.FC<IProps> = ({ name, label, error, ...props }) => {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>

      <input 
        name={name} 
        id={name}
        autoComplete="off"
        {...props}
      />

      {!!error && <Error error={error} />}
    </div>
  );
}

export default Input;