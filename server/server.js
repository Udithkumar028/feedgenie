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

// Serve frontend statically (important for Render deployment)
app.use(express.static(path.join(__dirname, '../public')));

// Submit feedback
app.post('/submit', (req, res) => {
  const feedback = req.body.feedback;
  const result = sentiment.analyze(feedback);

  const sentimentLabel = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
  const entry = {
    feedback,
    sentiment: sentimentLabel,
    score: result.score,
    timestamp: new Date().toISOString()
  };

  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  data.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  res.json({ message: `✅ ✅ Feedback recorded as ${sentimentLabel}` });
});

// Get feedback
app.get('/all', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
