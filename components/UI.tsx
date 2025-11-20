import React from 'react';
import { GameState, RaceStats } from '../types';

interface UIProps {
  gameState: GameState;
  score: number; // Real-time score from Game component would be ideal, but simpler to just show in Canvas or overlays
  onStart: () => void;
  onRestart: () => void;
  lastStats: RaceStats | null;
  commentary: string;
  loadingCommentary: boolean;
}

const UI: React.FC<UIProps> = ({ 
  gameState, 
  onStart, 
  onRestart, 
  lastStats, 
  commentary,
  loadingCommentary 
}) => {
  
  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 z-40 p-8 text-center">
        <h1 className="text-4xl md:text-5xl text-yellow-400 mb-8 animate-pulse tracking-widest drop-shadow-[4px_4px_0_rgba(180,83,9,1)]">
          RETRO RACER
        </h1>
        <p className="text-gray-400 mb-8 text-xs md:text-sm max-w-md leading-6">
          STEER WITH LEFT/RIGHT ARROWS.<br/>
          SPEED INCREASES AUTOMATICALLY.<br/>
          SURVIVE AS LONG AS YOU CAN.
        </p>
        <button 
          onClick={onStart}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all font-bold text-xl"
        >
          INSERT COIN (START)
        </button>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/90 z-40 p-6 text-center">
        <h2 className="text-4xl text-red-500 mb-6 animate-bounce">CRASHED!</h2>
        
        {lastStats && (
          <div className="bg-gray-800 p-6 rounded border-2 border-gray-600 mb-6 w-full max-w-sm">
             <div className="flex justify-between mb-2 border-b border-gray-700 pb-2">
                <span className="text-gray-400">SCORE</span>
                <span className="text-yellow-400">{lastStats.score}</span>
             </div>
             <div className="flex justify-between mb-2 border-b border-gray-700 pb-2">
                <span className="text-gray-400">DISTANCE</span>
                <span className="text-blue-400">{Math.floor(lastStats.distance)}m</span>
             </div>
             <div className="text-xs text-red-400 mt-4 uppercase">
                {lastStats.causeOfDeath}
             </div>
          </div>
        )}

        <div className="mb-8 min-h-[80px] w-full max-w-sm">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Race Analyst (AI)</div>
            <div className="text-green-400 text-sm leading-6 bg-black/50 p-4 border border-green-900 rounded font-mono">
                {loadingCommentary ? (
                    <span className="animate-pulse">ANALYZING TELEMETRY...</span>
                ) : (
                    <span className="typing-effect">{commentary}</span>
                )}
            </div>
        </div>

        <button 
          onClick={onRestart}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all font-bold text-lg"
        >
          RETRY
        </button>
      </div>
    );
  }

  return null;
};

export default UI;