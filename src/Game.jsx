import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGame from "./hooks/useGame";
import gameBg from "./assets/bg2.png";
import bottleImage from "./assets/bottle1.png";
import kiitfestImg from "./assets/kiitfest-main-logo 20.png";

export default function Game({ currentUser }) {
  const navigate = useNavigate();

  const rect37Url = encodeURI("/Rectangle 37.svg");
  const rect18Url = encodeURI("/Rectangle 18.svg");
  const logoUrl = encodeURI("/kiitfest-main-logo 3.svg");
  const currentKfid = currentUser && currentUser.kfid ? currentUser.kfid : "";

  const {
    level,
    awaitingStart,
    startPrompt,
    dropKey,
    lastTime,
    lastMissed,
    bestTime,
    roundTimes,
    timeToNextDrop,
    handleInput,
  } = useGame({
    TOTAL_ROUNDS: 5,
    onFinish: (rounds, finalBestTime) => {
      navigate("/result", {
        state: {
          rounds,
          bestTime: finalBestTime,
          played: true,
          kfid: currentKfid,
        },
      });
    },
  });

  const handleInputRef = useRef(handleInput);
  useEffect(() => {
    handleInputRef.current = handleInput;
  }, [handleInput]);

  useEffect(() => {
    const onKeyDown = (e) => handleInputRef.current(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const formatRoundValue = (value) => {
    if (typeof value === "number") return `${Math.round(value)}ms`;
    if (value === "missed") return <span className="text-red-400">Missed</span>;
    return <span className="opacity-30">--</span>;
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden font-['Stardos_Stencil'] text-[#f2e6d9] selection:bg-[#8c5e3c]"
      style={{
        backgroundImage: `url(${gameBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes bottleDropToGround { 
          0% { transform: translateY(-130px) rotate(-15deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(0px) rotate(5deg); opacity: 1; }
        }
        @keyframes bottleIdle { 0%, 100% { transform: translateY(0px) rotate(-5deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
        .anim-float { animation: float 5s ease-in-out infinite; }
        .anim-flicker { animation: flicker 2s ease-in-out infinite; }
        .bottle-fall-ground { animation: bottleDropToGround 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .bottle-idle { animation: bottleIdle 3s ease-in-out infinite; }
        .glass-panel { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(140, 94, 60, 0.3); }
      `}</style>

      {/* Overlay for Atmosphere */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80 pointer-events-none" />

      <div className="relative z-10 w-full h-full min-h-screen px-4 py-6 flex flex-col items-center">
        {/* Header Logo */}
        <div className="mb-8 anim-float">
          <img
            src={kiitfestImg}
            alt="logo"
            className="w-48 md:w-64 drop-shadow-[0_0_25px_rgba(217,160,103,0.3)]"
          />
        </div>

        {/* Main Console */}
        <div className="relative w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Side Panel: Leaderboard/Timing */}
          <div className="w-full lg:w-64 glass-panel rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
            <div className="px-4 py-3 bg-[#8c5e3c]/20 border-b border-[#8c5e3c]/30 text-[#d9a067] font-bold text-center tracking-widest uppercase text-sm">
              Session History
            </div>
            <table className="w-full text-sm">
              <tbody>
                {roundTimes.map((value, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#8c5e3c]/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-[#d9a067]/70">
                      Round {index + 1}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {formatRoundValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-black/40 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d9a067]/50 mb-1">
                Personal Best
              </p>
              <span className="text-xl text-[#ffbf75]">
                {typeof bestTime === "number"
                  ? `${Math.round(bestTime)}ms`
                  : "--"}
              </span>
            </div>
          </div>

          {/* Center Stage */}
          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="glass-panel rounded-4xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
                {[
                  { title: "ROUND", value: `${level}/5` },
                  {
                    title: "NEXT DROP",
                    value:
                      timeToNextDrop == null
                        ? "--"
                        : `${Math.ceil(timeToNextDrop / 1000)}s`,
                  },
                  {
                    title: "LAST HIT",
                    value:
                      typeof lastTime === "number"
                        ? `${Math.round(lastTime)}ms`
                        : lastMissed
                          ? "MISS"
                          : "--",
                  },
                ].map((card) => (
                  <div key={card.title} className="relative group">
                    <img
                      src={rect37Url}
                      className="w-full h-20 md:h-24 object-fill opacity-80 group-hover:opacity-100 transition-opacity"
                      alt=""
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] md:text-xs tracking-[0.3em] text-[#d9a067]/80 uppercase">
                        {card.title}
                      </span>
                      <span className="text-xl md:text-3xl font-black text-[#f2e6d9] drop-shadow-md">
                        {card.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Prompt */}
              <div className="text-center mb-10">
                <div className="inline-flex px-8 py-2 rounded-full bg-black/40 border border-[#8c5e3c]/40 min-h-12.5 items-center justify-center">
                  <h2 className="text-lg md:text-2xl text-[#ffbf75] tracking-wide anim-flicker">
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

              {/* Interaction Zone */}
              <div className="grid grid-cols-3 gap-4 md:gap-12 relative">
                {["a", "s", "d"].map((keyLabel) => {
                  const isTarget = dropKey === keyLabel && !awaitingStart;
                  return (
                    <div key={keyLabel} className="flex flex-col items-center">
                      <button
                        onClick={() => handleInput(keyLabel)}
                        className={`relative w-20 h-20 md:w-28 md:h-28 transition-transform active:scale-90 ${isTarget ? "scale-110" : "opacity-70"}`}
                      >
                        <img
                          src={rect18Url}
                          className={`absolute inset-0 w-full h-full transition-filter duration-300 ${isTarget ? "brightness-125 sepia-[.5] drop-shadow-[0_0_15px_#d9a067]" : "grayscale-[0.3]"}`}
                          alt=""
                        />
                        <span
                          className={`absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-black ${isTarget ? "text-white" : "text-[#d9a067]"}`}
                        >
                          {keyLabel.toUpperCase()}
                        </span>
                      </button>

                      {/* Bottle Track */}
                      <div className="relative mt-8 h-48 w-full flex items-end justify-center">
                        <div className="absolute top-0 w-px h-full bg-linear-to-b from-[#8c5e3c]/50 to-transparent" />
                        <img
                          src={bottleImage}
                          alt="bottle"
                          className={`w-14 md:w-20 h-auto z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] 
                            ${isTarget ? "bottle-fall-ground" : "bottle-idle opacity-40 grayscale-[0.5]"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Logo */}
        <div className="mt-auto pt-10 w-full flex justify-end opacity-60 hover:opacity-100 transition-opacity">
          <img src={logoUrl} alt="brand" className="w-28 md:w-36" />
        </div>
      </div>
    </div>
  );
}
