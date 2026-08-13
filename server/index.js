const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const tasks = {};
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
app.post('/generate', (req, res) => {
  const prompt = req.body.prompt || 'test';
  const id = 'task_' + Date.now();
  tasks[id] = { prompt, status: 'processing' };
  setTimeout(() => {
    tasks[id].status = 'succeeded';
    tasks[id].videoUrl = SAMPLE_VIDEO;
  }, 10000);
  res.json({ taskId: id });
});
app.get('/status/:id', (req, res) => {
  const t = tasks[req.params.id];
  if (!t) return res.status(404).json({ error: 'task not found' });
  res.json({ status: t.status, videoUrl: t.videoUrl || null });
});
app.listen(3000, () => console.log('Backend running on port 3000'));
