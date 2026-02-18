import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../Button';

interface WarTakjilProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

type ItemType = 'GOOD' | 'BAD' | 'EMPTY';

interface GridItem {
  id: number;
  type: ItemType;
  emoji: string;
}

const GOOD_EMOJIS = ['🌮', '🍹', '🥯', '🍗', '🥗', '🥣'];
const BAD_EMOJIS = ['🚬', '🍺', '👹', '😡'];

const WarTakjil: React.FC<WarTakjilProps> = ({ onGameOver, onExit }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [grid, setGrid] = useState<GridItem[]>(Array(9).fill({ id: 0, type: 'EMPTY', emoji: '' }));
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'FINISHED'>('READY');
  const [combo, setCombo] = useState(0);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const [feedback, setFeedback] = useState<{id: number, text: string, type: 'good' | 'bad'} | null>(null);

  const timerRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);

  const spawnItem = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      // Clear random old items
      if (Math.random() > 0.3) {
        const occupiedIndices = newGrid.map((item, idx) => item.type !== 'EMPTY' ? idx : -1).filter(i => i !== -1);
        if (occupiedIndices.length > 0) {
           const clearIdx = occupiedIndices[Math.floor(Math.random() * occupiedIndices.length)];
           newGrid[clearIdx] = { id: Date.now(), type: 'EMPTY', emoji: '' };
        }
      }

      // Spawn new item
      const emptyIndices = newGrid.map((item, idx) => item.type === 'EMPTY' ? idx : -1).filter(i => i !== -1);
      
      if (emptyIndices.length > 0) {
        const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const isBad = Math.random() > 0.7; // 30% chance of bad item
        
        newGrid[idx] = {
          id: Date.now(),
          type: isBad ? 'BAD' : 'GOOD',
          emoji: isBad 
            ? BAD_EMOJIS[Math.floor(Math.random() * BAD_EMOJIS.length)]
            : GOOD_EMOJIS[Math.floor(Math.random() * GOOD_EMOJIS.length)]
        };
      }
      return newGrid;
    });
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setGameState('PLAYING');
  };

  // Timer Logic
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('FINISHED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Increasing difficulty (spawn rate)
      const spawnRate = Math.max(200, 600 - (60 - timeLeft) * 5); 
      spawnRef.current = setInterval(spawnItem, spawnRate);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState, spawnItem, timeLeft]);

  // Finish Logic
  useEffect(() => {
    if (gameState === 'FINISHED') {
       if (timerRef.current) clearInterval(timerRef.current);
       if (spawnRef.current) clearInterval(spawnRef.current);
    }
  }, [gameState]);

  const handleItemClick = (index: number) => {
    if (gameState !== 'PLAYING') return;

    const item = grid[index];
    if (item.type === 'EMPTY') return;

    if (item.type === 'GOOD') {
      const points = isFrenzy ? 20 : 10;
      setScore(s => s + points);
      setCombo(c => c + 1);
      setFeedback({ id: item.id, text: `+${points}`, type: 'good' });
      
      // Frenzy Mode check
      if (combo + 1 >= 5 && !isFrenzy) {
        setIsFrenzy(true);
        setTimeout(() => {
          setIsFrenzy(false);
          setCombo(0);
        }, 5000);
      }
    } else {
      setScore(s => Math.max(0, s - 50));
      setCombo(0);
      setIsFrenzy(false);
      setFeedback({ id: item.id, text: `-50`, type: 'bad' });
    }

    // Clear clicked item immediately
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[index] = { id: Date.now(), type: 'EMPTY', emoji: '' };
      return newGrid;
    });

    // Clear feedback after animation
    setTimeout(() => setFeedback(null), 500);
  };

  if (gameState === 'READY') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <h2 className="text-3xl font-pixel text-neon-green mb-4">WAR TAKJIL</h2>
        <p className="font-cyber text-xl text-white max-w-md">
          Click the Halal food (🌮, 🍹) as fast as you can!<br/>
          Avoid the temptations (🚬, 🍺) and Angry Moms (👹).
        </p>
        <Button onClick={startGame}>START HUNT</Button>
        <Button variant="secondary" onClick={onExit}>BACK TO MENU</Button>
      </div>
    );
  }

  if (gameState === 'FINISHED') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <h2 className="text-3xl font-pixel text-neon-green">TIME'S UP!</h2>
        <div className="text-4xl font-bold text-white mb-4">Score: {score}</div>
        <Button onClick={() => onGameOver(score)}>SUBMIT SCORE</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="flex justify-between w-full max-w-md mb-4 font-pixel text-sm">
        <div className="text-neon-pink">TIME: {timeLeft}</div>
        <div className="text-neon-green">SCORE: {score}</div>
      </div>
      
      {isFrenzy && <div className="text-gold font-pixel animate-pulse mb-2">FRENZY MODE! (2x)</div>}

      <div className="grid grid-cols-3 gap-2 w-full max-w-md aspect-square bg-cyber-dark border-2 border-cyber-purple p-2 rounded-lg relative">
        {grid.map((item, idx) => (
          <div
            key={`cell-${idx}`}
            onClick={() => handleItemClick(idx)}
            className={`
              relative flex items-center justify-center text-4xl cursor-pointer rounded bg-slate-800
              hover:bg-slate-700 transition-colors select-none
              ${item.type !== 'EMPTY' ? 'active:scale-95' : ''}
            `}
          >
            {item.type !== 'EMPTY' ? item.emoji : ''}
            
            {/* Hit Feedback */}
            {feedback && feedback.id === item.id && (
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full font-bold text-xl animate-bounce ${feedback.type === 'good' ? 'text-neon-green' : 'text-red-500'}`}>
                {feedback.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarTakjil;