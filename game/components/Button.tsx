import React from 'react';
import './Button.css';

type ButtonProps = {
  text: string;
  iconSrc: string;
  onClick?: () => void;
  width?: string;
};

export const Button: React.FC<ButtonProps> = ({
  text,
  iconSrc,
  onClick,
  width,
}) => {
  return (
    <div
      className="custom-button cursor-pointer"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', width: width }}
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
