// frontend/src/components/Button.jsx
import { useTheme } from '../context/ThemeContext';

function Button({ 
  text, 
  variant = "primary", 
  style, 
  onClick, 
  disabled = false,
  type = "button" 
}) {
  const { themeData } = useTheme();

  const getButtonStyles = () => {
    if (variant === "primary" || variant === "purple") {
      return {
        background: disabled ? '#b79be8' : themeData.buttonBg,
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 26px',
        fontWeight: '600',
        fontFamily: "'Josefin Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s ease',
        opacity: disabled ? 0.7 : 1,
        ...(!disabled && {
          ':hover': {
            background: themeData.buttonHover,
            transform: 'translateY(-2px)',
            boxShadow: `0 5px 15px ${themeData.primary}4D`,
          }
        }),
        ...style
      };
    }
    
    if (variant === "secondary") {
      return {
        background: 'rgba(255,255,255,0.2)',
        color: themeData.textColor,
        border: `1px solid ${themeData.borderColor}`,
        borderRadius: '12px',
        padding: '12px 26px',
        fontWeight: '600',
        fontFamily: "'Josefin Sans', sans-serif",
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        ':hover': {
          background: 'rgba(255,255,255,0.3)',
          transform: 'translateY(-2px)',
        },
        ...style
      };
    }
    
    return style;
  };

  return (
    <button
      type={type}
      style={getButtonStyles()}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default Button;