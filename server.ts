import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

app.post('/api/generate-video', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured in environment.' });
    }

    const { prompt, aspectRatio = '16:9', resolution = '720p' } = req.body;
    const finalPrompt =
      prompt ||
      'A cinematic 3D animated story of three young Indonesian scouts - Candra, Rizki, and Rana. Outside a wooden fort named Pos Benteng Kosong at night, they resolve their dispute over a torn treasure map. Joining the pieces together, the map illuminates with a magical golden aura as they smile warmly in unity under starry skies. 16:9 landscape.';

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: finalPrompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution as '720p' | '1080p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
      },
    });

    res.json({ operationName: operation.name });
  } catch (error: unknown) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to start video generation' });
  }
});

app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Missing operationName parameter' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: updated.done,
      error: updated.error || null,
      response: updated.response ? { hasVideo: !!updated.response.generatedVideos?.[0]?.video?.uri } : null,
    });
  } catch (error: unknown) {
    console.error('Error checking video status:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to check video status' });
  }
});

app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Missing operationName parameter' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or video is not ready yet.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to fetch video stream from source.' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: unknown) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to download video' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
