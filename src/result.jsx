import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import kiitfestImg from "./assets/kiitfest-main-logo20.png";

const TOTAL_ROUNDS = 5;

export default function Result({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [roundTimes, setRoundTimes] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const rect37Url = encodeURI("/Rectangle 37.svg");

  function normalizeRounds(rt) {
    try {
      if (typeof rt === "string") {
        const trimmed = rt.trim();
        if (
          (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
          trimmed.startsWith('"')
        ) {
          rt = JSON.parse(rt);
        }
      }
    } catch {
      rt = null;
    }

    if (Array.isArray(rt) && rt.length === 1 && Array.isArray(rt[0]))
      rt = rt[0];
    if (!Array.isArray(rt)) return Array(TOTAL_ROUNDS).fill(null);

    const out = rt.slice(0, TOTAL_ROUNDS).map((value) => {
      if (value == null) return null;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const numeric = Number(value);
        return Number.isNaN(numeric) ? value : numeric;
      }
      if (typeof value === "object") {
        if (typeof value.time === "number") return value.time;
        if (typeof value.value === "string") return value.value;
        return value;
      }
      return null;
    });

    while (out.length < TOTAL_ROUNDS) out.push(null);
    return out;
  }

  useEffect(() => {
    (async () => {
      const st = (location && location.state) || {};
      const params = new URLSearchParams(
        location.search || window.location.search
      );
      const queryKfid = params.get("kfid") || params.get("roll");
      const hasKfid = Boolean(queryKfid);
      const hasPlayedData =
        Boolean(st.played) ||
        Array.isArray(st.rounds) ||
        typeof st.bestTime === "number";

      if (!hasPlayedData && !hasKfid) {
        navigate("/game", { replace: true });
        return;
      }

      const fetchRank = async (time) => {
        try {
          const rankRes = await fetch(`/api/rank?time=${time}`);
          if (rankRes.ok) {
            const rankData = await rankRes.json();
            setMyRank(rankData.rank);
          }
        } catch {}
      };

      if (st && (st.rounds || st.bestTime || st.kfid || st.roll)) {
        if (st.rounds) setRoundTimes(normalizeRounds(st.rounds));
        if (typeof st.bestTime === "number") {
          setBestTime(st.bestTime);
          await fetchRank(st.bestTime);
        }
        return;
      }

      const kfid = queryKfid;
      if (kfid) {
        try {
          const myRes = await fetch(
            `/api/my-rounds?kfid=${encodeURIComponent(kfid)}`
          );
          if (myRes.ok) {
            const payload = await myRes.json();
            if (payload && payload.rounds)
              setRoundTimes(normalizeRounds(payload.rounds));
            if (payload && typeof payload.bestTime === "number") {
              setBestTime(payload.bestTime);
              await fetchRank(payload.bestTime);
            }
            return;
          }
        } catch {
          // ignore and fallback
        }
      }

      setRoundTimes(null);
      setBestTime(null);
    })();
  }, [location, navigate]);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      try {
        sessionStorage.removeItem("kf_current_user");
      } catch(error) {
        console.log("Something went wrong", error)
      }
      navigate("/", { replace: true });
    }, 30000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  const numericTimes = (roundTimes || []).filter((r) => typeof r === "number");
  const avg = numericTimes.length
    ? Math.round(numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length)
    : null;

  const handleRestart = () => {
    try {
      sessionStorage.removeItem("kf_current_user");
    } catch(error) {
      console.log("Something went wrong", error)
    }
    navigate("/", { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden font-['Stardos_Stencil'] text-[#f2e6d9]"
      style={{
        backgroundImage: "url(/assets/bg2.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-flicker { animation: flicker 3.2s ease-in-out infinite; }
        .glass-panel { background: rgba(0, 0, 0, 0.58); backdrop-filter: blur(8px); border: 1px solid rgba(140, 94, 60, 0.3); }
      `}</style>

      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/45 to-black/80" />

      <div className="relative z-10 w-full min-h-screen px-4 py-6 flex flex-col items-center">
        <div className="mb-6 anim-float">
          <img src={kiitfestImg} alt="logo" className="w-48 md:w-64 h-auto" />
        </div>

        <div className="w-full max-w-5xl glass-panel rounded-4xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-wider text-[#ffbf75] anim-flicker">
              GAME OVER
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-7">
            {[
              {
                title: "MY RANK",
                value: myRank == null ? "--" : String(myRank),
              },
              {
                title: "BEST TIME",
                value: bestTime == null ? "--" : `${Math.round(bestTime)} ms`,
              },
              { title: "AVERAGE", value: avg == null ? "--" : `${avg} ms` },
            ].map((card) => (
              <div key={card.title} className="relative">
                <img
                  src={rect37Url}
                  alt={card.title}
                  className="w-full h-22 md:h-24 object-fill"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs md:text-sm tracking-[0.28em] text-[#d9a067]/85 uppercase">
                    {card.title}
                  </div>
                  <div className="text-xl md:text-3xl font-black text-white mt-1">
                    {card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-6">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-[#8c5e3c]/80 hover:bg-[#8c5e3c] border border-[#ffbf75]/40 text-[#ffbf75] text-lg md:text-xl font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-widest uppercase cursor-pointer"
            >
              Restart Game
            </button>
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-8 py-3 bg-black/60 hover:bg-black/80 border border-[#8c5e3c]/60 text-[#d9a067] text-lg md:text-xl font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-widest uppercase cursor-pointer"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
