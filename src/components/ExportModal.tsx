import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Video,
  Clapperboard,
  Volume2,
} from 'lucide-react';
import { exportCinematicVideo, ExportProgress } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'id' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  language = 'id',
}) => {
  const [activeTab, setActiveTab] = useState<'canvas_export' | 'veo_ai'>('canvas_export');

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    progressPercent: 0,
    currentScene: 1,
    message: '',
  });
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const [veoPrompt, setVeoPrompt] = useState(
    'A cinematic 3D animated story of three young Indonesian scouts - Candra, Rizki, and Rana. Outside a wooden fort named Pos Benteng Kosong at night, they resolve their dispute over a torn treasure map. Joining the pieces together, the map illuminates with a magical golden aura as they smile warmly in unity under starry skies. 16:9 landscape.'
  );
  const [veoResolution, setVeoResolution] = useState<'720p' | '1080p'>('720p');
  const [veoStatus, setVeoStatus] = useState<'idle' | 'generating' | 'polling' | 'completed' | 'error'>('idle');
  const [veoMessage, setVeoMessage] = useState('');
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const startCanvasExport = async () => {
    setExportedVideoUrl(null);
    const url = await exportCinematicVideo((p) => {
      setExportProgress(p);
    }, language);
    if (url) {
      setExportedVideoUrl(url);
    }
  };

  const handleStartVeoGeneration = async () => {
    try {
      setVeoStatus('generating');
      setVeoMessage('Meminta pembuatan video ke model Veo 3.1...');
      setVeoVideoUrl(null);

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          resolution: veoResolution,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memulai pembuatan video Veo');
      }

      const operationName = data.operationName;
      setVeoStatus('polling');
      setVeoMessage('Model AI sedang memproses simulasi 3D...');

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });
          const pollData = await pollRes.json();

          if (pollData.error) {
            clearInterval(pollInterval);
            setVeoStatus('error');
            setVeoMessage(pollData.error.message || 'Pembuatan video gagal');
            return;
          }

          if (pollData.done) {
            clearInterval(pollInterval);
            setVeoMessage('Mengunduh video MP4 yang sudah selesai...');

            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              throw new Error('Gagal mengambil berkas video');
            }

            const blob = await downloadRes.blob();
            const url = URL.createObjectURL(blob);
            setVeoVideoUrl(url);
            setVeoStatus('completed');
            setVeoMessage('Video Veo berhasil dibuat!');
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setVeoStatus('error');
          setVeoMessage((pollErr as Error).message);
        }
      }, 10000);
    } catch (err) {
      setVeoStatus('error');
      setVeoMessage((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Export Cinematic 3D Video (16:9 HD MP4)
              </h3>
              <p className="text-xs text-slate-400">
                Lengkap 6 Adegan Berurutan • Timeline Penuh 40 Detik • Suara Dialog & Efek
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-2">
          <button
            onClick={() => setActiveTab('canvas_export')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'canvas_export'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clapperboard className="h-4 w-4" />
            <span>Instant 16:9 Movie Renderer (Local HD MP4)</span>
          </button>
          <button
            onClick={() => setActiveTab('veo_ai')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'veo_ai'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Cloud AI Video Generator (Veo 3.1)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'canvas_export' ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-xl bg-slate-950/60 p-2.5">
                    <span className="text-slate-400">Aspect Ratio</span>
                    <p className="mt-1 font-bold text-amber-400">16:9 Landscape</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-2.5">
                    <span className="text-slate-400">Resolution</span>
                    <p className="mt-1 font-bold text-amber-400">1280 × 720 HD</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-2.5">
                    <span className="text-slate-400">Durasi Timeline</span>
                    <p className="mt-1 font-bold text-amber-400">40s (6 Adegan Penuh)</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Mencakup seluruh 6 adegan berurutan sesuai komik asli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-200">
                      Termasuk audio dialog karakter Pramuka & efek suara malam tersinkronisasi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Durasi presisi 40.0 detik, identik dengan timeline pratinjau</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Format berkas MP4 standar (H.264 / AAC) siap diputar di semua pemutar</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Status */}
              {exportProgress.status !== 'idle' && (
                <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300">
                      {exportProgress.message}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {exportProgress.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                      style={{ width: `${exportProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Download link when finished */}
              {exportedVideoUrl && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-emerald-200">
                        Render Video Berhasil!
                      </p>
                      <p className="text-xs text-emerald-400/80">
                        Berkas MP4 16:9 HD (40s dengan audio dialog) siap diunduh
                      </p>
                    </div>
                  </div>
                  <a
                    href={exportedVideoUrl}
                    download={`pramuka_pos_benteng_kosong_16x9_${language}.mp4`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Video MP4</span>
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition"
                >
                  Tutup
                </button>
                <button
                  onClick={startCanvasExport}
                  disabled={
                    exportProgress.status === 'loading_assets' ||
                    exportProgress.status === 'rendering_scenes' ||
                    exportProgress.status === 'mixing_audio' ||
                    exportProgress.status === 'encoding'
                  }
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 cursor-pointer"
                >
                  {exportProgress.status === 'rendering_scenes' ||
                  exportProgress.status === 'mixing_audio' ||
                  exportProgress.status === 'encoding' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sedang Merender Video (40s)...</span>
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      <span>Render Video MP4 16:9 Lengkap (40 Detik)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Pembuatan video alternatif berbasis Cloud AI dengan model Google DeepMind Veo 3.1.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-300">Prompt:</label>
                <textarea
                  value={veoPrompt}
                  onChange={(e) => setVeoPrompt(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Resolusi:</span>
                <button
                  onClick={() => setVeoResolution('720p')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold ${
                    veoResolution === '720p'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  720p
                </button>
                <button
                  onClick={() => setVeoResolution('1080p')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold ${
                    veoResolution === '1080p'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  1080p
                </button>
              </div>

              {veoMessage && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                    veoStatus === 'error'
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {veoStatus === 'generating' || veoStatus === 'polling' ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : veoStatus === 'error' ? (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  <span>{veoMessage}</span>
                </div>
              )}

              {veoVideoUrl && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
                  <span className="text-xs font-bold text-emerald-300">
                    Video Veo Siap
                  </span>
                  <a
                    href={veoVideoUrl}
                    download="veo_scout_animated_story.mp4"
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Unduh MP4
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  Tutup
                </button>
                <button
                  onClick={handleStartVeoGeneration}
                  disabled={veoStatus === 'generating' || veoStatus === 'polling'}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {veoStatus === 'generating' || veoStatus === 'polling' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Veo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Buat Video AI Veo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
