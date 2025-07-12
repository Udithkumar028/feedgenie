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

// 🔥 Submit feedback + fallback multilingual logic
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

  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];

  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath));
    } catch (err) {
      console.error('⚠️ Error reading feedback.json:', err);
    }
  }

  data.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  res.json({ message: `✅ ✅ Feedback recorded as ${sentimentLabel}` });
});

// 📊 Get all feedback
app.get('/all', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];

  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath));
    } catch (err) {
      console.error('⚠️ Error reading feedback.json:', err);
    }
  }

  res.json(data);
});

// 🚀 Start
app.listen(PORT, () => {
  console.log(`🚀 FeedGenie running at http://localhost:${PORT}`);
}).on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log('💡 Change the port or kill the process.');
  } else {
    console.error('Server Error:', err);
  }
});
