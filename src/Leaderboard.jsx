import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import kiitfestImg from "./assets/kiitfest-main-logo20.png";

export default function Leaderboard({ currentUser }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard?page=${page}`);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            setLeaderboard(json.data);
            if (json.totalPages) setTotalPages(json.totalPages);
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [page]);

  const rows =
    leaderboard.length > 0
      ? leaderboard.map((entry) => ({
          rank: entry.rank,
          name: entry.name || "--",
          kfid: entry.kfid || "",
          bestTime:
            entry.bestTime != null ? `${Math.round(entry.bestTime)} ms` : "--",
        }))
      : Array.from({ length: 10 }).map((_, idx) => ({
          rank: (page - 1) * 10 + idx + 1,
          name: "--",
          kfid: "",
          bestTime: "--",
        }));

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
        .anim-float { animation: float 6s ease-in-out infinite; }
        .glass-panel { background: rgba(0, 0, 0, 0.58); backdrop-filter: blur(8px); border: 1px solid rgba(140, 94, 60, 0.3); }
      `}</style>

      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/45 to-black/80" />

      <div className="relative z-10 w-full min-h-screen px-4 py-6 flex flex-col items-center">
        <div className="mb-6 anim-float">
          <img
            src={kiitfestImg}
            alt="logo"
            className="w-48 md:w-64 h-auto cursor-pointer"
            onClick={() => navigate("/home")}
          />
        </div>

        <div className="w-full max-w-5xl glass-panel rounded-4xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-[#8c5e3c]/50 rounded-lg text-[#d9a067] hover:bg-[#8c5e3c]/20 transition-colors cursor-pointer tracking-widest"
            >
              &larr; BACK
            </button>
            <h1 className="text-3xl md:text-5xl font-black tracking-wider text-[#ffbf75]">
              LEADERBOARD
            </h1>
            <div className="w-[100px]"></div>
          </div>

          <div className="rounded-2xl border border-[#8c5e3c]/55 bg-black/45 overflow-hidden">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-black/30 text-[#d9a067] uppercase tracking-[0.2em] text-[11px] md:text-xs">
                  <th className="py-3 px-3 text-left">Rank</th>
                  <th className="py-3 px-3 text-left">Name</th>
                  <th className="py-3 px-3 text-right">Best Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isCurrent =
                    currentUser &&
                    currentUser.kfid &&
                    row.kfid &&
                    row.kfid.toUpperCase() === currentUser.kfid.toUpperCase();
                  return (
                    <tr
                      key={row.rank}
                      className={`border-t border-[#8c5e3c]/30 hover:bg-white/5 transition-colors ${
                        isCurrent ? "bg-[#8c5e3c]/40" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-white font-bold">
                        {row.rank}
                      </td>
                      <td className="py-2.5 px-3 text-white tracking-widest">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#ffbf75] font-bold">
                        {row.bestTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border rounded-lg tracking-widest transition-colors ${
                page === 1
                  ? "border-[#8c5e3c]/30 text-[#8c5e3c]/50 cursor-not-allowed"
                  : "border-[#8c5e3c]/50 text-[#d9a067] hover:bg-[#8c5e3c]/20 cursor-pointer"
              }`}
            >
              PREV
            </button>
            <div className="text-[#d9a067] tracking-widest">
              PAGE {page} OF {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-4 py-2 border rounded-lg tracking-widest transition-colors ${
                page >= totalPages
                  ? "border-[#8c5e3c]/30 text-[#8c5e3c]/50 cursor-not-allowed"
                  : "border-[#8c5e3c]/50 text-[#d9a067] hover:bg-[#8c5e3c]/20 cursor-pointer"
              }`}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
