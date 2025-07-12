const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Submit feedback + sentiment analysis
app.post('/submit', (req, res) => {
  const feedback = req.body.feedback;
  const result = sentiment.analyze(feedback);

  let sentimentLabel = 'Neutral';
  if (result.score > 0) sentimentLabel = 'Positive';
  else if (result.score < 0) sentimentLabel = 'Negative';

  let suggestion = "Thanks for your feedback!";
  if (sentimentLabel === "Positive") suggestion = "🎉 We're thrilled you liked it!";
  else if (sentimentLabel === "Negative") suggestion = "😓 Sorry about that. We're working to improve.";
  else if (sentimentLabel === "Neutral") suggestion = "🤔 Thanks! Feel free to share more suggestions.";

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

  res.json({ message: `✅ ✅ Feedback recorded as ${sentimentLabel}`, suggestion });
});

// Get all feedback for dashboard
app.get('/all', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  res.json(data);
});

// Export feedback as CSV
app.get('/export', (req, res) => {
  const dbPath = path.join(__dirname, '../feedback.json');
  let data = [];
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  const csv = ["Feedback,Sentiment,Score,Timestamp"]
    .concat(data.map(d => `"${d.feedback.replace(/"/g, '""')}",${d.sentiment},${d.score},${d.timestamp}`))
    .join("\n");
  res.header('Content-Type', 'text/csv');
  res.attachment('feedbacks.csv');
  res.send(csv);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FeedGenie running at http://localhost:${PORT}`);
}).on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log('💡 Try changing the PORT number or kill the running process.');
  } else {
    console.error('Server Error:', err);
  }
});
