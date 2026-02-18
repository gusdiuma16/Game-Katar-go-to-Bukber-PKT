import React, { useEffect, useRef, useState, useCallback } from 'react';
import Button from '../Button';

interface SlideToJannahProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

const SlideToJannah: React.FC<SlideToJannahProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
  const [finalScore, setFinalScore] = useState(0);

  // Game Constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const GROUND_HEIGHT = 50;
  
  // Game State Ref (Mutable data for high-performance loop)
  const stateRef = useRef({
    player: { x: 50, y: 0, width: 40, height: 40, dy: 0, isGrounded: true, jumps: 0 },
    obstacles: [] as { x: number, y: number, width: number, height: number, type: 'GROUND' | 'AIR' }[],
    score: 0,
    speed: 5,
    frameCount: 0,
    isPlaying: false
  });

  const jump = useCallback(() => {
    const player = stateRef.current.player;
    if (player.jumps < 2) {
      player.dy = JUMP_FORCE;
      player.isGrounded = false;
      player.jumps++;
    }
  }, []);

  const startGame = () => {
    // Reset Game Data
    stateRef.current = {
        player: { x: 50, y: 0, width: 40, height: 40, dy: 0, isGrounded: true, jumps: 0 },
        obstacles: [],
        score: 0,
        speed: 5,
        frameCount: 0,
        isPlaying: true
    };
    setGameState('PLAYING');
  };

  // Game Loop Effect
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Fix Resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Virtual Dimensions for Logic (keep logic coordinate system consistent)
    const LOGIC_WIDTH = rect.width;
    const LOGIC_HEIGHT = rect.height;

    let animationFrameId: number;

    const spawnObstacle = () => {
        const type: 'AIR' | 'GROUND' = Math.random() > 0.6 ? 'AIR' : 'GROUND';
        const obstacle = {
          x: LOGIC_WIDTH,
          y: type === 'GROUND' ? LOGIC_HEIGHT - GROUND_HEIGHT - 40 : LOGIC_HEIGHT - GROUND_HEIGHT - 110,
          width: 30,
          height: type === 'GROUND' ? 40 : 30,
          type
        };
        stateRef.current.obstacles.push(obstacle);
    };

    const update = () => {
        const state = stateRef.current;
        
        // Increase Speed
        if (state.frameCount % 600 === 0) state.speed += 0.5;

        // Player Physics
        const player = state.player;
        player.dy += GRAVITY;
        player.y += player.dy;

        // Ground Collision
        if (player.y + player.height > LOGIC_HEIGHT - GROUND_HEIGHT) {
            player.y = LOGIC_HEIGHT - GROUND_HEIGHT - player.height;
            player.dy = 0;
            player.isGrounded = true;
            player.jumps = 0;
        }

        // Spawn Obstacles
        if (state.frameCount % (Math.floor(1000 / state.speed) + 20) === 0) {
            spawnObstacle();
        }

        // Move Obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const obs = state.obstacles[i];
            obs.x -= state.speed;

            // Remove off-screen
            if (obs.x + obs.width < 0) {
                state.obstacles.splice(i, 1);
                state.score += 5;
            }

            // Collision Detection
            // Simple AABB (Axis-Aligned Bounding Box)
            if (
                player.x < obs.x + obs.width - 5 && // right vs left
                player.x + player.width > obs.x + 5 && // left vs right
                player.y < obs.y + obs.height - 5 && // bottom vs top
                player.y + player.height > obs.y + 5   // top vs bottom
            ) {
                state.isPlaying = false;
                setFinalScore(state.score);
                setGameState('GAMEOVER');
            }
        }
        state.frameCount++;
    };

    const draw = () => {
        // Clear
        ctx.fillStyle = '#0f0518';
        ctx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

        const state = stateRef.current;

        // Draw Ground
        ctx.fillStyle = '#2D0A31';
        ctx.fillRect(0, LOGIC_HEIGHT - GROUND_HEIGHT, LOGIC_WIDTH, GROUND_HEIGHT);
        ctx.strokeStyle = '#39ff14';
        ctx.beginPath();
        ctx.moveTo(0, LOGIC_HEIGHT - GROUND_HEIGHT);
        ctx.lineTo(LOGIC_WIDTH, LOGIC_HEIGHT - GROUND_HEIGHT);
        ctx.stroke();

        // Draw Player (Green Box)
        ctx.fillStyle = '#39ff14';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#39ff14';
        ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
        ctx.shadowBlur = 0;

        // Draw Obstacles
        state.obstacles.forEach(obs => {
            ctx.fillStyle = obs.type === 'GROUND' ? '#ff00ff' : '#ffd700';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });

        // Draw Score
        ctx.fillStyle = 'white';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText(`Score: ${state.score}`, 20, 40);
    };

    const loop = () => {
        update();
        draw();
        if (stateRef.current.isPlaying) {
            animationFrameId = requestAnimationFrame(loop);
        }
    };

    // Start Loop
    loop();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  // Input Listeners
  useEffect(() => {
    const handleInput = (e: KeyboardEvent | TouchEvent) => {
        // Prevent default Space scrolling
        if (e.type === 'keydown' && (e as KeyboardEvent).code === 'Space') {
            e.preventDefault();
        }

        if (gameState === 'PLAYING') {
            if ((e.type === 'keydown' && (e as KeyboardEvent).code === 'Space') || e.type === 'touchstart') {
                jump();
            }
        }
    };

    window.addEventListener('keydown', handleInput, { passive: false });
    window.addEventListener('touchstart', handleInput, { passive: false });

    return () => {
        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('touchstart', handleInput);
    };
  }, [gameState, jump]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      {gameState === 'READY' && (
        <div className="absolute z-20 text-center bg-slate-900/90 p-8 rounded border-2 border-neon-green shadow-[0_0_20px_#39ff14] backdrop-blur">
          <h2 className="text-2xl font-pixel text-neon-green mb-4">SLIDE TO JANNAH</h2>
          <p className="font-cyber text-white mb-6 text-lg">Jump over "Ghibah" holes.<br/>Double tap for Double Jump!</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={startGame}>START RUN</Button>
            <Button variant="secondary" onClick={onExit}>EXIT</Button>
          </div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="absolute z-20 text-center bg-slate-900/90 p-8 rounded border-2 border-red-500 shadow-[0_0_20px_red] backdrop-blur">
          <h2 className="text-2xl font-pixel text-red-500 mb-4">ASTAGHFIRULLAH!</h2>
          <p className="font-pixel text-white mb-6 text-xl">Score: {finalScore}</p>
          <Button onClick={() => onGameOver(finalScore)}>SUBMIT SCORE</Button>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '300px', touchAction: 'none' }}
        className="border-2 border-cyber-purple rounded bg-slate-950 max-w-2xl w-full cursor-pointer"
        onClick={() => { if(gameState === 'PLAYING') jump() }}
      />
      <div className="mt-4 text-gray-400 text-xs font-pixel animate-pulse">Tap Screen or Space to Jump</div>
    </div>
  );
};

export default SlideToJannah;
