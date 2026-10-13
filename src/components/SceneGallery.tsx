import React from 'react';
import { SCOUT_SCENES } from '../data/storyData';
import { Play, Sparkles, Compass } from 'lucide-react';

interface SceneGalleryProps {
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  language: 'id' | 'en';
}

export const SceneGallery: React.FC<SceneGalleryProps> = ({
  currentSceneIndex,
  onSelectScene,
  language,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-400" />
            <span>Alur Cerita 6 Panel (16:9 Storyboard Sequence)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Urutan adegan sinematik 3D dari Panel 1 sampai Panel 6 sesuai komik asli Pramuka
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCOUT_SCENES.map((scene, idx) => {
          const isSelected = idx === currentSceneIndex;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'border-amber-400 bg-slate-900/90 shadow-xl ring-2 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={scene.image}
                  alt={scene.titleId}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-2.5 py-1 backdrop-blur-md ring-1 ring-amber-500/40">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300 uppercase">
                    Panel {scene.panelNumber}
                  </span>
                </div>

                <div className="absolute top-3 right-3 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-slate-300 backdrop-blur-md">
                  {scene.durationSec}s
                </div>

                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg transition-transform group-hover:scale-110">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </div>
                </div>

                {(scene.id === 5 || scene.id === 6) && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md ring-1 ring-amber-400/40">
                    <Sparkles className="h-3 w-3" />
                    <span>Golden Glow</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                  {language === 'id' ? scene.titleId : scene.titleEn}
                </h3>

                {scene.dialogueId.length > 0 && (
                  <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800 text-xs">
                    <span className="font-bold text-amber-400">
                      {scene.dialogueId[0].speaker}:
                    </span>{' '}
                    <span className="text-slate-300">
                      "
                      {language === 'id'
                        ? scene.dialogueId[0].text
                        : scene.dialogueEn[0]?.text}
                      "
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {scene.directorNotes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
