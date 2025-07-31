const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Default route
app.get('/', (req, res) => {
  res.send('✅ Harium AI Backend is running!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});