import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import warehouseImg from "./assets/newbg2.png";
import kiitfestImg from "./assets/kiitfest-main-logo 20.png";
import midimg from "./assets/mid.png";
import screw from "./assets/screw.png"; 

const ScrewDecoration = ({ style, animClass }) => (
  <div className="pointer-events-none absolute z-50" style={style}>
    <img 
      src={screw} 
      alt="Screw" 
      className={`w-20 h-20 md:w-28 md:h-28 object-contain opacity-80 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] ${animClass}`} 
    />
  </div>
);

export default function Authenticate() {
  const [formData, setFormData] = useState({ kfid: "" });
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const screwOffset = "-10px";
  const logoTop = "20px";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    navigate("/home"); 
  };

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 20, 
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          setFormData({ kfid: decodedText });
          scanner.clear();
          setShowScanner(false);
          setTimeout(() => {
            navigate("/home");
          }, 800); 
        },
        (error) => { /* scanning... */ }
      );
    }

    return () => {
      if (scanner) scanner.clear().catch((err) => console.error(err));
    };
  }, [showScanner, navigate]);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center bg-no-repeat overflow-hidden font-['Stardos_Stencil']"
      style={{ backgroundImage: `url(${warehouseImg})` }}
    >
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        
        @keyframes flicker {
          0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(116,79,56,0.5); }
          20%, 21.9%, 63%, 63.9%, 65%, 69.9% { opacity: 0.7; text-shadow: none; }
        }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes bgPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-flicker { animation: flicker 3s infinite alternate; }

        .scanner-line {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: rgba(207, 123, 68, 0.8);
          box-shadow: 0 0 15px rgba(207, 123, 68, 1);
          animation: scanline 2s linear infinite;
          z-index: 10;
        }

        .btn-active-glow {
          box-shadow: 0 0 20px rgba(116, 79, 56, 0.4);
          transition: all 0.3s ease;
        }

        .btn-active-glow:hover {
          box-shadow: 0 0 30px rgba(207, 123, 68, 0.6);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Breathing Background Layer */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ animation: 'bgPulse 8s infinite ease-in-out' }}></div>

      {/* --- LOGO --- */}
      <div className="absolute top-0 left-0 w-full flex justify-center z-50 anim-float" style={{ paddingTop: logoTop }}>
        <img src={kiitfestImg} alt="KIIT Fest Logo" className="w-48 md:w-56 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
      </div>

      {/* --- SCREWS --- */}
      <ScrewDecoration style={{ top: screwOffset, left: screwOffset }} animClass="animate-[spin_18s_linear_infinite]" />
      <ScrewDecoration style={{ top: screwOffset, right: screwOffset }} animClass="animate-[spin_22s_linear_infinite_reverse]" />
      <ScrewDecoration style={{ bottom: screwOffset, left: screwOffset }} animClass="animate-[spin_14s_linear_infinite_reverse]" />
      <ScrewDecoration style={{ bottom: screwOffset, right: screwOffset }} animClass="animate-[spin_10s_linear_infinite]" />

      {/* --- FORM CENTER --- */}
      <div className="w-full h-full flex items-center justify-center relative z-20">
        <div
          className="relative flex items-center justify-center bg-contain bg-center bg-no-repeat w-[95%] max-w-[750px] h-[450px] transition-all duration-500 hover:brightness-110"
          style={{ backgroundImage: `url(${midimg})` }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 mb-4 relative z-10">
            <h1 className="text-4xl md:text-5xl text-black font-bold tracking-[0.2em] anim-flicker uppercase">
              Enter KFID
            </h1>

            <div className="relative flex items-center group">
              <input
                type="text"
                name="kfid"
                value={formData.kfid}
                onChange={handleChange}
                placeholder="KFID"
                required
                className="w-80 h-14 rounded-full px-8 bg-white/95 border-2 border-stone-400 text-black font-bold text-lg outline-none placeholder-stone-400 uppercase shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all focus:border-[#744F38] focus:shadow-[0_0_15px_rgba(116,79,56,0.3)]"
              />
              
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="absolute right-2 p-2.5 bg-[#744F38] rounded-full hover:bg-[#cf7b44] active:scale-90 transition-all shadow-lg hover:shadow-[#cf7b44]/40 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              style={{ animation: formData.kfid.length > 0 ? 'shake 0.5s infinite' : 'none' }}
              className={`w-52 h-14 rounded-full bg-[#744F38] text-white text-2xl font-bold tracking-widest transition-all border-b-4 border-[#3a261a] active:border-b-0 active:translate-y-1 btn-active-glow uppercase`}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* --- SCANNER MODAL --- */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-stone-300 p-6 rounded-3xl border-4 border-[#744F38] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="scanner-line"></div>
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 text-[#744F38] font-black text-xl hover:text-[#cf7b44] transition-colors z-20"
            >
              ✕
            </button>
            <h2 className="text-center text-[#744F38] font-black tracking-widest mb-4">ENCRYPTION SCANNER</h2>
            <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-stone-400 bg-black shadow-inner"></div>
            <div className="flex items-center justify-center gap-4 mt-6">
               <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse"></div>
               <p className="text-[#744F38] font-bold tracking-[0.3em] text-sm animate-pulse">INITIALIZING OPTICS...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}      