/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Plus, Minus, RotateCcw, Settings, Monitor, Layout, Trophy, PartyPopper, Star } from 'lucide-react';

// --- Types & Constants ---

interface TeamState {
  name: string;
  short: string;
  runs: number;
  hits: number;
  errors: number;
  logo: string;
  lineScore: (number | null)[];
}

interface GameState {
  away: TeamState;
  home: TeamState;
  inning: number;
  isTop: boolean;
  balls: number;
  strikes: number;
  outs: number;
  bases: { 1: boolean; 2: boolean; 3: boolean };
  showScorebug: boolean;
  showHeader: boolean;
  showBoxScore: boolean;
  isFinal: boolean;
  headerTitle: string;
  headerSubtitle: string;
}

const INITIAL_STATE: GameState = {
  away: { name: "Equipo A", short: "EQA", runs: 0, hits: 0, errors: 0, logo: "🚩", lineScore: Array(9).fill(null) },
  home: { name: "Equipo B", short: "EQB", runs: 0, hits: 0, errors: 0, logo: "🏁", lineScore: Array(9).fill(null) },
  inning: 1, isTop: true, balls: 0, strikes: 0, outs: 0, bases: { 1: false, 2: false, 3: false },
  showScorebug: true,
  showHeader: true,
  showBoxScore: true,
  isFinal: false,
  headerTitle: "CLÁSICO MUNDIAL",
  headerSubtitle: "NARRACIÓN EN VIVO",
};

// --- Components ---

const ResponsiveOverlay = ({ children }: { children: React.ReactNode }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, scale: 1 });

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const baseWidth = 1920;
        const baseHeight = 1080;
        
        // Scale to fit width, but also consider height to avoid vertical overflow
        const scaleX = width / baseWidth;
        const scaleY = height / baseHeight;
        const scale = Math.min(scaleX, scaleY);
        
        setDimensions({ width, height, scale });
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen relative bg-transparent overflow-hidden flex items-center justify-center">
      <div 
        style={{ 
          width: '1920px', 
          height: '1080px', 
          position: 'relative',
          transform: `scale(${dimensions.scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
          flexShrink: 0
        }}
      >
        {children}
      </div>
    </div>
  );
};

const VictoryOverlay = ({ state, isPreview = false }: { state: GameState; isPreview?: boolean }) => {
  const winner = state.away.runs > state.home.runs ? state.away : state.home.runs > state.away.runs ? state.home : null;
  const isDraw = state.away.runs === state.home.runs;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center pointer-events-none`}
    >
      <div className="w-[450px] bg-[#0a1a2a]/98 border-2 border-wbc-gold rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] wbc-bevel pointer-events-auto relative">
        {/* Subtle Celebration Background */}
        <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-5 -left-5"><Star className="w-24 h-24 text-wbc-gold" /></motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-5 -right-5"><Star className="w-32 h-32 text-wbc-gold" /></motion.div>
        </div>

        <div className="wbc-gradient-red py-2 text-center border-b border-wbc-gold/30 relative z-10">
          <h2 className="sports-text text-lg italic tracking-[0.3em] text-white flex items-center justify-center gap-3">
            <PartyPopper className="w-4 h-4 text-wbc-gold" />
            FINAL
            <PartyPopper className="w-4 h-4 text-wbc-gold" />
          </h2>
        </div>
        
        <div className="p-6 flex flex-col items-center gap-4 bg-gradient-to-b from-transparent to-black/60 relative z-10">
          {isDraw ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-8">
                <TeamLogo logo={state.away.logo} className="w-16 h-16 text-5xl" />
                <div className="sports-text text-3xl text-white italic">EMPATE</div>
                <TeamLogo logo={state.home.logo} className="w-16 h-16 text-5xl" />
              </div>
              <div className="sports-text text-5xl text-wbc-gold">{state.away.runs} - {state.home.runs}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <TeamLogo logo={winner!.logo} className="w-24 h-24 flex items-center justify-center text-7xl drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Trophy className="w-8 h-8 text-wbc-gold drop-shadow-lg" />
                  </motion.div>
                </div>
                
                <div className="relative px-6 py-1">
                  <div className="absolute inset-0 bg-wbc-blue/80 skew-x-[-12deg] border-l-4 border-wbc-gold" />
                  <span className="relative sports-text text-2xl text-white italic tracking-widest uppercase z-10">
                    {winner!.name}
                  </span>
                </div>
              </motion.div>

              <div className="flex items-center gap-6 sports-text text-4xl">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-white/40 uppercase tracking-tighter mb-1">{state.away.short}</span>
                  <span className={state.away.runs > state.home.runs ? 'text-wbc-gold' : 'text-white/60'}>{state.away.runs}</span>
                </div>
                <div className="text-white/20 italic">-</div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-white/40 uppercase tracking-tighter mb-1">{state.home.short}</span>
                  <span className={state.home.runs > state.away.runs ? 'text-wbc-gold' : 'text-white/60'}>{state.home.runs}</span>
                </div>
              </div>

              <div className="w-full py-2 bg-wbc-gold/90 text-center rounded shadow-lg">
                <span className="sports-text text-sm text-wbc-blue font-bold tracking-[0.2em]">
                  VICTORIA PARA {winner!.name.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TeamLogo = ({ logo, className }: { logo: string; className?: string }) => {
  const isImage = logo.startsWith('data:') || logo.startsWith('http');
  if (isImage) {
    return <img src={logo} alt="Logo" className={`object-contain ${className}`} referrerPolicy="no-referrer" />;
  }
  return <span className={className}>{logo}</span>;
};

const BaseDiamond = ({ bases }: { bases: GameState['bases'] }) => (
  <div className="relative w-12 h-12 flex items-center justify-center rotate-45">
    <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 border border-white/40 ${bases[2] ? 'bg-amber-400' : 'bg-black/40'}`} />
    <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 border border-white/40 ${bases[3] ? 'bg-amber-400' : 'bg-black/40'}`} />
    <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 border border-white/40 ${bases[1] ? 'bg-amber-400' : 'bg-black/40'}`} />
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 border border-white/20 bg-white/10" />
  </div>
);

const BoxScore = ({ state }: { state: GameState }) => (
  <div className="w-full bg-[#0a1a2a]/95 border-2 border-wbc-gold/30 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
    {state.isFinal && (
      <div className="wbc-gradient-red py-2 text-center border-b border-white/20">
        <span className="sports-text text-xl italic tracking-[0.3em] text-white animate-pulse">
          FINALIZÓ EL PARTIDO
        </span>
      </div>
    )}
    <table className="w-full text-white sports-text">
      <thead>
        <tr className="bg-black/40 text-sm">
          <th className="p-3 text-left w-40"></th>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <th key={i} className="p-3 text-center font-normal opacity-80">{i}</th>
          ))}
          <th className="p-3 text-center border-l border-white/10">R</th>
          <th className="p-3 text-center">H</th>
          <th className="p-3 text-center">E</th>
          <th className="p-3 text-center text-wbc-gold border-l border-white/10">R</th>
          <th className="p-3 text-center text-wbc-gold">H</th>
          <th className="p-3 text-center text-wbc-gold">E</th>
        </tr>
      </thead>
      <tbody className="text-2xl italic">
        {(['away', 'home'] as const).map((t, idx) => (
          <tr key={t} className={idx === 0 ? 'border-b border-white/5' : ''}>
            <td className="p-3 flex items-center gap-3">
              <TeamLogo logo={state[t].logo} className="w-8 h-8 flex items-center justify-center text-3xl" />
              <span className="tracking-widest">{state[t].short}</span>
            </td>
            {state[t].lineScore.map((score, i) => {
              const isPassed = state.isFinal 
                ? (i + 1 <= state.inning)
                : (t === 'away' 
                    ? (state.inning > i + 1 || (state.inning === i + 1 && !state.isTop))
                    : (state.inning > i + 1));
              
              const displayValue = score !== null ? score : (isPassed ? 0 : '-');
              
              return (
                <td key={i} className="p-3 text-center tabular-nums opacity-90">
                  {displayValue}
                </td>
              );
            })}
            <td className="p-3 text-center tabular-nums border-l border-white/10 opacity-80">{state[t].runs}</td>
            <td className="p-3 text-center tabular-nums opacity-80">{state[t].hits}</td>
            <td className="p-3 text-center tabular-nums opacity-80">{state[t].errors}</td>
            <td className="p-3 text-center tabular-nums text-wbc-gold border-l border-white/10">{state[t].runs}</td>
            <td className="p-3 text-center tabular-nums text-wbc-gold">{state[t].hits}</td>
            <td className="p-3 text-center tabular-nums text-wbc-gold">{state[t].errors}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Scorebug = ({ state }: { state: GameState }) => (
  <div className="flex flex-col items-center w-full">
    {/* Main Bar */}
    <div className="w-full wbc-gradient-blue h-20 flex items-center relative shadow-2xl border-b-2 border-white/10 rounded-lg">
      {/* Left Team */}
      <div className="flex-1 flex items-center px-8 gap-4">
        <TeamLogo logo={state.away.logo} className="w-14 h-14 flex items-center justify-center text-5xl drop-shadow-lg" />
        <span className="sports-text text-3xl text-white italic tracking-widest">{state.away.name}</span>
        <span className="sports-text text-6xl text-white ml-auto tabular-nums">{state.away.runs}</span>
      </div>

      {/* Center Inning */}
      <div className="w-48 h-full flex flex-col items-center justify-center border-x border-white/10 bg-black/20">
        <span className="sports-text text-wbc-gold text-2xl tracking-[0.2em] italic">INNING</span>
        <div className="flex items-center gap-2">
          {state.isTop ? <ChevronUp className="w-6 h-6 text-wbc-gold" /> : <ChevronDown className="w-6 h-6 text-wbc-gold" />}
          <span className="sports-text text-5xl text-white tabular-nums">{state.inning}</span>
        </div>
      </div>

      {/* Right Team */}
      <div className="flex-1 flex items-center px-8 gap-4">
        <span className="sports-text text-6xl text-white tabular-nums">{state.home.runs}</span>
        <TeamLogo logo={state.home.logo} className="w-14 h-14 flex items-center justify-center text-5xl drop-shadow-lg ml-auto" />
        <span className="sports-text text-3xl text-white italic tracking-widest">{state.home.name}</span>
      </div>
    </div>

    {/* Bottom Red Bar */}
    <div className="w-[95%] wbc-gradient-red h-10 flex items-center justify-center shadow-lg relative rounded-b-lg">
      <span className="sports-text text-white text-xl tracking-[0.3em] italic">¡SUSCRÍBETE AL CANAL!</span>
    </div>
  </div>
);

const HeaderOverlay = ({ state }: { state: GameState }) => {
  const renderSubtitle = (text: string) => {
    if (!text) return "";
    const highlight = "EN VIVO";
    if (text.toUpperCase().includes(highlight)) {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part, i) => 
        part.toUpperCase() === highlight 
          ? <span key={i} className="text-wbc-gold">{part}</span> 
          : part
      );
    }
    return text;
  };

  return (
    <div className="w-full wbc-gradient-blue border-b-4 border-wbc-gold/30 h-16 flex items-center px-8 relative overflow-hidden shadow-2xl rounded-lg">
      {/* Trapezoid effect via clip-path */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-6 z-10">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
          <span className="text-2xl">⚾</span>
        </div>
        <h1 className="sports-text text-2xl text-white italic tracking-wider">
          {state.headerTitle || ""} <span className="mx-2 opacity-50 text-sm">|</span> {renderSubtitle(state.headerSubtitle)}
        </h1>
      </div>

      {/* Bases and BSO */}
      <div className="ml-auto flex items-center gap-10 z-10">
        <div className="scale-75 origin-right">
          <BaseDiamond bases={state.bases} />
        </div>
        
        <div className="flex items-center gap-6 border-l border-white/10 pl-6">
          {[
            { label: 'B', count: state.balls, max: 3, color: 'bg-emerald-400' },
            { label: 'S', count: state.strikes, max: 2, color: 'bg-wbc-gold' },
            { label: 'O', count: state.outs, max: 2, color: 'bg-wbc-red' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="sports-text text-sm text-wbc-gold">{item.label}</span>
              <div className="flex gap-1">
                {Array.from({ length: item.max }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full border border-white/20 ${item.count > i ? item.color : 'bg-black/40'}`} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('baseball_overlay_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.away) {
            // Merge with INITIAL_STATE to ensure new fields like showHeader exist
            const merged = { ...INITIAL_STATE, ...parsed };
            
            // Sanitize inning
            if (typeof merged.inning !== 'number' || merged.inning > 20 || merged.inning < 1) {
              merged.inning = 1;
            }
            return merged;
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse saved state", e);
    }
    return INITIAL_STATE;
  });

  const [isOverlayMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('overlay') === 'true';
    }
    return false;
  });

  const socketRef = React.useRef<WebSocket | null>(null);
  const lastSentStateRef = React.useRef<string>('');

  const stateRef = React.useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const connect = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to sync server");
        if (isOverlayMode) {
          socket.send(JSON.stringify({ type: 'REQUEST_STATE' }));
        } else {
          const stateStr = JSON.stringify(stateRef.current);
          lastSentStateRef.current = stateStr;
          socket.send(JSON.stringify({ type: 'UPDATE_STATE', state: stateRef.current }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'UPDATE_STATE' && data.state) {
            const mergedState = { ...INITIAL_STATE, ...data.state };
            const newStateStr = JSON.stringify(mergedState);
            // Only update if the state is actually different to prevent flickering/loops
            if (newStateStr !== JSON.stringify(stateRef.current)) {
              setState(mergedState);
              if (!isOverlayMode) {
                lastSentStateRef.current = newStateStr;
              }
            }
          }
        } catch (e) {
          console.error("Sync error", e);
        }
      };

      socket.onclose = () => {
        console.log("Disconnected, retrying...");
        setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isOverlayMode]);

  useEffect(() => {
    const stateStr = JSON.stringify(state);
    if (!isOverlayMode && socketRef.current?.readyState === WebSocket.OPEN) {
      // Only send if the state has actually changed from what we last sent/received
      if (stateStr !== lastSentStateRef.current) {
        lastSentStateRef.current = stateStr;
        socketRef.current.send(JSON.stringify({ type: 'UPDATE_STATE', state }));
      }
    }
    // Still save to localStorage as a local backup
    if (!isOverlayMode) {
      localStorage.setItem('baseball_overlay_state', stateStr);
    }
  }, [state, isOverlayMode]);

  const updateState = useCallback((updater: (prev: GameState) => GameState) => setState(prev => updater(prev)), []);

  const handleFileUpload = (team: 'away' | 'home', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateState(p => ({
          ...p,
          [team]: { ...p[team], logo: base64String }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRun = (team: 'away' | 'home', delta: number) => {
    updateState(prev => {
      const currentTeam = prev[team];
      const newLineScore = [...currentTeam.lineScore];
      const inningIdx = prev.inning - 1;
      
      // Fill previous innings with 0 if they are null
      for (let i = 0; i <= inningIdx; i++) {
        if (i < newLineScore.length && newLineScore[i] === null) {
          newLineScore[i] = 0;
        } else if (i >= newLineScore.length) {
          newLineScore.push(i === inningIdx ? 0 : 0);
        }
      }
      
      const currentInningScore = newLineScore[inningIdx] || 0;
      const newInningScore = Math.max(0, currentInningScore + delta);
      
      if (delta < 0 && currentInningScore === 0) return prev;

      newLineScore[inningIdx] = newInningScore;
      const totalRuns = newLineScore.reduce((acc, val) => acc + (val || 0), 0);
      
      return {
        ...prev,
        [team]: { ...currentTeam, runs: totalRuns, lineScore: newLineScore }
      };
    });
  };

  const handleStat = (team: 'away' | 'home', stat: 'hits' | 'errors', delta: number) => {
    updateState(prev => ({
      ...prev,
      [team]: { ...prev[team], [stat]: Math.max(0, prev[team][stat] + delta) }
    }));
  };

  const handleCount = (type: 'balls' | 'strikes' | 'outs', delta: number) => {
    updateState(prev => {
      const newState = { ...prev, [type]: Math.max(0, prev[type] + delta) };
      
      // Logic for auto-advancing
      if (type === 'balls' && newState.balls >= 4) {
        return { ...newState, balls: 0, strikes: 0 };
      }
      
      if (type === 'strikes' && newState.strikes >= 3) {
        const nextOuts = newState.outs + 1;
        if (nextOuts >= 3) {
          // Fill current half-inning with 0 if it was null before switching
          const teamKey = prev.isTop ? 'away' : 'home';
          const newLineScore = [...prev[teamKey].lineScore];
          if (newLineScore[prev.inning - 1] === null) {
            newLineScore[prev.inning - 1] = 0;
          }

          return {
            ...newState,
            [teamKey]: { ...prev[teamKey], lineScore: newLineScore },
            balls: 0, strikes: 0, outs: 0,
            isTop: !prev.isTop,
            inning: prev.isTop ? prev.inning : prev.inning + 1,
            bases: { 1: false, 2: false, 3: false }
          };
        }
        return { ...newState, balls: 0, strikes: 0, outs: nextOuts };
      }
      
      if (type === 'outs' && newState.outs >= 3) {
        const teamKey = prev.isTop ? 'away' : 'home';
        const newLineScore = [...prev[teamKey].lineScore];
        if (newLineScore[prev.inning - 1] === null) {
          newLineScore[prev.inning - 1] = 0;
        }

        return {
          ...newState,
          [teamKey]: { ...prev[teamKey], lineScore: newLineScore },
          balls: 0, strikes: 0, outs: 0,
          isTop: !prev.isTop,
          inning: prev.isTop ? prev.inning : prev.inning + 1,
          bases: { 1: false, 2: false, 3: false }
        };
      }
      
      return newState;
    });
  };

  if (isOverlayMode) {
    return (
      <ResponsiveOverlay>
        <AnimatePresence>
          {state.isFinal && <VictoryOverlay state={state} isPreview={true} />}
          {state.showHeader && (
            <motion.div 
              key="header-overlay"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-[110]"
            >
              <HeaderOverlay state={state} />
            </motion.div>
          )}
          {state.showBoxScore && (
            <motion.div
              key="box-score-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] z-[100]"
            >
              <BoxScore state={state} />
            </motion.div>
          )}
          {state.showScorebug && (
            <motion.div 
              key="scorebug-overlay"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[900px] z-[90]"
            >
              <Scorebug state={state} />
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveOverlay>
    );
  }

  return (
    <div className="min-h-screen bg-wbc-blue text-white p-8 font-sans overflow-auto">
      <header className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-wbc-gold p-2 rounded-lg shadow-lg"><Trophy className="text-wbc-blue w-6 h-6" /></div>
          <div><h1 className="sports-text text-3xl italic">WBC Broadcast Center</h1><p className="text-xs text-wbc-gold font-bold uppercase tracking-widest">Operator Console</p></div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => updateState(p => ({ ...p, isFinal: !p.isFinal }))} 
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-sm font-bold shadow-lg border ${
              state.isFinal 
                ? 'bg-wbc-red border-red-400 text-white' 
                : 'bg-emerald-500 border-emerald-400 text-white'
            }`}
          >
            {state.isFinal ? 'PARTIDO FINALIZADO' : 'MARCAR FINAL'}
          </button>
          <button onClick={() => window.open(window.location.origin + window.location.pathname + '?overlay=true', '_blank')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-bold"><Monitor className="w-4 h-4" />Launch Overlay</button>
          <button 
            onClick={() => {
              localStorage.removeItem('baseball_overlay_state');
              setState(INITIAL_STATE);
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'UPDATE_STATE', state: INITIAL_STATE }));
              }
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-wbc-red/10 hover:bg-wbc-red/20 text-wbc-red border border-red-500/20 rounded-lg transition-all text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />Reset Game
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video bg-zinc-900 rounded-2xl border-4 border-white/5 overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/baseball/1920/1080')] opacity-30 grayscale" />
            
            {/* Scaled Preview Container - Fixed 16:9 Canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[1920px] h-[1080px] shrink-0 origin-center scale-[0.28] sm:scale-[0.35] md:scale-[0.42] lg:scale-[0.30] xl:scale-[0.40] relative">
                <AnimatePresence>
                  {state.isFinal && <VictoryOverlay state={state} isPreview={true} />}
                  {state.showHeader && (
                    <motion.div 
                      key="header-preview"
                      initial={{ y: -100 }}
                      animate={{ y: 0 }}
                      exit={{ y: -100 }}
                      className="absolute top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-[110]"
                    >
                      <HeaderOverlay state={state} />
                    </motion.div>
                  )}
                  {state.showBoxScore && (
                    <motion.div
                      key="box-score-preview"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] z-[100]"
                    >
                      <BoxScore state={state} />
                    </motion.div>
                  )}
                  {state.showScorebug && (
                    <motion.div 
                      key="scorebug-preview"
                      initial={{ y: 100 }}
                      animate={{ y: 0 }}
                      exit={{ y: 100 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[900px] z-[90]"
                    >
                      <Scorebug state={state} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-wbc-gold">
              Live Preview
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ l: 'Inning', v: `${state.isTop ? 'TOP' : 'BOT'} ${state.inning}` }, { l: 'Count', v: `${state.balls} - ${state.strikes}` }, { l: 'Outs', v: state.outs }].map(s => (
              <div key={s.l} className="bg-black/40 border border-white/10 p-4 rounded-xl wbc-bevel"><span className="text-[10px] text-wbc-gold font-bold uppercase block mb-2">{s.l}</span><div className="sports-text text-4xl italic">{s.v}</div></div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4 wbc-bevel">
            <h2 className="sports-text text-sm tracking-widest flex items-center gap-2 text-wbc-gold"><Layout className="w-4 h-4" />Overlay Controls</h2>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Header', key: 'showHeader' as const },
                { label: 'Box Score', key: 'showBoxScore' as const },
                { label: 'Scorebug', key: 'showScorebug' as const },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => updateState(p => ({ ...p, [item.key]: !p[item.key] }))}
                  className={`p-3 rounded-xl border sports-text text-[10px] transition-all ${
                    state[item.key] 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {item.label}
                  <div className="mt-1 font-bold uppercase">{state[item.key] ? 'ON' : 'OFF'}</div>
                </button>
              ))}
            </div>

            <h2 className="sports-text text-sm tracking-widest flex items-center gap-2 text-wbc-gold mt-6"><Layout className="w-4 h-4" />Score & Stats</h2>
            {(['away', 'home'] as const).map(t => (
              <div key={t} className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TeamLogo logo={state[t].logo} className="w-8 h-8 flex items-center justify-center text-2xl" />
                    <span className="sports-text text-xl italic">{state[t].short}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRun(t, -1)} className="p-2 hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-wbc-gold font-bold uppercase">Runs</span>
                      <span className="sports-text text-3xl w-10 text-center">{state[t].runs}</span>
                    </div>
                    <button onClick={() => handleRun(t, 1)} className="p-2 bg-wbc-gold text-wbc-blue rounded-lg hover:bg-amber-400 shadow-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Hits</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleStat(t, 'hits', -1)} className="p-1 hover:bg-white/10 rounded"><Minus className="w-3 h-3" /></button>
                      <span className="sports-text text-xl w-6 text-center">{state[t].hits}</span>
                      <button onClick={() => handleStat(t, 'hits', 1)} className="p-1 bg-white/10 hover:bg-white/20 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Errors</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleStat(t, 'errors', -1)} className="p-1 hover:bg-white/10 rounded"><Minus className="w-3 h-3" /></button>
                      <span className="sports-text text-xl w-6 text-center">{state[t].errors}</span>
                      <button onClick={() => handleStat(t, 'errors', 1)} className="p-1 bg-white/10 hover:bg-white/20 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-6 wbc-bevel">
            <h2 className="sports-text text-sm tracking-widest flex items-center gap-2 text-wbc-gold"><RotateCcw className="w-4 h-4" />Flow</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['balls', 'strikes', 'outs'] as const).map(type => (
                <div key={type} className="text-center">
                  <span className="text-[10px] text-white/40 font-bold uppercase block mb-2">{type}</span>
                  <button onClick={() => handleCount(type, 1)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 sports-text text-xl">+{type[0].toUpperCase()}</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateState(p => ({ ...p, balls: 0, strikes: 0 }))} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase border border-white/10">Clear Count</button>
              <button onClick={() => updateState(p => ({ ...p, outs: 0 }))} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase border border-white/10">Clear Outs</button>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 font-bold uppercase block">Inning & Bases</span>
                <button onClick={() => updateState(p => ({ ...p, bases: { 1: false, 2: false, 3: false } }))} className="text-[10px] text-wbc-gold font-bold uppercase hover:underline">Clear Bases</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateState(p => ({ ...p, isTop: !p.isTop }))} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase border border-white/10">{state.isTop ? 'Bottom' : 'Top'}</button>
                <div className="flex flex-1 gap-1">
                  <button onClick={() => updateState(p => ({ ...p, inning: Math.max(1, p.inning - 1) }))} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase border border-white/10">Prev</button>
                  <button onClick={() => updateState(p => ({ ...p, inning: p.inning + 1 }))} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase border border-white/10">Next</button>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                {[1, 2, 3].map(b => (
                  <button key={b} onClick={() => updateState(p => ({ ...p, bases: { ...p.bases, [b]: !p.bases[b as 1|2|3] } }))} className={`w-12 h-12 rounded-lg border flex items-center justify-center sports-text text-xl transition-all ${state.bases[b as 1|2|3] ? 'bg-wbc-gold border-amber-400 text-wbc-blue shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`}>{b}B</button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4 wbc-bevel">
            <h2 className="sports-text text-sm tracking-widest flex items-center gap-2 text-wbc-gold"><Settings className="w-4 h-4" />Header Text</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-bold uppercase">Main Title</label>
                <input 
                  type="text" 
                  value={state.headerTitle} 
                  onChange={e => updateState(p => ({ ...p, headerTitle: e.target.value.toUpperCase() }))}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-bold"
                  placeholder="CLÁSICO MUNDIAL"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-bold uppercase">Subtitle</label>
                <input 
                  type="text" 
                  value={state.headerSubtitle} 
                  onChange={e => updateState(p => ({ ...p, headerSubtitle: e.target.value.toUpperCase() }))}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-bold"
                  placeholder="NARRACIÓN EN VIVO"
                />
              </div>
            </div>
          </section>

          <section className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4 wbc-bevel">
            <h2 className="sports-text text-sm tracking-widest flex items-center gap-2 text-wbc-gold"><Settings className="w-4 h-4" />Teams</h2>
            {(['away', 'home'] as const).map(t => (
              <div key={t} className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={state[t].name} 
                      onChange={e => updateState(p => ({ ...p, [t]: { ...p[t], name: e.target.value } }))}
                      className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-bold"
                      placeholder="Team Name"
                    />
                    <input 
                      type="text" 
                      value={state[t].short} 
                      onChange={e => updateState(p => ({ ...p, [t]: { ...p[t], short: e.target.value.toUpperCase() } }))}
                      className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-bold text-center"
                      placeholder="Short"
                      maxLength={3}
                    />
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(t, e)}
                        className="hidden"
                        id={`logo-upload-${t}`}
                      />
                      <label 
                        htmlFor={`logo-upload-${t}`}
                        className="w-12 h-12 bg-black/40 border border-white/10 rounded flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
                        title="Upload Logo"
                      >
                        <TeamLogo logo={state[t].logo} className="w-10 h-10 flex items-center justify-center text-xl" />
                      </label>
                    </div>
                  </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
