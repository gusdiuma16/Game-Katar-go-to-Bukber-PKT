import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyle = "font-pixel uppercase px-6 py-3 border-2 transition-all duration-100 transform active:scale-95 shadow-[0_0_10px_rgba(0,0,0,0.5)]";
  
  let variantStyle = "";
  switch(variant) {
    case 'primary':
      variantStyle = "border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_20px_#39ff14]";
      break;
    case 'danger':
      variantStyle = "border-red-500 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_red]";
      break;
    case 'secondary':
      variantStyle = "border-gold text-gold hover:bg-gold hover:text-black hover:shadow-[0_0_20px_gold]";
      break;
  }

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
