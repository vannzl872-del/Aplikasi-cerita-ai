import React from 'react';
import { X, BookOpen, Compass } from 'lucide-react';
import { SCOUT_SCENES } from '../data/storyData';

interface ComicComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
}

export const ComicComparisonModal: React.FC<ComicComparisonModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Perbandingan Komik Asli vs Adaptasi Sinematik 3D
              </h3>
              <p className="text-xs text-slate-400">
                Memastikan integritas cerita, identitas karakter, seragam, dan alur 6 panel asli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
            <span className="font-bold text-amber-300">Prinsip Adaptasi:</span>{' '}
            Adaptasi ini mempertahankan setiap momen cerita secara berurutan dari Panel 1 sampai 6 tanpa menampilkan semua panel sekaligus. Wajah, seragam Pramuka lengkap dengan hasduk merah putih, tanda nama "CANDRA", "RIZKI", dan "RANA", serta latar "POS BENTENG KOSONG" malam hari dirender dengan pencahayaan lentera dan partikel emas halus.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SCOUT_SCENES.map((scene) => (
              <div
                key={scene.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                  <img
                    src={scene.image}
                    alt={scene.titleId}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/40">
                    Panel {scene.panelNumber}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {scene.panelNumber}. {language === 'id' ? scene.titleId : scene.titleEn}
                  </h4>
                  <div className="mt-2 rounded-xl bg-slate-950/70 p-2.5 border border-slate-800/80 text-xs text-amber-300">
                    <span className="font-bold text-slate-400">Dialog Komik:</span>
                    <ul className="mt-1 space-y-1">
                      {scene.dialogueId.map((d, i) => (
                        <li key={i} className="text-slate-200">
                          <strong className="text-amber-400">{d.speaker}:</strong> "{d.text}"
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Animasi & Sinematografi:</strong>{' '}
                    {scene.directorNotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
