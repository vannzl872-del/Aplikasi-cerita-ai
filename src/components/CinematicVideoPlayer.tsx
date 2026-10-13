import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Subtitles,
  Mic,
  Compass,
  Film,
} from 'lucide-react';
import { SCOUT_SCENES } from '../data/storyData';
import { soundEngine } from '../utils/soundEngine';
import { MagicParticlesCanvas } from './MagicParticlesCanvas';

interface CinematicVideoPlayerProps {
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
  onOpenExportModal: () => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  currentSceneIndex,
  onSceneChange,
  isPlaying,
  setIsPlaying,
  language,
  setLanguage,
  onOpenExportModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLetterbox, setIsLetterbox] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentScene = SCOUT_SCENES[currentSceneIndex];

  useEffect(() => {
    soundEngine.playSceneAmbience(currentScene.audioProfile.bgmMood);

    if (currentScene.id === 2) {
      setTimeout(() => soundEngine.playTearSfx(), 600);
    } else if (currentScene.id === 3) {
      setTimeout(() => soundEngine.playInterruptionSting(), 400);
    } else if (currentScene.id === 5) {
      setTimeout(() => soundEngine.playMagicalChimes(), 800);
    } else if (currentScene.id === 6) {
      setTimeout(() => soundEngine.playPeacefulHarmony(), 1000);
    }

    if (!isMuted) {
      soundEngine.playSceneDialogue(currentScene.id, language);
    }
  }, [currentSceneIndex, currentScene, isMuted, language]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    let startTime = performance.now();
    const duration = (currentScene.durationSec * 1000) / playbackSpeed;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setSceneProgress(progress);

      if (progress < 1) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        if (currentSceneIndex < SCOUT_SCENES.length - 1) {
          onSceneChange(currentSceneIndex + 1);
          setSceneProgress(0);
        } else {
          setIsPlaying(false);
          setSceneProgress(1);
        }
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, currentScene.durationSec, playbackSpeed, onSceneChange, setIsPlaying]);

  const togglePlay = () => {
    if (!isPlaying && sceneProgress >= 1 && currentSceneIndex === SCOUT_SCENES.length - 1) {
      onSceneChange(0);
      setSceneProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    onSceneChange(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getCameraTransform = () => {
    const p = sceneProgress;
    switch (currentScene.cameraStyle) {
      case 'zoom-in-dramatic':
        return `scale(${1.02 + p * 0.14}) translate(${-p * 20}px, ${-p * 10}px)`;
      case 'pan-left-to-right':
        return `scale(1.08) translate(${(p - 0.5) * 45}px, 0px)`;
      case 'pull-back-wide':
        return `scale(${1.12 - p * 0.1}) translate(0px, 0px)`;
      case 'gentle-drift-in':
        return `scale(${1.03 + p * 0.08}) translate(0px, ${-p * 15}px)`;
      case 'celestial-glow-zoom':
        return `scale(${1.05 + Math.sin(p * Math.PI) * 0.09}) translate(0px, 0px)`;
      case 'epic-slow-dolly':
        return `scale(${1.1 - p * 0.08}) translate(0px, 0px)`;
      default:
        return `scale(1.05)`;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-amber-500/20 ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'w-full'
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 select-none">
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: getCameraTransform(),
          }}
        >
          <img
            src={currentScene.image}
            alt={currentScene.titleId}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center filter transition-all duration-700"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%]" />

        {isLetterbox && (
          <>
            <div className="pointer-events-none absolute top-0 right-0 left-0 h-6 bg-black/90 backdrop-blur-xs transition-all sm:h-9" />
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 bg-black/90 backdrop-blur-xs transition-all sm:h-9" />
          </>
        )}

        <MagicParticlesCanvas sceneId={currentScene.id} intensity={1} />

        {(currentScene.id === 1 || currentScene.id === 2) && (
          <div className="pointer-events-none absolute inset-0 bg-amber-950/15 mix-blend-overlay animate-pulse" />
        )}

        {currentScene.id === 5 && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: Math.sin(sceneProgress * Math.PI) * 0.4 + 0.3,
              background:
                'radial-gradient(circle at 50% 65%, rgba(253, 224, 71, 0.4) 0%, rgba(245, 158, 11, 0.2) 40%, transparent 75%)',
            }}
          />
        )}

        <div className="absolute top-4 right-4 left-4 z-30 flex items-center justify-between sm:top-6 sm:right-6 sm:left-6">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-950/80 px-3.5 py-1.5 backdrop-blur-md ring-1 ring-amber-500/40">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase sm:text-sm">
              Scene {currentScene.panelNumber} / 6
            </span>
            <span className="hidden text-slate-500 sm:inline">•</span>
            <span className="hidden text-xs font-medium text-slate-200 sm:inline">
              {language === 'id' ? currentScene.titleId : currentScene.titleEn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLetterbox(!isLetterbox)}
              title="Toggle Cinema Letterbox"
              className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:bg-slate-800 hover:text-amber-300"
            >
              <Film className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">16:9 Scope</span>
            </button>

            <div className="flex items-center rounded-full bg-slate-900/85 p-0.5 ring-1 ring-slate-700/60 backdrop-blur-md">
              <button
                onClick={() => setLanguage('id')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  language === 'id'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {currentScene.id === 6 && currentScene.moralQuote && (
          <div className="absolute top-14 right-6 left-6 z-25 mx-auto max-w-2xl transition-all duration-700 sm:top-16">
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <div className="inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-amber-300 uppercase">
                    {currentScene.moralQuote.chapter}
                  </div>
                  <p className="mt-1 text-xs font-medium text-amber-100 sm:text-sm">
                    "{language === 'id' ? currentScene.moralQuote.main : currentScene.moralQuote.translation}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSubtitles && (
          <div className="absolute right-4 bottom-12 left-4 z-30 mx-auto max-w-3xl sm:right-8 sm:bottom-14 sm:left-8">
            {currentScene.dialogueId.map((item, idx) => {
              const text =
                language === 'id' ? item.text : currentScene.dialogueEn[idx]?.text;
              return (
                <div
                  key={idx}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative rounded-xl border border-amber-500/30 bg-slate-950/85 px-4 py-2.5 shadow-2xl backdrop-blur-md sm:px-5 sm:py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-black text-slate-950 uppercase">
                      {item.badge || item.speaker}
                    </span>
                    <span className="text-xs font-semibold text-amber-300/80">
                      {item.speaker}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white drop-shadow sm:text-base">
                    "{text}"
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-35 flex cursor-pointer items-center justify-center bg-black/35 transition-all hover:bg-black/25"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-2xl transition-transform hover:scale-110 sm:h-20 sm:w-20">
              <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </div>
          </div>
        )}
      </div>

      <div className="z-30 border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 sm:px-6">
        <div className="relative mb-3 flex items-center">
          <div className="grid w-full grid-cols-6 gap-1.5">
            {SCOUT_SCENES.map((scene, idx) => {
              const isCurrent = idx === currentSceneIndex;
              const isPast = idx < currentSceneIndex;
              const sceneFraction = isCurrent ? sceneProgress : isPast ? 1 : 0;

              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    onSceneChange(idx);
                    setSceneProgress(0);
                    setIsPlaying(true);
                  }}
                  className="group/chapter relative flex h-2.5 w-full cursor-pointer flex-col justify-center rounded-full bg-slate-800 transition hover:h-3.5"
                  title={`Scene ${scene.panelNumber}: ${scene.titleId}`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
                    style={{ width: `${sceneFraction * 100}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[11px] whitespace-nowrap text-amber-300 opacity-0 shadow-lg ring-1 ring-amber-500/30 transition group-hover/chapter:opacity-100">
                    {scene.panelNumber}. {language === 'id' ? scene.titleId : scene.titleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 transition hover:bg-amber-400 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play Cinematic Video'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              title="Replay from Scene 1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleMute}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                isMuted
                  ? 'bg-rose-950/60 text-rose-400 ring-1 ring-rose-500/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                showSubtitles
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (currentScene.dialogueId[0]) {
                  soundEngine.speakDialogue(
                    language === 'id'
                      ? currentScene.dialogueId[0].text
                      : currentScene.dialogueEn[0]?.text || '',
                    language === 'id' ? 'id-ID' : 'en-US'
                  );
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-amber-300"
              title="Narrate Current Dialogue"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-900 p-1 ring-1 ring-slate-800">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                    playbackSpeed === speed
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-500 hover:to-amber-400"
              title="Render & Export 16:9 Video"
            >
              <Sparkles className="h-4 w-4" />
              <span>Export Movie</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
