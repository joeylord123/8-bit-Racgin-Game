import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Entity, RaceStats } from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, ROAD_X, ROAD_WIDTH, LANE_WIDTH, LANE_COUNT,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR, COLORS, PLAYER_ACCEL, 
  PLAYER_BRAKE, PLAYER_FRICTION, PLAYER_MAX_SPEED 
} from '../constants';

interface GameProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onGameOver: (stats: RaceStats) => void;
}

const Game: React.FC<GameProps> = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game Logic State (Refs for performance in loop)
  const playerRef = useRef<Entity>({
    id: 0,
    x: ROAD_X + LANE_WIDTH, // Center lane
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    type: 'PLAYER',
    color: PLAYER_COLOR,
    speed: 0
  });
  
  const currentLaneRef = useRef<number>(1); // 0: Left, 1: Center, 2: Right

  const enemiesRef = useRef<Entity[]>([]);
  const roadOffsetRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const speedRef = useRef<number>(0); // Visual speed based on player movement
  const frameCountRef = useRef<number>(0);
  
  // Drawing Helpers
  const drawRect = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    ctx.fillStyle = entity.color;
    // Simple 8-bit car shape
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    
    // Windows
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(entity.x + 4, entity.y + 10, entity.width - 8, 12); // Windshield
    ctx.fillRect(entity.x + 4, entity.y + 35, entity.width - 8, 8); // Rear window
    
    // Lights
    ctx.fillStyle = entity.type === 'PLAYER' ? '#fcd34d' : '#ef4444'; // Headlights/Taillights
    if (entity.type === 'PLAYER') {
        ctx.fillRect(entity.x + 2, entity.y + 2, 8, 4);
        ctx.fillRect(entity.x + entity.width - 10, entity.y + 2, 8, 4);
    } else {
        ctx.fillRect(entity.x + 2, entity.y + entity.height - 6, 8, 4);
        ctx.fillRect(entity.x + entity.width - 10, entity.y + entity.height - 6, 8, 4);
    }
  };

  const spawnEnemy = () => {
    const lanes = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const x = ROAD_X + (lane * LANE_WIDTH) + (LANE_WIDTH - PLAYER_WIDTH) / 2;
    const speed = Math.random() * 3 + 2; // Random speed 2-5
    const color = [COLORS.ENEMY_1, COLORS.ENEMY_2, COLORS.ENEMY_3][Math.floor(Math.random() * 3)];
    
    enemiesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y: -100,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      type: 'ENEMY',
      color,
      speed,
      lane
    });
  };

  const checkCollision = (rect1: Entity, rect2: Entity) => {
    // Slightly reduce collision box for better feel
    const buffer = 4; 
    return (
      rect1.x + buffer < rect2.x + rect2.width - buffer &&
      rect1.x + rect1.width - buffer > rect2.x + buffer &&
      rect1.y + buffer < rect2.y + rect2.height - buffer &&
      rect1.y + rect1.height - buffer > rect2.y + buffer
    );
  };

  const resetGame = useCallback(() => {
    currentLaneRef.current = 1; // Center
    playerRef.current = {
      ...playerRef.current,
      x: ROAD_X + LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2,
      speed: 0 // Speed will auto-accelerate
    };
    enemiesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = 0;
    frameCountRef.current = 0;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- UPDATE LOGIC ---
    frameCountRef.current++;

    // Player Lane Logic (Discrete Movement)
    const targetX = ROAD_X + (currentLaneRef.current * LANE_WIDTH) + (LANE_WIDTH - PLAYER_WIDTH) / 2;
    // Fast Lerp for snap feel but smooth visual
    playerRef.current.x += (targetX - playerRef.current.x) * 0.4;
    
    // Auto Speed Logic
    // Base speed is 10. Increased ramp-up: Every 200 frames (was 600), speed potential increases.
    const timeSpeedBoost = Math.floor(frameCountRef.current / 100); // Faster scaling
    const targetSpeed = 10 + timeSpeedBoost;
    
    // Smooth acceleration towards target speed
    if (playerRef.current.speed < targetSpeed) {
        playerRef.current.speed += 0.05;
    }
    
    // Cap absolute max speed
    if (playerRef.current.speed > PLAYER_MAX_SPEED) {
        playerRef.current.speed = PLAYER_MAX_SPEED;
    }

    speedRef.current = playerRef.current.speed;
    
    // Update distance and score
    if (speedRef.current > 0) {
        distanceRef.current += speedRef.current / 10;
        scoreRef.current += Math.floor(speedRef.current);
        roadOffsetRef.current += speedRef.current * 2;
        if (roadOffsetRef.current > 40) roadOffsetRef.current = 0;
    }

    // Spawn Enemies
    // Difficulty scaling: Spawn faster as score increases
    const spawnRate = Math.max(20, 80 - Math.floor(scoreRef.current / 300));
    if (frameCountRef.current % spawnRate === 0 && speedRef.current > 2) {
      spawnEnemy();
    }

    // Update Enemies
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      let enemy = enemiesRef.current[i];
      
      // Relative movement
      enemy.y += (playerRef.current.speed - enemy.speed + 2);

      // Despawn off-screen
      if (enemy.y > CANVAS_HEIGHT) {
        enemiesRef.current.splice(i, 1);
        scoreRef.current += 50; // Bonus for overtaking
      } else if (enemy.y < -200) {
          enemiesRef.current.splice(i, 1);
      }

      // Collision
      if (checkCollision(playerRef.current, enemy)) {
        onGameOver({
            score: scoreRef.current,
            distance: distanceRef.current,
            topSpeed: speedRef.current,
            causeOfDeath: `Crashed into a ${enemy.color === COLORS.ENEMY_1 ? 'Blue' : enemy.color === COLORS.ENEMY_2 ? 'Yellow' : 'Purple'} Cruiser`
        });
        return; // Stop loop
      }
    }

    // --- DRAW LOGIC ---

    // 1. Background (Grass)
    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Road
    ctx.fillStyle = COLORS.ROAD;
    ctx.fillRect(ROAD_X, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // 3. Lane Markings
    ctx.strokeStyle = COLORS.MARKING;
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffsetRef.current;
    
    for (let i = 1; i < LANE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(ROAD_X + (i * LANE_WIDTH), 0);
        ctx.lineTo(ROAD_X + (i * LANE_WIDTH), CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Border Lines (Solid)
    ctx.setLineDash([]);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(ROAD_X, 0);
    ctx.lineTo(ROAD_X, CANVAS_HEIGHT);
    ctx.moveTo(ROAD_X + ROAD_WIDTH, 0);
    ctx.lineTo(ROAD_X + ROAD_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();

    // 4. Enemies
    enemiesRef.current.forEach(enemy => drawRect(ctx, enemy));

    // 5. Player
    drawRect(ctx, playerRef.current);

    // 6. HUD
    // Speed
    ctx.fillStyle = "white";
    ctx.font = "10px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(`SPEED: ${Math.floor(speedRef.current * 10)} KM/H`, 10, 20);
    
    // Distance
    const km = (distanceRef.current / 1000).toFixed(1);
    ctx.textAlign = "right";
    ctx.fillText(`DIST: ${km} KM`, CANVAS_WIDTH - 10, 20);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, onGameOver]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
        resetGame();
        requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop, resetGame]);

  // Input Listeners for Discrete Lane Changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState !== GameState.PLAYING) return;

        if (e.key === 'ArrowLeft' || e.key === 'a') {
            currentLaneRef.current = Math.max(0, currentLaneRef.current - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            currentLaneRef.current = Math.min(LANE_COUNT - 1, currentLaneRef.current + 1);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-black">
        <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="block w-full h-full object-fill"
        />
    </div>
  );
};

export default Game;