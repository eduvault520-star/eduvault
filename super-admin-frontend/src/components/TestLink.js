import React from 'react';
import { Link } from 'react-router-dom';

const TestLink = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 10000,
      padding: '10px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <Link to="/button-test" style={{
        color: '#2196F3',
        fontWeight: 'bold',
        textDecoration: 'none',
        fontSize: '16px'
      }}>
        GO TO BUTTON TEST
      </Link>
    </div>
  );
};

export default TestLink;
