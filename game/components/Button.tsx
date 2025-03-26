import React from 'react';
import './Button.css';

type ButtonProps = {
  text: string;
  iconSrc: string;
  onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = ({ text, iconSrc, onClick }) => {
  return (
    <div
      className="custom-button"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="custom-button__inner">
        <div className="custom-button__content">
          <img className="custom-button__icon" src={iconSrc} alt={text} />
          <span className="custom-button__text">{text}</span>
        </div>
      </div>
    </div>
  );
};
