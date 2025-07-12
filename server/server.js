const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');

const app = express();
const PORT = process.env.PORT || 3001;
const sentiment = new Sentiment();
const dbPath = path.join(__dirname, '../feedback.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Submit feedback + sentiment analysis
app.post('/submit', (req, res) => {
  const feedback = req.body.feedback;
  const result = sentiment.analyze(feedback);

  let sentimentLabel = 'Neutral';
  if (result.score > 0) sentimentLabel = 'Positive';
  else if (result.score < 0) sentimentLabel = 'Negative';

  const entry = {
    feedback,
    sentiment: sentimentLabel,
    score: result.score,
    timestamp: new Date().toISOString()
  };

  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  data.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  res.json({ message: `✅ Feedback recorded as ${sentimentLabel}` });
});

// Get all feedbacks (for dashboard)
app.get('/all', (req, res) => {
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  res.json(data);
});

// Delete specific feedback
app.delete('/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  if (index >= 0 && index < data.length) {
    data.splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    res.json({ message: '🗑️ Feedback deleted.' });
  } else {
    res.status(400).json({ error: 'Invalid index' });
  }
});

// Reset all feedbacks
app.delete('/reset', (req, res) => {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
  res.json({ message: '🔁 All feedbacks reset.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FeedGenie running at http://localhost:${PORT}`);
});
