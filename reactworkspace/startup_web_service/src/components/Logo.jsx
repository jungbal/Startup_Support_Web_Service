import React from 'react';

const Logo = ({ size = 'medium' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '40px', height: '40px' };
      case 'medium':
        return { width: '60px', height: '60px' };
      case 'large':
        return { width: '80px', height: '80px' };
      default:
        return { width: '60px', height: '60px' };
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img 
        src="/image/logo.png" 
        alt="창업든든 로고" 
        style={{
          ...getSize(),
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Logo; 