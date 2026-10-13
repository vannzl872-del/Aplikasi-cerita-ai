import { SCOUT_SCENES, TOTAL_STORY_DURATION } from '../data/storyData';
import { soundEngine } from './soundEngine';

export interface ExportProgress {
  status: 'idle' | 'loading_assets' | 'rendering_scenes' | 'mixing_audio' | 'encoding' | 'completed' | 'error';
  progressPercent: number;
  currentScene: number;
  message: string;
}

/**
 * Exports the 16:9 cinematic video matching the full preview timeline (~40 seconds).
 * Uses the local high-speed ffmpeg render engine via /api/export-local-video for an instant,
 * pristine, broadcast-quality H.264/AAC MP4 with all 6 scenes, subtitles, and dialogue audio.
 * Falls back to client-side MediaRecorder with Web Audio MediaStreamDestination if needed.
 */
export async function exportCinematicVideo(
  onProgress: (p: ExportProgress) => void,
  language: 'id' | 'en' = 'id'
): Promise<string | null> {
  try {
    onProgress({
      status: 'loading_assets',
      progressPercent: 10,
      currentScene: 1,
      message: 'Menyiapkan aset 3D & audio dialog Pramuka...',
    });

    // Try local high-speed MP4 render endpoint first (exact 40.0s timeline, H.264/AAC)
    try {
      onProgress({
        status: 'rendering_scenes',
        progressPercent: 25,
        currentScene: 1,
        message: 'Merender 6 adegan 16:9 sinematik (Scene 1 s/d 6)...',
      });

      // Animate progress smoothly while local engine generates
      let progress = 25;
      const progressTimer = setInterval(() => {
        progress = Math.min(progress + 15, 88);
        onProgress({
          status: progress > 60 ? 'mixing_audio' : 'rendering_scenes',
          progressPercent: progress,
          currentScene: Math.min(Math.ceil((progress / 90) * 6), 6),
          message:
            progress > 60
              ? 'Menyelaraskan suara dialog asli & tata suara malam...'
              : `Merender adegan ${Math.min(Math.ceil((progress / 90) * 6), 6)} / 6...`,
        });
      }, 400);

      const res = await fetch(`/api/export-local-video?lang=${language}`);
      clearInterval(progressTimer);

      if (res.ok) {
        onProgress({
          status: 'encoding',
          progressPercent: 95,
          currentScene: 6,
          message: 'Memfinalisasi berkas MP4 (H.264 / AAC 16:9 HD)...',
        });

        const blob = await res.blob();
        if (blob.size > 100000) {
          const mp4Blob = new Blob([blob], { type: 'video/mp4' });
          const url = URL.createObjectURL(mp4Blob);

          onProgress({
            status: 'completed',
            progressPercent: 100,
            currentScene: 6,
            message: `Video 40 detik (${(blob.size / (1024 * 1024)).toFixed(1)} MB) siap diunduh!`,
          });
          return url;
        }
      }
    } catch (apiErr) {
      console.warn('Local endpoint fetch error, falling back to client-side recorder:', apiErr);
    }

    // Client-side fallback: Canvas + Web Audio MediaStreamDestination
    return await exportClientSideMediaRecorder(onProgress, language);
  } catch (err) {
    console.error('Export video error:', err);
    onProgress({
      status: 'error',
      progressPercent: 0,
      currentScene: 1,
      message: (err as Error).message || 'Gagal merender video',
    });
    return null;
  }
}

/**
 * Client-side browser recorder combining 16:9 Canvas stream and Web Audio MediaStreamDestination
 */
async function exportClientSideMediaRecorder(
  onProgress: (p: ExportProgress) => void,
  language: 'id' | 'en'
): Promise<string> {
  onProgress({
    status: 'loading_assets',
    progressPercent: 15,
    currentScene: 1,
    message: 'Memuat gambar resolusi tinggi & berkas audio...',
  });

  // Preload all 6 images
  const loadedImages: HTMLImageElement[] = [];
  for (let i = 0; i < SCOUT_SCENES.length; i++) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SCOUT_SCENES[i].image;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Gagal memuat ${SCOUT_SCENES[i].image}`));
    });
    loadedImages.push(img);
  }

  // Setup 16:9 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Setup Web Audio with MediaStreamDestination
  const audioCtx = soundEngine.initCtx();
  const audioDest = audioCtx.createMediaStreamDestination();

  // Combine video and audio tracks
  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')
    ? 'video/mp4;codecs=avc1,mp4a.40.2'
    : MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 6000000,
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  const recordingPromise = new Promise<string>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
  });

  recorder.start(500);

  // Play audio dialogue into audioDest
  const playDialogue = (sceneId: number) => {
    if (sceneId === 1) {
      soundEngine.playDialogueClip(`/src/assets/audio/scene1_candra_${language}.mp3`, audioDest);
      setTimeout(() => {
        soundEngine.playDialogueClip(`/src/assets/audio/scene1_rizki_${language}.mp3`, audioDest);
      }, 3400);
    } else if (sceneId === 2) {
      soundEngine.playTearSfx(audioDest);
    } else if (sceneId === 3) {
      soundEngine.playInterruptionSting(audioDest);
      setTimeout(() => {
        soundEngine.playDialogueClip(`/src/assets/audio/scene3_rana_${language}.mp3`, audioDest);
      }, 500);
    } else if (sceneId === 4) {
      setTimeout(() => {
        soundEngine.playDialogueClip(`/src/assets/audio/scene4_rana_${language}.mp3`, audioDest);
      }, 500);
    } else if (sceneId === 5) {
      soundEngine.playMagicalChimes(audioDest);
      setTimeout(() => {
        soundEngine.playDialogueClip(`/src/assets/audio/scene5_scouts_${language}.mp3`, audioDest);
      }, 1000);
    } else if (sceneId === 6) {
      soundEngine.playPeacefulHarmony(audioDest);
      setTimeout(() => {
        soundEngine.playDialogueClip(`/src/assets/audio/scene6_scouts_${language}.mp3`, audioDest);
      }, 1000);
    }
  };

  const fps = 30;
  let totalElapsed = 0;

  for (let sIdx = 0; sIdx < SCOUT_SCENES.length; sIdx++) {
    const scene = SCOUT_SCENES[sIdx];
    const img = loadedImages[sIdx];
    const sceneDuration = scene.durationSec;
    const sceneFrames = Math.round(sceneDuration * fps);

    playDialogue(scene.id);
    soundEngine.playSceneAmbience(scene.audioProfile.bgmMood, audioDest);

    for (let f = 0; f < sceneFrames; f++) {
      const p = f / sceneFrames;
      totalElapsed += 1 / fps;

      ctx.save();
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let scale = 1.0;
      let offsetX = 0;
      let offsetY = 0;

      if (scene.cameraStyle === 'zoom-in-dramatic') {
        scale = 1.04 + p * 0.12;
        offsetX = -p * 30;
      } else if (scene.cameraStyle === 'pan-left-to-right') {
        scale = 1.08;
        offsetX = (p - 0.5) * 50;
      } else if (scene.cameraStyle === 'celestial-glow-zoom') {
        scale = 1.04 + Math.sin(p * Math.PI) * 0.08;
      } else if (scene.cameraStyle === 'epic-slow-dolly') {
        scale = 1.15 - p * 0.1;
      } else {
        scale = 1.02 + p * 0.06;
      }

      const w = canvas.width * scale;
      const h = canvas.height * scale;
      const x = (canvas.width - w) / 2 + offsetX;
      const y = (canvas.height - h) / 2 + offsetY;

      ctx.drawImage(img, x, y, w, h);

      // Letterbox
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

      // Top-left chapter badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(40, 42, 360, 40, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`SCENE ${scene.panelNumber} / 6`, 55, 66);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 13px sans-serif';
      ctx.fillText(scene.titleId.slice(0, 26), 170, 66);

      // Subtitles
      if (scene.dialogueId.length > 0) {
        const dlg = scene.dialogueId[0];
        const text = language === 'id' ? dlg.text : scene.dialogueEn[0]?.text;
        ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
        ctx.beginPath();
        ctx.roundRect(140, canvas.height - 110, 1000, 74, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`[${dlg.speaker}]`, 165, canvas.height - 84);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 17px sans-serif';
        ctx.fillText(`"${text}"`, 165, canvas.height - 54);
      }

      ctx.restore();

      // Pace frame to real wall-clock time so MediaRecorder captures full duration
      await new Promise((r) => setTimeout(r, 1000 / fps));

      if (f % 15 === 0) {
        const overallPercent = 15 + Math.round((totalElapsed / TOTAL_STORY_DURATION) * 80);
        onProgress({
          status: 'rendering_scenes',
          progressPercent: overallPercent,
          currentScene: sIdx + 1,
          message: `Merekam adegan ${sIdx + 1} / 6 (${Math.round(totalElapsed)}s / ${Math.round(TOTAL_STORY_DURATION)}s)...`,
        });
      }
    }
  }

  onProgress({
    status: 'encoding',
    progressPercent: 98,
    currentScene: 6,
    message: 'Memfinalisasi berkas rekaman...',
  });

  recorder.stop();
  const finalUrl = await recordingPromise;

  onProgress({
    status: 'completed',
    progressPercent: 100,
    currentScene: 6,
    message: 'Video selesai dirender!',
  });

  return finalUrl;
}
