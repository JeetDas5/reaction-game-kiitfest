import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGame from "./hooks/useGame";
import bgImg from "./assets/bg2.png";
import kiitfestImg from "./assets/kiitfest-main-logo 20.png";
import screw from "./assets/screw.png";
import bottleImg from "./assets/bottle1.png";

const KEYS = ["a", "s", "d"];

const ScrewDecoration = ({ style, animClass }) => (
  <div className="pointer-events-none absolute z-20" style={style}>
    <img
      src={screw}
      alt="Screw"
      className={`w-20 h-20 md:w-28 md:h-28 object-contain opacity-80 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] ${animClass}`}
    />
  </div>
);

export default function Game({ currentUser }) {
  const navigate = useNavigate();

  const rect37Url = encodeURI("/Rectangle 37.svg");
  const rect18Url = encodeURI("/Rectangle 18.svg");

  const {
    activeKey,
    setActiveKey,
    level,
    awaitingStart,
    startPrompt,
    dropKey,
    lastTime,
    lastMissed,
    bestTime,
    roundTimes,
    timeToNextDrop,
    forceMiss,
    handleInput,
  } = useGame({
    TOTAL_ROUNDS: 5,
    onFinish: (rounds, finalBestTime) => {
      navigate("/result", {
        state: {
          rounds,
          bestTime: finalBestTime,
          played: true,
          kfid:
            currentUser && typeof currentUser.kfid === "string"
              ? currentUser.kfid
              : "",
        },
      });
    },
  });

  const handleInputRef = useRef(handleInput);
  const forceMissRef = useRef(forceMiss);
  const pressedKeysRef = useRef(new Set());

  useEffect(() => {
    handleInputRef.current = handleInput;
  }, [handleInput]);

  useEffect(() => {
    forceMissRef.current = forceMiss;
  }, [forceMiss]);

  useEffect(() => {
    const pressedKeys = pressedKeysRef.current;

    const onKeyDown = (event) => {
      const key = String(event.key).toLowerCase();
      if (!KEYS.includes(key)) return;

      if (event.repeat) return;

      pressedKeys.add(key);
      if (pressedKeys.size >= 2) {
        setActiveKey(null);
        forceMissRef.current();
        return;
      }

      setActiveKey(key);
      handleInputRef.current(key);
    };

    const onKeyUp = (event) => {
      const key = String(event.key).toLowerCase();
      if (!KEYS.includes(key)) return;
      pressedKeys.delete(key);

      const remaining = Array.from(pressedKeys);
      setActiveKey(remaining.length === 1 ? remaining[0] : null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      pressedKeys.clear();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setActiveKey]);

  const formatRound = (value) => {
    if (typeof value === "number") return `${Math.round(value)} ms`;
    if (value === "missed") return "MISSED";
    return "--";
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center bg-no-repeat overflow-hidden font-['Stardos_Stencil'] text-[#f2e6d9]"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes flicker {
          0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100% { opacity: 1; text-shadow: 0 0 8px rgba(207,123,68,0.45); }
          20%, 21.9%, 63%, 63.9%, 65%, 69.9% { opacity: 0.8; text-shadow: none; }
        }
        @keyframes bottleFall {
          0% { transform: translateY(-120px) rotate(-12deg); opacity: 0.85; }
          100% { transform: translateY(0) rotate(8deg); opacity: 1; }
        }
        @keyframes bottleIdle {
          0%,100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-5px) rotate(6deg); }
        }
        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-flicker { animation: flicker 3.2s infinite alternate; }
        .bottle-fall { animation: bottleFall 0.8s ease-out forwards; }
        .bottle-idle { animation: bottleIdle 2.6s ease-in-out infinite; }
        .panel-glow { box-shadow: 0 12px 32px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(207,123,68,0.08); }
      `}</style>

      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />

      <ScrewDecoration
        style={{ top: "-10px", left: "-10px" }}
        animClass="animate-spin-18"
      />
      <ScrewDecoration
        style={{ top: "-10px", right: "-10px" }}
        animClass="animate-spin-22"
      />
      <ScrewDecoration
        style={{ bottom: "-10px", left: "-10px" }}
        animClass="animate-spin-14"
      />
      <ScrewDecoration
        style={{ bottom: "-10px", right: "-10px" }}
        animClass="animate-spin-10"
      />

      <div className="relative z-10 h-full px-4 py-3 flex flex-col items-center overflow-hidden">
        <div className="w-full flex justify-center pt-1 pb-2 anim-float">
          <img
            src={kiitfestImg}
            alt="KIITFest"
            className="w-44 md:w-56 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div className="text-center mb-3 px-3">
          <h1 className="text-3xl md:text-5xl font-black tracking-[0.18em] text-[#f2e6d9] drop-shadow-[0_5px_6px_rgba(0,0,0,0.75)]">
            REACTION GAME
          </h1>
        </div>

        <div className="w-full max-w-6xl bg-[#0a0604]/72 border border-[#8c5e3c]/50 rounded-3xl backdrop-blur-md p-4 md:p-6 shadow-2xl panel-glow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {[
              { title: "ROUND", value: `${level}/5`, isMiss: false },
              {
                title: "NEXT DROP",
                value:
                  timeToNextDrop == null
                    ? "--"
                    : `${Math.ceil(timeToNextDrop / 1000)}s`,
                isMiss: false,
              },
              {
                title: "LAST HIT",
                value:
                  typeof lastTime === "number"
                    ? `${Math.round(lastTime)} ms`
                    : lastMissed
                      ? "MISS"
                      : "--",
                isMiss: lastMissed,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="relative h-22 md:h-24 transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={rect37Url}
                  alt={card.title}
                  className="w-full h-full object-fill"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs md:text-sm tracking-[0.24em] text-[#d9a067] uppercase font-bold">
                    {card.title}
                  </div>
                  <div
                    className={`text-xl md:text-3xl font-black mt-1 ${card.isMiss ? "text-red-400" : "text-white"}`}
                  >
                    {card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-6 min-h-12 flex items-center justify-center">
            <div className="px-8 py-2 rounded-full bg-black/40 border border-[#8c5e3c]/45 inline-flex items-center justify-center min-h-12.5">
              <h2
                className={`text-lg md:text-2xl anim-flicker ${lastMissed && !dropKey ? "text-red-400" : "text-[#ffbf75]"}`}
              >
                {awaitingStart
                  ? startPrompt
                  : dropKey
                    ? `PRESS [ ${dropKey.toUpperCase()} ]`
                    : lastMissed
                      ? "MISSED! STAY SHARP"
                      : "GET READY..."}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-10 mb-4">
            {KEYS.map((keyLabel) => {
              const isTarget = dropKey === keyLabel && !awaitingStart;
              const isPressed = activeKey === keyLabel;
              return (
                <div
                  key={keyLabel}
                  className={`flex flex-col items-center rounded-xl py-2 transition-colors ${isTarget ? "bg-[#8c5e3c]/15" : "bg-black/15"}`}
                >
                  <button
                    onMouseDown={() => setActiveKey(keyLabel)}
                    onMouseUp={() => setActiveKey(null)}
                    onMouseLeave={() => setActiveKey(null)}
                    onClick={() => handleInput(keyLabel)}
                    className={`relative w-20 h-20 md:w-28 md:h-28 transition-transform duration-150 active:scale-90 hover:scale-105 cursor-pointer ${isPressed ? "scale-95" : ""}`}
                    aria-label={`key-${keyLabel}`}
                  >
                    <img
                      src={rect18Url}
                      alt={`${keyLabel}-button`}
                      className={`absolute inset-0 w-full h-full object-fill ${isTarget ? "brightness-125" : ""}`}
                    />
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-black ${isTarget ? "text-white" : "text-[#d9a067]"}`}
                    >
                      {keyLabel.toUpperCase()}
                    </span>
                  </button>

                  <div className="relative mt-5 h-40 md:h-56 w-full flex items-end justify-center">
                    <div className="absolute top-0 w-px h-full bg-linear-to-b from-[#8c5e3c]/50 to-transparent" />
                    <img
                      src={bottleImg}
                      alt={`${keyLabel}-bottle`}
                      className={`w-20 md:w-28 h-auto drop-shadow-[0_18px_20px_rgba(0,0,0,0.9)] ${isTarget ? "bottle-fall" : "bottle-idle opacity-45 grayscale-[0.45]"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fixed top-6 right-5 z-60 w-64 md:w-72 lg:w-80 border border-[#8c5e3c]/45 rounded-xl bg-[#0a0604]/78 backdrop-blur-md overflow-hidden panel-glow">
          <div className="px-4 py-2 border-b border-[#8c5e3c]/35 text-[#d9a067] font-bold text-center tracking-widest uppercase text-sm">
            Round Results
          </div>
          <div className="max-h-64 overflow-auto">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="px-4 py-2 flex items-center justify-between border-b border-[#8c5e3c]/20 text-sm"
              >
                <span className="text-[#d9a067]">Round {idx + 1}</span>
                <span
                  className={
                    roundTimes[idx] === "missed"
                      ? "text-red-400 font-bold"
                      : "text-white"
                  }
                >
                  {formatRound(roundTimes[idx])}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-center text-[#ffbf75] text-sm font-bold">
            Best:{" "}
            {typeof bestTime === "number" ? `${Math.round(bestTime)} ms` : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}
