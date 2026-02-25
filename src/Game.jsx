import { useEffect, useState, useRef } from 'react';

const App = () => {
  const bgRaw = '/Screenshot 2026-02-22 145019 2.svg';
  const rectRaw = '/Rectangle 28.svg';
  const innerRectRaw = '/Rectangle 32.svg';
  const bgUrl = encodeURI(bgRaw);
  const rectUrl = encodeURI(rectRaw);
  const innerRectUrl = encodeURI(innerRectRaw);
  const innerScale = 0.5; // scale factor for inner rectangle sizing (reduced further)
  const screwRaw = '/Clip path group.svg';
  const screwUrl = encodeURI(screwRaw);
  const screwSize = 64; // px
  const buttonRaw = '/Rectangle 35.svg';
  const buttonUrl = encodeURI(buttonRaw);
  const bottleRaw = '/Clip path group (1).svg';
  const bottleUrl = encodeURI(bottleRaw);
  const logoRaw = '/kiitfest-main-logo 3.svg';
  const logoUrl = encodeURI(logoRaw);
  const keys = ['a', 's', 'd'];
  const [activeKey, setActiveKey] = useState(null);
  // Game state
  const [gameRunning, setGameRunning] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const difficultyRanges = {
    easy: [1000, 2000],
    medium: [500, 1000],
    hard: [200, 1500],
  };
  const fallDurationMap = { easy: 1200, medium: 900, hard: 700 };
  const [level, setLevel] = useState(1);
  const [awaitingStart, setAwaitingStart] = useState(true);
  const awaitingStartRef = useRef(awaitingStart);
  const [dropKey, setDropKey] = useState(null);
  const [dropStart, setDropStart] = useState(null);
  const dropKeyRef = useRef(null);
  const dropStartRef = useRef(null);
  const [lastTime, setLastTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const dropTimerRef = useRef(null);
  // Track time until next drop (ms)
  const [timeToNextDrop, setTimeToNextDrop] = useState(null);
  const nextDropAtRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      const raw = String(e.key);
      const k = raw.toLowerCase();
      // If we're awaiting start, any key starts the game
      if (awaitingStartRef.current) {
        setAwaitingStart(false);
        awaitingStartRef.current = false;
        // schedule start after state settles
        setTimeout(() => startGame(), 0);
        return;
      }
      if (keys.includes(k)) {
        setActiveKey(k);
        const currentDrop = dropKeyRef.current;
        const currentStart = dropStartRef.current;
        // If a bottle is currently dropped and matches the key, record reaction
        if (currentDrop && currentDrop === k && currentStart) {
          const rt = performance.now() - currentStart;
          setLastTime(rt);
          setBestTime((prev) => (prev == null || rt < prev ? rt : prev));
          // increment level on successful hit
          setLevel((l) => l + 1);
          // clear current drop and schedule next
          setDropKey(null);
          setDropStart(null);
          dropKeyRef.current = null;
          dropStartRef.current = null;
          scheduleNextDrop();
        }
      }
    };
    const onKeyUp = (e) => {
      const k = String(e.key).toLowerCase();
      if (keys.includes(k)) setActiveKey(null);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    awaitingStartRef.current = awaitingStart;
  }, [awaitingStart]);

  useEffect(() => {
    return () => {
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    };
  }, []);

  useEffect(() => {
    dropKeyRef.current = dropKey;
    dropStartRef.current = dropStart;
  }, [dropKey, dropStart]);

  const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const scheduleNextDrop = () => {
    if (!gameRunning) return;
    const [min, max] = difficultyRanges[difficulty] || difficultyRanges.easy;
    // reduce wait more as level increases so drops happen faster
    const levelReduction = Math.min((level - 1) * 100, Math.floor((max - min) * 0.8));
    let wait = randBetween(min, max) - levelReduction;
    // ensure a reasonable floor
    wait = Math.max(120, wait);
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    // store next-drop time and start a small countdown updater
    nextDropAtRef.current = Date.now() + wait;
    setTimeToNextDrop(wait);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round(nextDropAtRef.current - Date.now()));
      setTimeToNextDrop(remaining);
      if (remaining <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 100);
    dropTimerRef.current = setTimeout(() => {
      startDrop();
    }, wait);
  };

  const startDrop = () => {
    if (!gameRunning) return;
    const i = Math.floor(Math.random() * keys.length);
    const k = keys[i];
    const now = performance.now();
    setDropKey(k);
    setDropStart(now);
    // set refs immediately to avoid timing/closure issues
    dropKeyRef.current = k;
    dropStartRef.current = now;
    // stop countdown while drop is active
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // If player doesn't respond within some max window, clear drop and schedule next
    // fall duration shortens slightly as level rises
    const baseFall = fallDurationMap[difficulty] || 1000;
    const fallDuration = Math.max(300, baseFall - (level - 1) * 30);
    const missWindow = fallDuration + 600;
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = setTimeout(() => {
      // Missed
      setDropKey(null);
      setDropStart(null);
      dropKeyRef.current = null;
      dropStartRef.current = null;
      // mark lastTime as null for a miss (top box will show --)
      setLastTime(null);
      scheduleNextDrop();
    }, missWindow);
  };

  const startGame = () => {
    setLastTime(null);
    setBestTime(null);
    setGameRunning(true);
    setDropKey(null);
    setDropStart(null);
    dropKeyRef.current = null;
    dropStartRef.current = null;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    scheduleNextDrop();
  };

  const stopGame = () => {
    setGameRunning(false);
    setDropKey(null);
    setDropStart(null);
    dropKeyRef.current = null;
    dropStartRef.current = null;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
  };

  const boxes = [
    { left: 17, top: 19, width: 500, height: 169, label: 'Round', value: String(level) },
    { left: 524, top: 19, width: 500, height: 169, label: 'Difficulty', value: difficulty[0].toUpperCase() + difficulty.slice(1) },
    { left: 1014, top: 19, width: 500, height: 169, label: 'Time', value: lastTime == null ? '--' : `${Math.round(lastTime)} ms` },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${bgUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <style>{`@keyframes fall { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(260px); } }`}</style>
      <div style={{ position: 'relative', width: 1508, height: 958, margin: '0 auto' }}>
        {boxes.map((b, i) => {
          const innerW = Math.round((b.width - 40) * innerScale);
          const innerH = Math.round((b.height - 36) * innerScale);
            return (
            <div
              key={i}
              onClick={() => {
                if (b.label === 'Difficulty') {
                  // cycle difficulty
                  const order = ['easy', 'medium', 'hard'];
                  const idx = order.indexOf(difficulty);
                  const next = order[(idx + 1) % order.length];
                  setDifficulty(next);
                  // restart schedule with new difficulty
                  if (gameRunning) {
                    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
                    setDropKey(null);
                    setDropStart(null);
                    scheduleNextDrop();
                  }
                }
              }}
              style={{ position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height, overflow: 'hidden', cursor: b.label === 'Difficulty' ? 'pointer' : 'default' }}
            >
              <img
                src={rectUrl}
                alt={`box-${i}`}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {/* Heading inside outer box but outside inner box */}
                <div style={{ position: 'absolute', left: '50%', top: 25, transform: 'translateX(-50%)', color: '#CC8458', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 40, fontWeight: 800, margin: 0, padding: 0, textAlign: 'center' }}>{String(b.label).trim()}</div>
                </div>

              {/* Inner container centered at bottom, contains inner image and centered value */}
              <div
                style={{
                  position: 'absolute',
                  left: '51%',
                  transform: 'translateX(-50%)',
                  bottom: 30,
                  width: innerW,
                  height: innerH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                }}
              >
                <img src={innerRectUrl} alt={`inner-${i}`} style={{ width: '100%', height: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', color: ' #8B5A2B', fontWeight: 700, fontSize: 18 }}>{b.label === 'Difficulty' ? (difficulty[0].toUpperCase() + difficulty.slice(1)) : b.value}</div>
              </div>

              {/* Screws at four corners of outer box */}
              <img src={screwUrl} alt={`screw-tl-${i}`} style={{ position: 'absolute', left: 60, top: 6, width: screwSize, height: screwSize, pointerEvents: 'none' }} />
              <img src={screwUrl} alt={`screw-tr-${i}`} style={{ position: 'absolute', left: b.width - screwSize - 60, top: 6, width: screwSize, height: screwSize, pointerEvents: 'none' }} />
              <img src={screwUrl} alt={`screw-bl-${i}`} style={{ position: 'absolute', left: 60, top: b.height - screwSize - 18, width: screwSize, height: screwSize, pointerEvents: 'none' }} />
              <img src={screwUrl} alt={`screw-br-${i}`} style={{ position: 'absolute', left: b.width - screwSize - 60, top: b.height - screwSize - 18, width: screwSize, height: screwSize, pointerEvents: 'none' }} />
            </div>
          );
        })}
        {/* Press-any-key prompt shown below the top boxes */}
        {awaitingStart && (
          <div style={{ position: 'absolute', top: 165, left: '50%', transform: 'translateX(-50%)', color: ' #CC8458', fontSize: 20, pointerEvents: 'none',fontFamily: "Stardos Stencil, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight: 700,fontSize:35 }}>
            Press any key to start
          </div>
        )}
        {/* Three control buttons (A S D) centered at bottom */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 600, display: 'flex', gap: 300 }}>
            {keys.map((k, i) => {
              const isActive = activeKey === k;
              const isDropping = dropKey === k;
              const pressOffset = isActive ? -6 : 0;
              const fallDuration = Math.max(300, (fallDurationMap[difficulty] || 1000) - (level - 1) * 30);
              const bottleTransform = `translateX(-50%) translateY(${pressOffset}px)`;
              return (
                <div key={k} style={{ position: 'relative', width: 120, height: 120 }}>
                <button
                  onMouseDown={() => setActiveKey(k)}
                  onMouseUp={() => setActiveKey(null)}
                  onMouseLeave={() => setActiveKey(null)}
                  onClick={() => { /* placeholder for action */ }}
                  aria-label={`key-${k}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: `url(${buttonUrl}) no-repeat center/100% 100%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: isActive ? 'scale(0.95)' : 'none',
                    transition: 'transform 80ms ease',
                    fontFamily: "Stardos Stencil, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
                    fontSize: 40,
                    fontWeight: 800,
                    color: '#8B5A2B',
                  }}
                >
                  {k.toUpperCase()}
                </button>

                {/* Bottle below the button, connected visually and reacting to active state */}
                <img
                  src={bottleUrl}
                  alt={`bottle-${k}`}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: bottleTransform,
                    width: 300,
                    height: 'auto',
                    marginTop: 8,
                    pointerEvents: 'none',
                    transition: 'transform 120ms ease',
                    animation: isDropping ? `fall ${fallDuration}ms linear forwards` : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* stats panel removed — last time shown in top Time box */}
      </div>
        {/* KIITFEST logo in the page corner */}
        <img
          src={logoUrl}
          alt="kiitfest-logo"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 200,
            height: 'auto',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
    </div>
  );
};

export default App;
