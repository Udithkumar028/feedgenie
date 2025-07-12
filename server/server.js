const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');
const xlsx = require('xlsx');

const app = express();
const sentiment = new Sentiment();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const dbPath = path.join(__dirname, '../feedback.json');

function readFeedback() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath));
}

function writeFeedback(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Submit feedback
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
    agent: userAgent,
    location: ip
  };

  const data = readFeedback();
  data.push(entry);
  writeFeedback(data);

  res.json({ message: `✅ Feedback recorded as ${sentimentLabel}` });
});

// Get all feedbacks
app.get('/all', (req, res) => {
  res.json(readFeedback());
});

// Delete feedback by index
app.delete('/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let data = readFeedback();
  if (index >= 0 && index < data.length) {
    data.splice(index, 1);
    writeFeedback(data);
    res.json({ message: '🗑️ Feedback deleted successfully.' });
  } else {
    res.status(400).json({ error: 'Invalid index' });
  }
});

// Reset all feedbacks
app.delete('/reset', (req, res) => {
  writeFeedback([]);
  res.json({ message: '🔁 All feedbacks reset successfully.' });
});

// Export to Excel
app.get('/export', (req, res) => {
  const data = readFeedback();
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');

  const exportPath = path.join(__dirname, '../feedback_export.xlsx');
  xlsx.writeFile(workbook, exportPath);
  res.download(exportPath);
});

app.listen(PORT, () => {
  console.log(`🚀 FeedGenie backend running at http://localhost:${PORT}`);
});
