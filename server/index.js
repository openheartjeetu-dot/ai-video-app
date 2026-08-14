const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN || '';
const APP_URL = process.env.APP_URL || 'https://ai-video-backend-badg.onrender.com';
const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';
const MODELS = ['cerspense/zeroscope_v2_576w', 'ali-vilab/text-to-video-ms-1.7b'];
const tasks = {};
const videos = {};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callHF(model, prompt) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch('https://api-inference.huggingface.co/models/' + model, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt })
    });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 5000) return buf;
      throw new Error('empty response');
    }
    if (r.status === 503) {
      let wait = 15;
      try { const j = await r.json(); if (j.estimated_time) wait = Math.min(j.estimated_time, 20); } catch (e) {}
      await sleep(wait * 1000);
      continue;
    }
    if (r.status === 429) { await sleep(20000); continue; }
    throw new Error('HF ' + r.status);
  }
  throw new Error('HF busy after retries');
}

async function generateReal(task, prompt) {
  for (const model of MODELS) {
    try {
      const buf = await callHF(model, prompt);
      const id = 'v' + Date.now();
      videos[id] = buf;
      task.videoUrl = APP_URL + '/video/' + id;
      task.status = 'succeeded';
      task.real = true;
      return;
    } catch (e) { console.log(model + ' failed: ' + e.message); }
  }
  task.videoUrl = SAMPLE_VIDEO;
  task.status = 'succeeded';
  task.real = false;
}

app.post('/generate', (req, res) => {
  const prompt = req.body.prompt || 'test';
  const id = 'task_' + Date.now();
  tasks[id] = { prompt, status: 'processing' };
  if (HF_TOKEN) {
    generateReal(tasks[id], prompt);
  } else {
    setTimeout(() => { tasks[id].status = 'succeeded'; tasks[id].videoUrl = SAMPLE_VIDEO; }, 8000);
  }
  res.json({ taskId: id });
});

app.get('/status/:id', (req, res) => {
  const t = tasks[req.params.id];
  if (!t) return res.status(404).json({ error: 'task not found' });
  res.json({ status: t.status, videoUrl: t.videoUrl || null, real: !!t.real });
});

app.get('/video/:id', (req, res) => {
  const buf = videos[req.params.id];
  if (!buf) return res.status(404).json({ error: 'not found' });
  res.setHeader('Content-Type', 'video/mp4');
  res.send(buf);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Backend running on port ' + PORT));
