const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Feedback submit endpoint
app.post('/submit', (req, res) => {
  const { feedback } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

  const result = sentiment.analyze(feedback);
  let sentimentLabel = 'Neutral';
  if (result.score > 0) sentimentLabel = 'Positive';
  else if (result.score < 0) sentimentLabel = 'Negative';

  const entry = {
    feedback,
    sentiment: sentimentLabel,
    score: result.score,
    timestamp: new Date().toISOString(),
    userAgent,
    ip
  };

  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  data.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  res.json({ message: `✅ Feedback recorded as ${sentimentLabel}` });
});

// Get all feedbacks
app.get('/all', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath));
    res.json(data);
  } else {
    res.json([]);
  }
});

// Delete single feedback
app.delete('/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const dbPath = path.join(__dirname, '../feedback.json');
  if (fs.existsSync(dbPath)) {
    let data = JSON.parse(fs.readFileSync(dbPath));
    if (index >= 0 && index < data.length) {
      data.splice(index, 1);
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      res.json({ message: '🗑️ Feedback deleted successfully.' });
    } else {
      res.status(400).json({ error: 'Invalid index' });
    }
  } else {
    res.status(404).json({ error: 'Feedback file not found' });
  }
});

// Reset all feedbacks
app.delete('/reset', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  fs.writeFileSync(dbPath, '[]');
  res.json({ message: '🔁 All feedbacks reset successfully.' });
});

app.listen(PORT, () => {
  console.log(`🚀 FeedGenie backend running at http://localhost:${PORT}`);
});
