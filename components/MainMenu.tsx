import React from 'react';
import Button from './Button';
import { User, ViewState } from '../types';

interface MainMenuProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <div className="w-full flex justify-between items-center mb-8 border-b-2 border-cyber-purple pb-4">
        <div>
          <h2 className="text-xl font-cyber text-white">Selamat Datang,</h2>
          <span className="text-2xl font-pixel text-neon-green">{user.username}</span>
        </div>
        <button onClick={onLogout} className="text-red-500 text-xs font-pixel hover:underline">LOGOUT</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        {/* Game 1 Card */}
        <div 
          onClick={() => onNavigate(ViewState.GAME_WAR_TAKJIL)}
          className="group relative bg-slate-900 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-neon-green transition-all"
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-pixel">High Score: {user.scores.warTakjil}</div>
          <div className="text-4xl mb-2 group-hover:animate-bounce">🌮</div>
          <h3 className="text-xl font-pixel text-white mb-2 group-hover:text-neon-green">WAR TAKJIL</h3>
          <p className="text-sm font-cyber text-gray-400">Reflex Game. Grab food, avoid traps!</p>
        </div>

        {/* Game 2 Card */}
        <div 
          onClick={() => onNavigate(ViewState.GAME_SLIDE_JANNAH)}
          className="group relative bg-slate-900 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-neon-pink transition-all"
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-pixel">High Score: {user.scores.slideJannah}</div>
          <div className="text-4xl mb-2 group-hover:animate-bounce">🏃</div>
          <h3 className="text-xl font-pixel text-white mb-2 group-hover:text-neon-pink">SLIDE 2 JANNAH</h3>
          <p className="text-sm font-cyber text-gray-400">Infinite Runner. Avoid Ghibah!</p>
        </div>

        {/* Game 3 Card */}
        <div 
          onClick={() => onNavigate(ViewState.GAME_DILEMA)}
          className="group relative bg-slate-900 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-gold transition-all md:col-span-2"
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-pixel">High Score: {user.scores.dilema}</div>
          <div className="text-4xl mb-2 group-hover:animate-bounce">⚖️</div>
          <h3 className="text-xl font-pixel text-white mb-2 group-hover:text-gold">DILEMA RAMADAN</h3>
          <p className="text-sm font-cyber text-gray-400">Story Mode. Maintain your Iman & Social stats.</p>
        </div>
      </div>

      <Button variant="secondary" onClick={() => onNavigate(ViewState.LEADERBOARD)} className="w-full md:w-auto">
        VIEW LEADERBOARD
      </Button>
    </div>
  );
};

export default MainMenu;
