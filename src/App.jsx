import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const GAME_WIDTH = 900;
const GROUND_HEIGHT = 90;
const PLAYER_WIDTH = 52;
const PLAYER_HEIGHT = 68;
const PLAYER_X = 90;
const GRAVITY = 2200;
const JUMP_FORCE = 820;
const BASE_SPEED = 320;
const SPEED_INCREASE = 9;
const MAX_SPEED = 760;
const SCORE_RATE = 10;
const MIN_OBSTACLE_GAP = 1.1;
const MAX_OBSTACLE_GAP = 2.2;

const createObstacle = (id) => {
  const width = 30 + Math.random() * 32;
  const height = 35 + Math.random() * 50;

  return {
    id,
    x: GAME_WIDTH + 80,
    width,
    height,
  };
};

const createClouds = () => {
  return Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    x: 120 + index * 180,
    y: 40 + Math.random() * 90,
    size: 55 + Math.random() * 35,
    speed: 15 + Math.random() * 15,
  }));
};

function App() {
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [playerBottom, setPlayerBottom] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [clouds, setClouds] = useState(createClouds());
  const [isRunningFrame, setIsRunningFrame] = useState(false);

  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const playerBottomRef = useRef(0);
  const scoreRef = useRef(0);
  const obstacleRef = useRef([]);
  const obstacleTimerRef = useRef(0);
  const obstacleIdRef = useRef(1);
  const gameStateRef = useRef("start");

  useEffect(() => {
    const savedBest = Number(localStorage.getItem("runner-best-score")) || 0;
    setBestScore(savedBest);
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    playerBottomRef.current = playerBottom;
  }, [playerBottom]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    obstacleRef.current = obstacles;
  }, [obstacles]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        if (gameStateRef.current === "start" || gameStateRef.current === "gameover") {
          startGame();
          return;
        }

        if (gameStateRef.current === "running") {
          jump();
        }
      }

      if (event.code === "KeyP") {
        if (gameStateRef.current === "running") {
          pauseGame();
        } else if (gameStateRef.current === "paused") {
          resumeGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gameState !== "running") {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return undefined;
    }

    lastTimeRef.current = 0;

    const gameLoop = (time) => {
      if (gameStateRef.current !== "running") {
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      updateGame(deltaTime);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  const resetGameValues = () => {
    velocityRef.current = 0;
    playerBottomRef.current = 0;
    scoreRef.current = 0;
    obstacleRef.current = [];
    obstacleTimerRef.current = 0;
    obstacleIdRef.current = 1;
    lastTimeRef.current = 0;

    setPlayerBottom(0);
    setScore(0);
    setObstacles([]);
    setClouds(createClouds());
    setIsRunningFrame(false);
  };

  const startGame = () => {
    resetGameValues();
    setGameState("running");
  };

  const restartGame = () => {
    startGame();
  };

  const pauseGame = () => {
    setGameState("paused");
    setIsRunningFrame(false);
  };

  const resumeGame = () => {
    setGameState("running");
  };

  const finishGame = () => {
    setGameState("gameover");
    setIsRunningFrame(false);

    const roundedScore = Math.floor(scoreRef.current);

    if (roundedScore > bestScore) {
      setBestScore(roundedScore);
      localStorage.setItem("runner-best-score", String(roundedScore));
    }
  };

  const jump = () => {
    const isOnGround = playerBottomRef.current <= 0.5;

    if (!isOnGround || gameStateRef.current !== "running") {
      return;
    }

    velocityRef.current = JUMP_FORCE;
    setIsRunningFrame(true);
  };

  const updateGame = (deltaTime) => {
    if (deltaTime > 0.05) {
      deltaTime = 0.05;
    }

    const nextScore = scoreRef.current + deltaTime * SCORE_RATE;
    const roundedScore = Math.floor(nextScore);
    const speed = Math.min(BASE_SPEED + roundedScore * SPEED_INCREASE, MAX_SPEED);

    scoreRef.current = nextScore;
    setScore(nextScore);

    velocityRef.current -= GRAVITY * deltaTime;
    let nextBottom = playerBottomRef.current + velocityRef.current * deltaTime;

    if (nextBottom <= 0) {
      nextBottom = 0;
      velocityRef.current = 0;
    }

    playerBottomRef.current = nextBottom;
    setPlayerBottom(nextBottom);
    setIsRunningFrame(nextBottom === 0);

    obstacleTimerRef.current -= deltaTime;

    let nextObstacles = obstacleRef.current.map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - speed * deltaTime,
    }));

    if (obstacleTimerRef.current <= 0) {
      nextObstacles.push(createObstacle(obstacleIdRef.current));
      obstacleIdRef.current += 1;
      obstacleTimerRef.current =
        MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
    }

    nextObstacles = nextObstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);

    obstacleRef.current = nextObstacles;
    setObstacles(nextObstacles);

    setClouds((currentClouds) =>
      currentClouds.map((cloud) => {
        const nextX = cloud.x - cloud.speed * deltaTime;

        if (nextX + cloud.size < 0) {
          return {
            ...cloud,
            x: GAME_WIDTH + 50 + Math.random() * 120,
            y: 30 + Math.random() * 100,
            size: 55 + Math.random() * 35,
            speed: 15 + Math.random() * 15,
          };
        }

        return {
          ...cloud,
          x: nextX,
        };
      })
    );

    const playerRect = {
      left: PLAYER_X,
      right: PLAYER_X + PLAYER_WIDTH,
      bottom: nextBottom,
      top: nextBottom + PLAYER_HEIGHT,
    };

    const didCollide = nextObstacles.some((obstacle) => {
      const obstacleRect = {
        left: obstacle.x,
        right: obstacle.x + obstacle.width,
        bottom: 0,
        top: obstacle.height,
      };

      return (
        playerRect.right > obstacleRect.left &&
        playerRect.left < obstacleRect.right &&
        playerRect.top > obstacleRect.bottom &&
        playerRect.bottom < obstacleRect.top
      );
    });

    if (didCollide) {
      finishGame();
    }
  };

  const renderOverlay = () => {
    if (gameState === "start") {
      return (
        <div className="overlay-card">
          <p className="eyebrow">React Endless Runner</p>
          <h1>Sky Sprint</h1>
          <p className="overlay-text">
            Jump over incoming obstacles, survive longer, and beat your best score.
          </p>
          <button className="primary-button" onClick={startGame}>
            Start Game
          </button>
          <p className="hint-text">Press Space to jump. Press P to pause.</p>
        </div>
      );
    }

    if (gameState === "gameover") {
      return (
        <div className="overlay-card">
          <p className="eyebrow">Game Over</p>
          <h2>Your run has ended</h2>
          <p className="overlay-text">Final Score: {Math.floor(score)}</p>
          <p className="overlay-text">Best Score: {bestScore}</p>
          <button className="primary-button" onClick={restartGame}>
            Restart Game
          </button>
        </div>
      );
    }

    if (gameState === "paused") {
      return (
        <div className="overlay-card small">
          <p className="eyebrow">Paused</p>
          <h2>Take a breath</h2>
          <button className="primary-button" onClick={resumeGame}>
            Resume
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-shell">
      <div className="game-wrapper">
        <div className="scoreboard">
          <div className="score-card">
            <span className="score-label">Score</span>
            <strong>{Math.floor(score)}</strong>
          </div>
          <div className="score-card">
            <span className="score-label">Best</span>
            <strong>{bestScore}</strong>
          </div>
          <button
            className="secondary-button"
            onClick={gameState === "paused" ? resumeGame : pauseGame}
            disabled={gameState === "start" || gameState === "gameover"}
          >
            {gameState === "paused" ? "Resume" : "Pause"}
          </button>
        </div>

        <div className="game-area">
          <div className="sky-glow" />

          {clouds.map((cloud) => (
            <div
              key={cloud.id}
              className="cloud"
              style={{
                left: `${(cloud.x / GAME_WIDTH) * 100}%`,
                top: `${cloud.y}px`,
                width: `${cloud.size}px`,
                height: `${cloud.size * 0.55}px`,
              }}
            />
          ))}

          <div className="player-lane">
            <div
              className={`player ${isRunningFrame ? "running" : ""}`}
              style={{
                left: `${PLAYER_X}px`,
                bottom: `${GROUND_HEIGHT + playerBottom}px`,
                width: `${PLAYER_WIDTH}px`,
                height: `${PLAYER_HEIGHT}px`,
              }}
            >
              <div className="player-eye" />
              <div className="player-leg left" />
              <div className="player-leg right" />
            </div>
          </div>

          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="obstacle"
              style={{
                left: `${obstacle.x}px`,
                bottom: `${GROUND_HEIGHT}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
              }}
            />
          ))}

          <div className="ground-line" />
          <div className="ground-fill" />

          {gameState !== "running" && <div className="overlay">{renderOverlay()}</div>}
        </div>

        <div className="controls">
          <button className="jump-button" onClick={jump} disabled={gameState !== "running"}>
            Jump
          </button>
          <p className="control-note">Use the on-screen jump button or press Space.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

