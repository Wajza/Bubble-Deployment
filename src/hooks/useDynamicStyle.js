// frontend/src/hooks/useDynamicStyle.js
import { useTheme } from '../context/ThemeContext';

export const useDynamicStyle = () => {
  const { themeData } = useTheme();

  const getGlassCardStyle = (hover = false) => ({
    background: themeData.cardBg,
    border: `1px solid ${themeData.borderColor}`,
    borderRadius: '28px',
    backdropFilter: 'blur(14px)',
    transition: 'all 0.3s ease',
    ...(hover && {
      ':hover': {
        background: themeData.cardBgHover,
        borderColor: themeData.borderHover,
        transform: 'translateY(-4px)',
      }
    })
  });

  const getButtonStyle = (variant = 'primary') => {
    if (variant === 'primary') {
      return {
        background: themeData.buttonBg,
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 26px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        ':hover': {
          background: themeData.buttonHover,
          transform: 'translateY(-2px)',
        }
      };
    }
    return {
      background: 'rgba(255,255,255,0.2)',
      color: themeData.textColor,
      border: `1px solid ${themeData.borderColor}`,
      borderRadius: '12px',
      padding: '12px 26px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
    };
  };

  const getTextStyle = (type = 'primary') => ({
    color: type === 'primary' ? themeData.textColor : themeData.textLight,
  });

  const getInputStyle = () => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${themeData.borderColor}`,
    outline: 'none',
    fontSize: '14px',
    fontFamily: "'Josefin Sans', sans-serif",
    background: 'rgba(255,255,255,0.95)',
    transition: 'all 0.25s ease',
    ':focus': {
      borderColor: themeData.primary,
      boxShadow: `0 0 0 2px ${themeData.primary}33`,
    }
  });

  return {
    themeData,
    getGlassCardStyle,
    getButtonStyle,
    getTextStyle,
    getInputStyle,
  };
};