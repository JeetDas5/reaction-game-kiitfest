import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import kiitfestImg from "./assets/kiitfest-main-logo20.png";

const ADMIN_KFIDS = new Set(["KF21368024", "KF54681124", "KF43781148"]);

export default function Admin({ currentUser }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState({}); // kfid -> bool
  const [filterGoodies, setFilterGoodies] = useState("all"); // "all" | "received" | "pending"

  const adminKfid = currentUser?.kfid?.toUpperCase?.() || "";
  const isAdmin = ADMIN_KFIDS.has(adminKfid);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/players", {
        headers: { "x-admin-kfid": adminKfid },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to load players");
      }
      const json = await res.json();
      setPlayers(json.data || []);
    } catch (e) {
      setError(e.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [adminKfid]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchPlayers();
  }, [isAdmin, fetchPlayers]);

  const toggleGoodies = async (kfid, newValue) => {
    setUpdating((prev) => ({ ...prev, [kfid]: true }));
    try {
      const res = await fetch(`/api/admin/players/${kfid}/goodies`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-kfid": adminKfid,
        },
        body: JSON.stringify({ receivedGoodies: newValue }),
      });
      if (!res.ok) throw new Error("Update failed");
      const json = await res.json();
      setPlayers((prev) =>
        prev.map((p) =>
          p.kfid === kfid ? { ...p, receivedGoodies: json.receivedGoodies } : p
        )
      );
    } catch {
      // Revert
      setPlayers((prev) =>
        prev.map((p) =>
          p.kfid === kfid ? { ...p, receivedGoodies: !newValue } : p
        )
      );
    } finally {
      setUpdating((prev) => ({ ...prev, [kfid]: false }));
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const filteredPlayers = players
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.kfid.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
    })
    .filter((p) => {
      if (filterGoodies === "received") return p.receivedGoodies;
      if (filterGoodies === "pending") return !p.receivedGoodies;
      return true;
    });

  const receivedCount = players.filter((p) => p.receivedGoodies).length;
  const pendingCount = players.length - receivedCount;

  // ── Not admin ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-['Stardos_Stencil'] text-[#f2e6d9]"
        style={{
          backgroundImage: "url(/assets/bg2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 text-center px-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-black tracking-widest text-[#ff6b6b] mb-3">
            ACCESS DENIED
          </h1>
          <p className="text-[#d9a067] tracking-widest mb-8">
            You are not authorised to view this page.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 border border-[#8c5e3c]/60 rounded-xl text-[#d9a067] hover:bg-[#8c5e3c]/20 transition-all tracking-widest cursor-pointer"
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

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
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .anim-float { animation: float 6s ease-in-out infinite; }
        .glass-panel { background: rgba(0,0,0,0.60); backdrop-filter: blur(10px); border: 1px solid rgba(140,94,60,0.35); }
        .glass-card  { background: rgba(0,0,0,0.45); backdrop-filter: blur(6px);  border: 1px solid rgba(140,94,60,0.25); }

        /* Custom checkbox */
        .goodies-cb { appearance: none; -webkit-appearance: none; width: 22px; height: 22px;
          border: 2px solid rgba(140,94,60,0.6); border-radius: 6px; cursor: pointer;
          transition: all .2s; background: rgba(0,0,0,0.4); flex-shrink: 0; }
        .goodies-cb:checked { background: #22c55e; border-color: #22c55e; }
        .goodies-cb:checked::after { content: '✓'; display: block; color: white;
          font-size: 14px; text-align: center; line-height: 18px; font-weight: bold; }
        .goodies-cb:disabled { opacity: 0.5; cursor: not-allowed; }
        .goodies-cb:not(:disabled):hover { border-color: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.4); }

        /* Search */
        .admin-input { background: rgba(0,0,0,0.5); border: 1px solid rgba(140,94,60,0.4);
          color: #f2e6d9; outline: none; border-radius: 10px; padding: 8px 14px; }
        .admin-input:focus { border-color: rgba(217,160,103,0.7); box-shadow: 0 0 0 2px rgba(217,160,103,0.15); }
        .admin-input::placeholder { color: rgba(242,230,217,0.3); }

        /* Row hover */
        .player-row { transition: background 0.15s; }
        .player-row:hover { background: rgba(140,94,60,0.12) !important; }
      `}</style>

      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/45 to-black/80" />

      <div className="relative z-10 w-full min-h-screen px-4 py-6 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 anim-float">
          <img
            src={kiitfestImg}
            alt="KIITFest logo"
            className="w-40 md:w-56 h-auto cursor-pointer"
            onClick={() => navigate("/home")}
          />
        </div>

        <div className="w-full max-w-6xl glass-panel rounded-3xl p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-[#8c5e3c]/50 rounded-lg text-[#d9a067] hover:bg-[#8c5e3c]/20 transition-colors cursor-pointer tracking-widest text-sm"
            >
              ← BACK
            </button>
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-black tracking-wider text-[#ffbf75]">
                ADMIN PANEL
              </h1>
              <p className="text-[#d9a067]/70 text-xs tracking-[0.2em] mt-1">
                GOODIES DISTRIBUTION TRACKER
              </p>
            </div>
            <button
              onClick={fetchPlayers}
              disabled={loading}
              className="px-4 py-2 border border-[#8c5e3c]/50 rounded-lg text-[#d9a067] hover:bg-[#8c5e3c]/20 transition-colors cursor-pointer tracking-widest text-sm disabled:opacity-50"
            >
              {loading ? "..." : "↺ REFRESH"}
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "TOTAL", value: players.length, color: "#ffbf75" },
              { label: "RECEIVED", value: receivedCount, color: "#22c55e" },
              { label: "PENDING", value: pendingCount, color: "#f97316" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-xl py-3 px-4 text-center"
              >
                <div
                  className="text-2xl md:text-3xl font-black"
                  style={{ color: s.color }}
                >
                  {loading ? "—" : s.value}
                </div>
                <div className="text-[10px] tracking-[0.2em] text-[#d9a067]/70 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              placeholder="Search by KFID or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input flex-1 min-w-[180px] text-sm tracking-widest"
            />
            <div className="flex gap-2">
              {["all", "received", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterGoodies(f)}
                  className={`px-4 py-2 rounded-lg text-xs tracking-widest border transition-all cursor-pointer ${
                    filterGoodies === f
                      ? "bg-[#8c5e3c]/50 border-[#d9a067] text-[#ffbf75]"
                      : "border-[#8c5e3c]/40 text-[#d9a067]/70 hover:border-[#d9a067]/50"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="text-center py-8 text-[#ff6b6b] tracking-widest">
              ⚠ {error}
            </div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <div className="text-center py-12 text-[#d9a067]/60 tracking-[0.3em] text-sm animate-pulse">
              LOADING PLAYERS…
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="rounded-2xl border border-[#8c5e3c]/40 bg-black/35 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/40 text-[#d9a067] uppercase tracking-[0.18em] text-[10px] md:text-xs">
                    <th className="py-3 px-4 text-left w-8">#</th>
                    <th className="py-3 px-4 text-left">KFID</th>
                    <th className="py-3 px-4 text-left">NAME</th>
                    <th className="py-3 px-4 text-right hidden md:table-cell">
                      BEST TIME
                    </th>
                    <th className="py-3 px-4 text-center">GOODIES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-[#d9a067]/40 tracking-widest text-sm"
                      >
                        No players found
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player, idx) => (
                      <tr
                        key={player.kfid}
                        className={`player-row border-t border-[#8c5e3c]/25 ${
                          player.receivedGoodies ? "bg-green-900/10" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-[#d9a067]/50 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#ffbf75] font-bold tracking-wider text-xs md:text-sm">
                          {player.kfid}
                        </td>
                        <td className="py-3 px-4 text-white tracking-wide">
                          {player.name || (
                            <span className="text-white/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-[#d9a067] hidden md:table-cell">
                          {player.bestTime != null
                            ? `${Math.round(player.bestTime)} ms`
                            : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              id={`goodies-${player.kfid}`}
                              checked={player.receivedGoodies}
                              disabled={!!updating[player.kfid]}
                              onChange={(e) =>
                                toggleGoodies(player.kfid, e.target.checked)
                              }
                              className="goodies-cb"
                              title={
                                player.receivedGoodies
                                  ? "Goodies received ✓"
                                  : "Mark as received"
                              }
                            />
                            {updating[player.kfid] && (
                              <span className="text-[#d9a067]/50 text-xs animate-pulse">
                                …
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && !error && filteredPlayers.length > 0 && (
            <div className="mt-4 text-center text-[#d9a067]/40 text-[10px] tracking-[0.2em]">
              SHOWING {filteredPlayers.length} OF {players.length} PLAYERS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
