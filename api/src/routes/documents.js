const express = require('express');
const multer = require('multer');
const path = require('path');
const { DocumentService } = require('../services/documentService');
const { GeminiService } = require('../services/gemini');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

const router = express.Router();
const documentService = new DocumentService();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Multer yapılandırması - dosya yükleme
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Desteklenen dosya tipleri
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya formatı. Lütfen PDF, Word veya resim (JPG/PNG) yükleyin.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/documents/upload
 * Doküman yükleme
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya bulunamadı' });
    }
    
    // Dokümanı işle
    const processedDoc = await documentService.processDocument(req.file);
    
    return res.status(201).json({
      message: 'Doküman başarıyla yüklendi',
      document: processedDoc
    });
  } catch (error) {
    console.error('Doküman yükleme hatası:', error);
    return res.status(500).json({ 
      error: 'Doküman yükleme başarısız', 
      details: error.message 
    });
  }
});

/**
 * GET /api/documents
 * Tüm dokümanları listele
 */
router.get('/', (req, res) => {
  try {
    const documents = documentService.getAllDocuments();
    return res.json({ documents });
  } catch (error) {
    console.error('Doküman listeleme hatası:', error);
    return res.status(500).json({ 
      error: 'Dokümanlar alınamadı', 
      details: error.message 
    });
  }
});

/**
 * GET /api/documents/:id
 * Belirli bir dokümanı getir
 */
router.get('/:id', (req, res) => {
  try {
    const document = documentService.getDocument(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Doküman bulunamadı' });
    }
    
    // text alanını özet ile değiştirerek gönder (belgenin tam içeriğini gönderme)
    const { text, path, ...docInfo } = document;
    return res.json(docInfo);
  } catch (error) {
    console.error('Doküman getirme hatası:', error);
    return res.status(500).json({ 
      error: 'Doküman alınamadı', 
      details: error.message 
    });
  }
});

/**
 * POST /api/documents/:id/ask
 * Belgeye soru sor
 */
router.post('/:id/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const docId = req.params.id;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Geçerli bir soru gereklidir' });
    }
    
    // Belge kontrolü
    const document = documentService.getDocument(docId);
    if (!document) {
      return res.status(404).json({ error: 'Doküman bulunamadı' });
    }
    
    // Soruyu belgeye sor
    const answer = await documentService.askDocumentQuestion(docId, question, geminiService);
    
    return res.json({
      question,
      answer,
      documentId: docId,
      documentName: document.filename
    });
  } catch (error) {
    console.error('Belgeye soru sorma hatası:', error);
    return res.status(500).json({ 
      error: 'Soru cevaplanamadı', 
      details: error.message 
    });
  }
});

module.exports = router; 