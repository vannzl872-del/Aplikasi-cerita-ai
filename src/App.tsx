/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Film,
  BookOpen,
  Users,
  Video,
  Play,
  RotateCcw,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { SCOUT_SCENES, TOTAL_STORY_DURATION } from './data/storyData';
import { CinematicVideoPlayer } from './components/CinematicVideoPlayer';
import { SceneGallery } from './components/SceneGallery';
import { ScoutCharacterDossier } from './components/ScoutCharacterDossier';
import { ExportModal } from './components/ExportModal';
import { ComicComparisonModal } from './components/ComicComparisonModal';

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isComicModalOpen, setIsComicModalOpen] = useState<boolean>(false);

  const currentScene = SCOUT_SCENES[currentSceneIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-7xl bg-radial from-amber-600/10 via-amber-900/5 to-transparent blur-3xl" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20">
              <Compass className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  PRAMUKA
                </span>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                  3D CINEMATIC STORY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rahasia Pos Benteng Kosong • 6-Panel Animation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsComicModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Komik Asli</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-yellow-300 active:scale-95"
            >
              <Video className="h-4 w-4" />
              <span>Export 16:9 Video</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-10">
        {/* Story Intro / Subheader */}
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bagian 2: Mengatasi Ketakutan Terbesar</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Candra, Rizki, dan Rana di Pos Benteng Kosong
            </h1>
            <p className="max-w-3xl text-sm text-slate-400 sm:text-base">
              Dari persaingan ego memperebutkan peta terbelah, hingga keajaiban persatuan yang memancarkan cahaya emas petunjuk harta karun. Mengikuti urutan adegan komik panel 1 hingga 6.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400">
              Total Durasi: ~{Math.round(TOTAL_STORY_DURATION)} detik
            </span>
            <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">
              Format 16:9 Widescreen
            </span>
          </div>
        </section>

        {/* Cinematic Video Player Section */}
        <section className="relative">
          <CinematicVideoPlayer
            currentSceneIndex={currentSceneIndex}
            onSceneChange={(idx) => setCurrentSceneIndex(idx)}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            language={language}
            setLanguage={setLanguage}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </section>

        {/* Current Scene Director Breakdown & Dialogue Highlights */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Scene Detail & Cinematography */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Catatan Sutradara (Scene {currentScene.panelNumber} of 6)
                </h3>
              </div>
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono font-medium text-amber-300">
                Camera: {currentScene.cameraStyle}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-300">
                {currentScene.directorNotes}
              </p>

              {/* Dialogue Transcript */}
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Naskah & Transkrip Percakapan:
                </span>
                {currentScene.dialogueId.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="font-bold text-amber-400 shrink-0">
                      [{item.speaker}]:
                    </span>
                    <span className="text-white italic">"{item.text}"</span>
                  </div>
                ))}
              </div>

              {/* Sound Profile */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Audio Profile:</span>
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-amber-300">
                  Mood: {currentScene.audioProfile.bgmMood}
                </span>
                {currentScene.audioProfile.sfx.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400"
                  >
                    SFX: {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Scout Values & Moral Summary */}
          <div className="space-y-4 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-slate-900/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">
                Pesan Moral Pramuka
              </h3>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2">
              <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                Intisari Cerita
              </span>
              <p className="text-xs leading-relaxed text-amber-100 font-medium">
                "Kekuatan terbesarmu mungkin adalah bakat yang paling jarang kau pamerkan. Kolaborasi akan selalu mengalahkan ego persaingan semata."
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Urutan berurutan tanpa lompatan acak</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Karakteristik seragam Pramuka terjaga</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Efek pendar emas & partikel halus</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Panel Storyboard Gallery */}
        <section>
          <SceneGallery
            currentSceneIndex={currentSceneIndex}
            onSelectScene={(idx) => {
              setCurrentSceneIndex(idx);
              setIsPlaying(true);
            }}
            language={language}
          />
        </section>

        {/* Character Dossier */}
        <section>
          <ScoutCharacterDossier />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pramuka: Rahasia Benteng Kosong • 3D Cinematic Story Player</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsComicModalOpen(true)}
              className="hover:text-amber-400 transition"
            >
              Komik 6 Panel
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-amber-400 transition"
            >
              Export 16:9 Video
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        language={language}
      />
      <ComicComparisonModal
        isOpen={isComicModalOpen}
        onClose={() => setIsComicModalOpen(false)}
        language={language}
      />
    </div>
  );
}
