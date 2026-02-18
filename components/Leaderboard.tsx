import React, { useEffect, useState } from 'react';
import Button from './Button';
import { getLeaderboard } from '../services/api';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLB = async () => {
      const data = await getLeaderboard();
      setEntries(data);
      setLoading(false);
    };
    fetchLB();
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 h-full">
      <h2 className="text-2xl font-pixel text-gold mb-6 animate-pulse">TOP PEMAIN</h2>

      <div className="w-full bg-slate-900 border border-cyber-purple rounded-lg p-4 mb-6 min-h-[300px]">
        {loading ? (
          <div className="text-center text-neon-green font-pixel mt-10">LOADING DATA...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-700 text-neon-pink font-pixel text-xs">
              <tr>
                <th className="py-2">RANK</th>
                <th className="py-2">PEMAIN</th>
                <th className="py-2 text-right">TOTAL SCORE</th>
              </tr>
            </thead>
            <tbody className="font-cyber text-lg">
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-slate-800">
                  <td className="py-3 text-gold">#{idx + 1}</td>
                  <td className="py-3 text-white">{entry.username}</td>
                  <td className="py-3 text-right text-neon-green">{entry.totalScore}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                 <tr><td colSpan={3} className="text-center py-4 text-gray-500">No records yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Button onClick={onBack}>BACK TO MENU</Button>
    </div>
  );
};

export default Leaderboard;
