import React, { useState } from 'react';
import Button from '../Button';
import { DilemaScenario } from '../../types';

interface DilemaRamadanProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

const SCENARIOS: DilemaScenario[] = [
  {
    id: 1,
    sender: "Ukhti Dila",
    text: "Eh, bukber yuk tapi di bar yang ada alkoholnya, gmn? Tempatnya aesthetic bgt loh!",
    options: [
      { text: "Gas aja lah! Kan cuma minum es teh.", effect: { iman: -40, social: +20 }, nextScenarioId: 2 },
      { text: "Skip, cari tempat halal aja.", effect: { iman: +20, social: -10 }, nextScenarioId: 3 }
    ]
  },
  {
    id: 2,
    sender: "Hati Kecil",
    text: "Kamu sampai di tempat itu. Musik kencang, bau alkohol menyengat. Adzan Maghrib berkumandang samar-samar.",
    options: [
      { text: "Tetap stay demi konten instastory.", effect: { iman: -50, social: +10 }, nextScenarioId: 'LOSE' },
      { text: "Ijin pulang, sholat di masjid sebelah.", effect: { iman: +30, social: -20 }, nextScenarioId: 4 }
    ]
  },
  {
    id: 3,
    sender: "Grup WA 'Sobat Hijrah'",
    text: "Alhamdulillah kamu nolak. Eh, kita mau galang dana buat panti asuhan, mau ikut nyumbang?",
    options: [
      { text: "Transfer 500rb diem-diem.", effect: { iman: +40, social: 0 }, nextScenarioId: 4 },
      { text: "Transfer 10rb trus pamer di status WA.", effect: { iman: -20, social: +30 }, nextScenarioId: 4 }
    ]
  },
  {
    id: 4,
    sender: "Boss Kantor",
    text: "Lembur ya hari ini? Ada meeting dadakan jam 5 sore sampai jam 7 malam. Buka puasa di ruang meeting aja.",
    options: [
      { text: "Siap pak! Kerja adalah ibadah.", effect: { iman: +10, social: +20 }, nextScenarioId: 5 },
      { text: "Waduh, saya sudah janji sama Ibu buka dirumah.", effect: { iman: +20, social: -30 }, nextScenarioId: 5 }
    ]
  },
  {
    id: 5,
    sender: "Tetangga Julid",
    text: "Lihat tuh si A, puasa-puasa kok lemes banget kerjanya. Pasti sahurnya mie instan doang.",
    options: [
      { text: "Ikutan ghibahin si A.", effect: { iman: -30, social: +10 }, nextScenarioId: 'LOSE' },
      { text: "Istighfar, tegur tetangga dengan sopan.", effect: { iman: +30, social: -10 }, nextScenarioId: 'WIN' }
    ]
  }
];

const DilemaRamadan: React.FC<DilemaRamadanProps> = ({ onGameOver, onExit }) => {
  const [currentScenarioId, setCurrentScenarioId] = useState<number | string>(1);
  const [iman, setIman] = useState(100);
  const [social, setSocial] = useState(50);
  const [history, setHistory] = useState<number>(0); // Scenarios survived

  const currentScenario = SCENARIOS.find(s => s.id === currentScenarioId);

  const handleChoice = (optionIndex: number) => {
    if (!currentScenario) return;
    
    const choice = currentScenario.options[optionIndex];
    
    const newIman = Math.max(0, Math.min(100, iman + choice.effect.iman));
    const newSocial = Math.max(0, Math.min(100, social + choice.effect.social));
    const newHistory = history + 1;

    setIman(newIman);
    setSocial(newSocial);
    setHistory(newHistory);

    if (newIman <= 0 || newSocial <= 0) {
      setCurrentScenarioId('LOSE');
    } else {
      setCurrentScenarioId(choice.nextScenarioId);
    }
  };

  const calculateScore = () => {
    return (history * 100) + iman + social;
  };

  if (currentScenarioId === 'WIN') {
     return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h2 className="text-3xl font-pixel text-neon-green mb-4">ALHAMDULILLAH!</h2>
            <p className="font-cyber text-lg mb-4">You survived Ramadan with your Faith intact.</p>
            <div className="text-2xl font-bold mb-6">Score: {calculateScore()}</div>
            <Button onClick={() => onGameOver(calculateScore())}>SUBMIT SCORE</Button>
        </div>
     )
  }

  if (currentScenarioId === 'LOSE' || !currentScenario) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h2 className="text-3xl font-pixel text-red-500 mb-4">GAME OVER</h2>
            <p className="font-cyber text-lg mb-4">
                {iman <= 0 ? "Your Iman hit rock bottom." : "Your Social life is ruined."}
            </p>
            <div className="text-2xl font-bold mb-6">Score: {calculateScore()}</div>
            <Button onClick={() => onGameOver(calculateScore())}>SUBMIT SCORE</Button>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto p-4">
      {/* Meters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-pixel mb-1 text-neon-green">
            <span>IMAN</span>
            <span>{iman}%</span>
          </div>
          <div className="h-4 bg-slate-800 border border-neon-green rounded overflow-hidden">
            <div className="h-full bg-neon-green transition-all duration-500" style={{ width: `${iman}%` }}></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-pixel mb-1 text-neon-pink">
            <span>SOCIAL</span>
            <span>{social}%</span>
          </div>
          <div className="h-4 bg-slate-800 border border-neon-pink rounded overflow-hidden">
            <div className="h-full bg-neon-pink transition-all duration-500" style={{ width: `${social}%` }}></div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-slate-900 border-2 border-cyber-purple rounded-lg p-4 mb-4 overflow-y-auto flex flex-col gap-4">
        <div className="self-start max-w-[80%]">
          <div className="text-xs text-gold mb-1 font-cyber">{currentScenario.sender}</div>
          <div className="bg-slate-800 text-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg border-l-4 border-gold">
            {currentScenario.text}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentScenario.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(idx)}
            className="w-full text-left p-3 border border-slate-600 hover:border-neon-green hover:bg-slate-800 transition-colors text-sm font-cyber rounded text-white"
          >
            {">"} {opt.text}
            <span className="block text-xs text-gray-500 mt-1">
              (Iman: {opt.effect.iman > 0 ? '+' : ''}{opt.effect.iman}, Soc: {opt.effect.social > 0 ? '+' : ''}{opt.effect.social})
            </span>
          </button>
        ))}
      </div>
      
      <button onClick={onExit} className="mt-4 text-xs text-gray-500 hover:text-white self-center">
          Exit to Menu
      </button>
    </div>
  );
};

export default DilemaRamadan;
