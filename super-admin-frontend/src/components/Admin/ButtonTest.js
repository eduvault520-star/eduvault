import React from 'react';

const ButtonTest = () => {
  const handleClick = () => {
    console.log('Button clicked!');
    alert('Button works!');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Button Test</h1>
      
      {/* Simple HTML Button */}
      <button 
        onClick={handleClick}
        style={{
          padding: '15px 30px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        Click Me (HTML Button)
      </button>
      
      <div style={{ height: '20px' }}></div>
      
      {/* MUI Button */}
      <button 
        onClick={handleClick}
        style={{
          padding: '15px 30px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        Click Me (MUI Style)
      </button>
    </div>
  );
};

export default ButtonTest;
