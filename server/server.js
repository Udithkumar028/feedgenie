const express = require('express');
const cors = require('cors'); // 🔥 Allow cross-origin requests
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();

// ✅ Middlewares
app.use(cors()); // 🔓 Allow frontend access from other domains (like Render)
app.use(express.json()); // 🧠 Parse incoming JSON
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Submit feedback + sentiment analysis
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
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  data.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  res.json({ message: `✅ Feedback recorded as ${sentimentLabel}` });
});

// ✅ Retrieve all feedback entries
app.get('/all', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  res.json(data);
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 FeedGenie backend live at http://localhost:${PORT}`);
}).on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log('💡 Try changing the PORT number or stop other running apps.');
  } else {
    console.error('Server Error:', err);
  }
});
