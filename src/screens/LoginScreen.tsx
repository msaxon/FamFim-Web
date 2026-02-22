import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { setAccessToken } from '../services/auth/tokenStore';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
      navigate('/budgets');
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>FamFin Login</h1>
      <button 
        onClick={() => login()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};
