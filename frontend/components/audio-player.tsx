"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Headphones, Download, Shuffle, Repeat, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export function AudioPlayer() {
  const { 
    isPlayerOpen, 
    closePlayer, 
    currentAudio, 
    playlist, 
    isPlaying, 
    togglePlay, 
    progress, 
    duration, 
    currentTime, 
    volume, 
    isMuted, 
    seek, 
    handleVolumeChange, 
    toggleMute, 
    repeatMode, 
    cycleRepeat, 
    isShuffled, 
    toggleShuffle, 
    handleNext, 
    handlePrevious 
  } = useAudioPlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'player' | 'chapters' | 'quiz'>('player');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSeek = (clientX: number) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      seek(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSeek(e.clientX);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (currentAudio?.url) {
        const link = document.createElement('a');
        link.href = currentAudio.url;
        link.download = currentAudio.title || 'audio';
        link.click();
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!currentAudio) return 0;
    const allQuestions = currentAudio.chapters?.flatMap((c: any, ci: number) => 
      (c.quiz || []).map((q: any, qi: number) => ({ ...q, id: `${ci}-${qi}` }))
    ) || [];
    
    if (allQuestions.length === 0) return 0;
    
    const correctCount = allQuestions.filter(q => selectedAnswers[q.id] === q.a).length;
    return Math.round((correctCount / allQuestions.length) * 100);
  };

  if (!isPlayerOpen || !currentAudio) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Backdrop for mobile */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={closePlayer}
          />
        )}
        
        <motion.div
          initial={isMobile ? { y: "100%", opacity: 0 } : { x: 400, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: "100%", opacity: 0 } : { x: 400, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className={`absolute pointer-events-auto bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden ${
            isMobile 
              ? "bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl border-t border-border/50" 
              : "right-0 top-0 h-screen w-85 border-l border-border/50"
          }`}
        >
          {/* Header Area */}
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b border-border/30">
                <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-full">
                  {(['player', 'chapters', 'quiz'] as const).map((mode) => (
                      <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                              viewMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                          {mode}
                      </button>
                  ))}
                </div>
                <button
                  onClick={closePlayer}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
            </div>

            <div className={`flex flex-col flex-1 overflow-hidden ${isMobile ? 'px-6 pb-6' : 'p-6'}`}>
              
              {/* MAIN CONTENT AREA */}
              <div className="flex-1 overflow-hidden mb-6 mt-4">
                <AnimatePresence mode="wait">
                  {viewMode === 'player' && (
                      <motion.div 
                          key="player"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col h-full items-center justify-center text-center"
                      >
                          <div className={`aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg max-w-[220px] mb-8`}>
                              <Headphones className="h-20 w-20 text-primary/40" />
                          </div>
                          <h3 className="text-lg font-bold truncate mb-1 w-full px-4">{currentAudio.title}</h3>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Synthesized Voice</p>
                      </motion.div>
                  )}

                  {viewMode === 'chapters' && (
                      <motion.div 
                          key="chapters"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar"
                      >
                          <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-primary">Content Chapters</h4>
                           <div className="space-y-3">
                               {currentAudio.chapters?.map((chapter: any, i: number) => {
                                   const chapters = currentAudio.chapters || [];
                                   const isNextChapterStart = chapters[i+1]?.start_time || duration;
                                   const isActive = currentTime >= (chapter.start_time || 0) && currentTime < isNextChapterStart;
                                   
                                   return (
                                       <div 
                                           key={i}
                                           onClick={() => chapter.start_time !== undefined && seek(chapter.start_time)}
                                           className={`w-full p-4 rounded-2xl border transition-all ${
                                               isActive 
                                                   ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' 
                                                   : 'border-border/40 bg-secondary/5 hover:border-primary/30 hover:bg-secondary/10'
                                           } ${chapter.start_time !== undefined ? 'cursor-pointer' : ''}`}
                                       >
                                           <div className="flex items-center justify-between mb-2">
                                               <div className="flex items-center gap-2">
                                                   <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-primary/30'}`}>
                                                       {isActive ? '●' : `0${i+1}`}
                                                   </span>
                                                   <h5 className={`text-[12px] font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                       {chapter.title}
                                                   </h5>
                                                   {isActive && isPlaying && (
                                                       <motion.div 
                                                           animate={{ opacity: [0.3, 1, 0.3] }}
                                                           transition={{ duration: 1.5, repeat: Infinity }}
                                                           className="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter"
                                                       >
                                                           PLAYING
                                                       </motion.div>
                                                   )}
                                               </div>
                                               {chapter.start_time !== undefined && (
                                                   <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{formatTime(chapter.start_time)}</span>
                                               )}
                                           </div>
                                           <p className="text-[11px] text-muted-foreground leading-relaxed">
                                               {chapter.summary}
                                           </p>
                                       </div>
                                   );
                               })}
                              {(!currentAudio.chapters || currentAudio.chapters.length === 0) && (
                                  <div className="text-center py-12">
                                      <p className="text-[10px] text-muted-foreground">Standard extraction mode (No chapters).</p>
                                  </div>
                              )}
                          </div>
                      </motion.div>
                  )}

                  {viewMode === 'quiz' && (
                      <motion.div 
                          key="quiz"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar"
                      >
                          <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-primary">Active Quiz</h4>
                           <div className="space-y-4">
                               {showResults && (
                                   <motion.div 
                                       initial={{ opacity: 0, scale: 0.9 }}
                                       animate={{ opacity: 1, scale: 1 }}
                                       className="p-8 rounded-[2rem] bg-primary text-primary-foreground text-center mb-8 shadow-xl relative overflow-hidden"
                                   >
                                       <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Headphones className="h-24 w-24 -rotate-12" />
                                       </div>
                                       <p className="text-[10px] uppercase tracking-widest font-black mb-2 opacity-70">
                                           {calculateScore() >= 80 ? "Mastery Achieved!" : calculateScore() >= 50 ? "Good Progress!" : "Keep Reviewing!"}
                                       </p>
                                       <h2 className="text-6xl font-black mb-4">{calculateScore()}%</h2>
                                       <button 
                                           onClick={() => { setShowResults(false); setSelectedAnswers({}); }}
                                           className="relative z-10 px-6 py-2.5 bg-white text-primary rounded-full text-[11px] font-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                                       >
                                           RETRY CHALLENGE
                                       </button>
                                   </motion.div>
                               )}

                               {currentAudio.chapters?.flatMap((c: any, ci: number) => 
                                   (c.quiz || []).map((q: any, qi: number) => ({ ...q, id: `${ci}-${qi}` }))
                               ).map((q: any, i: number) => (
                                   <div key={q.id} className={`p-4 rounded-xl border transition-all ${showResults ? (selectedAnswers[q.id] === q.a ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30') : 'bg-primary/5 border-primary/10'}`}>
                                       <p className="text-[11px] font-bold mb-3">{q.q}</p>
                                       <div className="space-y-1.5">
                                           {q.options?.map((opt: string, k: number) => {
                                               const isSelected = selectedAnswers[q.id] === opt;
                                               const isCorrect = opt === q.a;
                                               
                                               return (
                                                   <button 
                                                       key={k}
                                                       disabled={showResults}
                                                       onClick={() => handleAnswerSelect(q.id, opt)}
                                                       className={`w-full text-left p-2.5 rounded-lg text-[10px] border transition-all ${
                                                           showResults 
                                                               ? isCorrect 
                                                                   ? 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300' 
                                                                   : isSelected 
                                                                       ? 'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300' 
                                                                       : 'border-border/20 opacity-50'
                                                               : isSelected 
                                                                   ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                                                                   : 'border-border/40 hover:bg-white dark:hover:bg-black'
                                                       }`}
                                                   >
                                                       {opt}
                                                   </button>
                                               );
                                           })}
                                       </div>
                                   </div>
                               ))}

                               {!showResults && currentAudio.chapters?.some((c: any) => c.quiz?.length > 0) && (
                                   <button 
                                       onClick={() => setShowResults(true)}
                                       className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg hover:scale-[1.02] transition-all mt-4"
                                   >
                                       FINISH & VIEW RESULTS
                                   </button>
                               )}
                              {(!currentAudio.chapters || !currentAudio.chapters.some((c: any) => c.quiz?.length > 0)) && (
                                  <div className="text-center py-12">
                                      <p className="text-[10px] text-muted-foreground">No quiz items available for this document.</p>
                                  </div>
                              )}
                          </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PLAYER CONTROLS (ALWAYS VISIBLE) */}
              <div className="flex-shrink-0 space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div 
                    ref={progressBarRef}
                    className="h-1 bg-secondary rounded-full cursor-pointer group relative"
                    onMouseDown={handleProgressMouseDown}
                  >
                    <motion.div 
                      className="absolute h-full bg-primary rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-medium text-muted-foreground tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between">
                  <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                    <Shuffle className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={handlePrevious} className="p-2 text-foreground hover:bg-secondary rounded-full transition-all">
                      <SkipBack className="h-5 w-5 fill-current" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                    </button>
                    <button onClick={handleNext} className="p-2 text-foreground hover:bg-secondary rounded-full transition-all">
                      <SkipForward className="h-5 w-5 fill-current" />
                    </button>
                  </div>

                  <button onClick={cycleRepeat} className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                    <Repeat className="h-4 w-4" />
                  </button>
                </div>

                {/* Volume & Extra */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                    <div className="flex items-center gap-2 flex-1">
                      <button onClick={toggleMute} className="text-muted-foreground">
                        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-secondary rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    <button onClick={handleDownload} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
