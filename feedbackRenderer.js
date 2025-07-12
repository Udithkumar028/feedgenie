document.getElementById('feedback-list').innerHTML = data.map((fb, index) => {
    const label = customLabel(fb.sentiment, fb.score);
    return `
      <div style="border-left: 6px solid ${colorFor(label)}; padding: 8px; margin: 8px; border-radius: 10px; background: #f9f9f9;">
        <strong>#${index + 1} ${label}</strong> — <span>${fb.feedback}</span><br>
        <small>🕒 ${new Date(fb.timestamp).toLocaleString()}</small><br>
        <em>🌍 ${fb.ip || 'Unknown'} | 📱 ${fb.userAgent || 'Unknown Device'}</em><br><br>
        <button onclick="deleteFeedback(${index}, 'everyone')">🗑️ Delete for Everyone</button>
        <button onclick="deleteFeedback(${index}, 'me')">🙈 Delete for Me</button>
      </div>
    `;
  }).join('');
  