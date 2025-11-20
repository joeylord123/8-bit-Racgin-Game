import React, { useState } from 'react';
import Game from './components/Game';
import UI from './components/UI';
import CRTOverlay from './components/CRTOverlay';
import BootScreen from './components/BootScreen';
import { GameState, RaceStats } from './types';
import { generateRaceCommentary } from './services/geminiService';

const App: React.FC = () => {
  // Start in BOOT state instead of MENU
  const [gameState, setGameState] = useState<GameState>(GameState.BOOT);
  const [lastStats, setLastStats] = useState<RaceStats | null>(null);
  const [commentary, setCommentary] = useState<string>("");
  const [loadingCommentary, setLoadingCommentary] = useState<boolean>(false);

  const handleGameOver = async (stats: RaceStats) => {
    setLastStats(stats);
    setGameState(GameState.GAME_OVER);
    
    // Fetch AI Commentary
    setLoadingCommentary(true);
    setCommentary("");
    const comment = await generateRaceCommentary(stats);
    setCommentary(comment);
    setLoadingCommentary(false);
  };

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleBootComplete = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Minimal Retro Shell */}
      <div className="relative bg-[#d4d4d8] p-4 pb-6 rounded-2xl shadow-[0_0_0_2px_#27272a,0_20px_60px_rgba(0,0,0,0.9)] border-b-8 border-[#52525b]">
        
        {/* Bezel/Frame */}
        <div className="bg-[#27272a] p-3 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          
          {/* Screen Container */}
          <div className="relative rounded-sm overflow-hidden border border-black shadow-[0_0_15px_rgba(0,0,0,0.8)] bg-black">
             
             {/* Boot Screen Layer - Only shows during BOOT state */}
             {gameState === GameState.BOOT && (
               <BootScreen onComplete={handleBootComplete} />
             )}

             {/* Game Layer - Always mounted but active based on state */}
             <div className={gameState === GameState.BOOT ? 'opacity-0' : 'opacity-100'}>
               <Game 
                 gameState={gameState} 
                 setGameState={setGameState}
                 onGameOver={handleGameOver}
               />
               {/* UI Layer */}
               <UI 
                 gameState={gameState}
                 score={0}
                 onStart={handleStart}
                 onRestart={handleStart}
                 lastStats={lastStats}
                 commentary={commentary}
                 loadingCommentary={loadingCommentary}
               />
             </div>

             {/* Visual Effects (Applies to Boot screen too for authenticity) */}
             <CRTOverlay />
          </div>

        </div>

        {/* Decorative Elements below screen */}
        <div className="mt-3 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
                {/* Speaker Grills */}
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-[#52525b] rounded-full"></div>
                    <div className="w-1 h-1 bg-[#52525b] rounded-full"></div>
                    <div className="w-1 h-1 bg-[#52525b] rounded-full"></div>
                </div>
            </div>

            <div className="text-[#52525b] font-bold text-xs tracking-[0.3em] font-serif italic">
                GEMINI<span className="text-red-500">RACING</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-[8px] text-[#52525b] font-bold tracking-widest">POWER</span>
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_red] animate-pulse"></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;