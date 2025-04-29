// api/src/index.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');

// Ortam değişkenlerini yükle
dotenv.config();

// Express uygulaması oluştur
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Güvenlik başlıkları
app.use(cors()); // CORS izinleri
app.use(express.json()); // JSON verilerini ayrıştırma

// API rotaları
app.use('/api', chatRoutes);
app.use('/api/documents', documentRoutes);

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hukuki Asistan API çalışıyor' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});