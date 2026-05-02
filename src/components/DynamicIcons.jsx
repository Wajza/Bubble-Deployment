// frontend/src/components/DynamicIcons.jsx
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

// Cart Icon SVG
export const CartIcon = ({ size = 24, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
};

// Profile Icon SVG
export const ProfileIcon = ({ size = 24, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

// Heart Icon (Wishlist)
export const HeartIcon = ({ size = 24, liked = false, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={liked ? themeData.primary : "none"}
      stroke={liked ? themeData.primary : (isHovered ? themeData.iconHover : themeData.iconColor)}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        transform: liked ? 'scale(1.1)' : 'scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

// Logout Icon
export const LogoutIcon = ({ size = 20, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
};

// Menu Icon (Mobile)
export const MenuIcon = ({ size = 24, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
};

// Close Icon
export const CloseIcon = ({ size = 24, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
};

// Search Icon
export const SearchIcon = ({ size = 20, onClick }) => {
  const { themeData } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isHovered ? themeData.iconHover : themeData.iconColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
};
