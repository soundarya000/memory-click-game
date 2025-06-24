import React, { useState, useEffect, useRef } from "react";
import { THEMES } from "./themes";
import "./App.css";

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getHighScore(themeName) {
  return Number(localStorage.getItem(`memory-hs-${themeName}`) || 0);
}
function setHighScore(themeName, score) {
  localStorage.setItem(`memory-hs-${themeName}`, score);
}

const HINT_LIMIT = 2;

function App() {
  // THEME
  const [theme, setTheme] = useState("Animals");
  const [icons, setIcons] = useState([]);
  // GAME STATE
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  // TIMER
  const [timer, setTimer] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);
  // HIGH SCORE
  const [highScore, setHighScoreState] = useState(getHighScore(theme));
  // HINTS
  const [hintCount, setHintCount] = useState(HINT_LIMIT);
  const [showAll, setShowAll] = useState(false);

  // Initialize theme and board
  useEffect(() => {
    setIcons(THEMES[theme]);
  }, [theme]);

  useEffect(() => {
    if (icons.length) {
      const doubled = shuffle([...icons, ...icons]);
      setCards(doubled);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setCombo(0);
      setScore(0);
      setTimer(0);
      setHintCount(HINT_LIMIT);
      setShowAll(false);
      setActive(false);
      setHighScoreState(getHighScore(theme));
    }
    // eslint-disable-next-line
  }, [icons]);

  // Timer logic
  useEffect(() => {
    if (active && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    if (!active && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  // Handle hint reveal
  useEffect(() => {
    if (showAll) {
      const t = setTimeout(() => setShowAll(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showAll]);

  // Check for win
  const isFinished = matched.length === cards.length && cards.length > 0;

  useEffect(() => {
    if (isFinished) {
      setActive(false);
      if (score > highScore) {
        setHighScore(theme, score);
        setHighScoreState(score);
      }
    }
    // eslint-disable-next-line
  }, [isFinished]);

  function handleThemeChange(e) {
    setTheme(e.target.value);
  }

  function handleClick(idx) {
    if (!active) setActive(true);
    if (
      flipped.length === 2 ||
      flipped.includes(idx) ||
      matched.includes(idx) ||
      showAll
    )
      return;
    setFlipped([...flipped, idx]);
  }

  // Combo/multiplier: +10 per match, +combo*2 bonus
  function checkMatch() {
    const [a, b] = flipped;
    setMoves((m) => m + 1);
    if (cards[a] === cards[b]) {
      setMatched([...matched, a, b]);
      setCombo((c) => c + 1);
      setScore((s) => s + 10 + combo * 2);
    } else {
      setCombo(0);
    }
    setFlipped([]);
  }

  useEffect(() => {
    if (flipped.length === 2) {
      setTimeout(checkMatch, 350); // Faster flip-back
    }
    // eslint-disable-next-line
  }, [flipped]);

  function resetGame() {
    setIcons(THEMES[theme]);
  }

  function handleHint() {
    if (hintCount > 0 && !showAll) {
      setHintCount(hintCount - 1);
      setShowAll(true);
    }
  }

  // Accessibility: keyboard navigation
  function handleKeyDown(idx, e) {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(idx);
    }
  }

  return (
    <div className="App">
      <h1>Memory Click Game 🧠</h1>
      <div className="controls">
        <label>
          Theme:{" "}
          <select value={theme} onChange={handleThemeChange}>
            {Object.keys(THEMES).map((t) => (
              <option value={t} key={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button className="reset" onClick={resetGame}>
          Restart
        </button>
        <button
          className="hint"
          onClick={handleHint}
          disabled={hintCount === 0 || showAll}
        >
          Hint ({hintCount} left)
        </button>
      </div>
      <div className="scorebar">
        <span>Moves: {moves}</span>
        <span>Combo: {combo}</span>
        <span>Score: {score}</span>
        <span>Time: {timer}s</span>
        <span className="highscore">High Score: {highScore}</span>
      </div>
      <div className="board">
        {cards.map((icon, idx) => {
          const show =
            showAll || flipped.includes(idx) || matched.includes(idx);
          return (
            <div
              key={idx}
              className={`card ${show ? "flipped" : ""}`}
              tabIndex={0}
              aria-label={`Memory card ${idx + 1}`}
              onClick={() => handleClick(idx)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              role="button"
              aria-pressed={show}
            >
              <div className="card-inner">
                <div className="card-front">❓</div>
                <div className="card-back">{icon}</div>
              </div>
            </div>
          );
        })}
      </div>
      {isFinished && (
        <div className="result">
          <h2>🎉 You matched all pairs!</h2>
          <p>
            Moves: {moves} | Time: {timer}s | Final Score: {score}
            <br />
            {score > highScore ? "🌟 New High Score!" : null}
          </p>
          <button className="reset" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
      <footer>
        <p>
          <small>Accessible · Animated · Power-Ups · Themeable · By You!</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
