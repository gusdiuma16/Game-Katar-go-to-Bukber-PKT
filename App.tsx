import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import WarTakjil from './components/games/WarTakjil';
import SlideToJannah from './components/games/SlideToJannah';
import DilemaRamadan from './components/games/DilemaRamadan';
import Leaderboard from './components/Leaderboard';
import { ViewState, User } from './types';
import { loginUser, getUserSession, logoutUser, submitScore } from './services/api';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const existingUser = getUserSession();
    if (existingUser) {
      setUser(existingUser);
      setView(ViewState.MENU);
    }
  }, []);

  const handleLogin = async (name: string, phone: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await loginUser(name, phone);
      setUser(loggedUser);
      setView(ViewState.MENU);
    } catch (error) {
      console.error("Login failed", error);
      alert("System Error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView(ViewState.LOGIN);
  };

  const handleGameOver = async (gameKey: 'warTakjil' | 'slideJannah' | 'dilema', score: number) => {
    if (user) {
        // Optimistic update
        const updatedUser = {...user};
        if (score > updatedUser.scores[gameKey]) {
            updatedUser.scores[gameKey] = score;
            setUser(updatedUser);
        }
        
        await submitScore(gameKey, score);
        setView(ViewState.MENU);
    }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.LOGIN:
        return <Login onLogin={handleLogin} isLoading={isLoading} />;
      
      case ViewState.MENU:
        return user ? (
          <MainMenu 
            user={user} 
            onNavigate={setView} 
            onLogout={handleLogout} 
          />
        ) : null;

      case ViewState.GAME_WAR_TAKJIL:
        return <WarTakjil onGameOver={(s) => handleGameOver('warTakjil', s)} onExit={() => setView(ViewState.MENU)} />;

      case ViewState.GAME_SLIDE_JANNAH:
        return <SlideToJannah onGameOver={(s) => handleGameOver('slideJannah', s)} onExit={() => setView(ViewState.MENU)} />;

      case ViewState.GAME_DILEMA:
        return <DilemaRamadan onGameOver={(s) => handleGameOver('dilema', s)} onExit={() => setView(ViewState.MENU)} />;
      
      case ViewState.LEADERBOARD:
        return <Leaderboard onBack={() => setView(ViewState.MENU)} />;
      
      default:
        return <div>Error: Unknown State</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-cyber-dark text-white relative overflow-hidden font-cyber">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-900 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-900 rounded-full blur-[100px]"></div>
      </div>

      <header className="z-10 w-full p-4 flex justify-between items-center border-b border-gray-800 bg-slate-950/80 backdrop-blur">
        <div className="text-neon-green font-pixel text-xs md:text-sm">KATAR JTC HUB</div>
        <div className="text-neon-pink font-pixel text-[10px] md:text-xs animate-pulse">ONLINE</div>
      </header>

      <main className="flex-1 z-10 w-full overflow-y-auto overflow-x-hidden">
        {renderContent()}
      </main>

      <footer className="z-10 w-full p-2 text-center text-[10px] text-gray-600 font-pixel">
        Coming Soon : 8 Maret 2026
      </footer>
    </div>
  );
};

export default App;
