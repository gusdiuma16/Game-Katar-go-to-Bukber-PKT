import React, { useState } from 'react';
import Button from './Button';

interface LoginProps {
  onLogin: (name: string, phone: string) => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone.length >= 4) {
      onLogin(name, phone);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl md:text-5xl font-pixel text-neon-green mb-2 leading-tight">
        KATAR<br/><span className="text-white">GAME</span><br/><span className="text-neon-pink">JTC</span>
      </h1>
      <p className="text-gold font-cyber tracking-widest mb-8">Goes To Bukber Katar Jtc 2026</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 bg-slate-900/50 p-6 rounded-lg border border-cyber-purple backdrop-blur-sm">
        <div className="flex flex-col text-left">
          <label className="font-pixel text-xs mb-2 text-neon-green">AGENT NAME</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black border border-slate-700 text-white p-3 rounded focus:border-neon-green focus:outline-none font-cyber text-lg"
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="flex flex-col text-left">
          <label className="font-pixel text-xs mb-2 text-neon-pink">ID CODE (Last 4 Digits HP)</label>
          <input 
            type="tel" 
            maxLength={4}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
            className="bg-black border border-slate-700 text-white p-3 rounded focus:border-neon-pink focus:outline-none font-cyber text-lg tracking-widest text-center"
            placeholder="0000"
            required
          />
        </div>

        <Button type="submit" disabled={isLoading} className="mt-4">
          {isLoading ? 'INITIALIZING...' : 'ENTER SYSTEM'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
