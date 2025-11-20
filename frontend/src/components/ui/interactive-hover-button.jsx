import React from 'react';
import { motion } from 'framer-motion';

export const InteractiveHoverButton = ({
  text,
  className = '',
  onClick,
  type = 'button',
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(81, 66, 255, 0.3)' }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.button>
  );
};

