import React, { SelectHTMLAttributes } from 'react';

import Error from '../Error';

import './styles.css';

interface IProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  placeholder: string;
  error?: string;
}

const Select: React.FC<IProps> = ({ 
  label, 
  name, 
  placeholder, 
  children,
  error,
  ...props
 }) => {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select 
        name={name} 
        id={name} 
        {...props}
      >
        <option value="0">{placeholder}</option>

        {children}
      </select>

      {!!error && <Error error={error}/>}
    </div>
  );
}

export default Select;