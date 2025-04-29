// api/src/routes/chat.js

const express = require('express');
const { GeminiService } = require('../services/gemini');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

const router = express.Router();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

/**
 * POST /api/chat
 * Kullanıcı mesajını işler ve yapay zeka cevabı döndürür
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    // Girdileri doğrula
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Geçerli bir mesaj gereklidir' });
    }
    
    // Gemini API'den yanıt al
    const response = await geminiService.generateResponse(message, conversationHistory);
    
    return res.json(response);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      details: error.message 
    });
  }
});

/**
 * GET /api/legal-reference/:reference
 * Belirli bir yasal referans hakkında detay bilgisi döndürür
 */
router.get('/legal-reference/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    // Burada gerçek bir veritabanından veri çekilebilir
    // Şimdilik örnek statik veri döndürüyoruz
    
    const referenceData = {
      reference,
      text: `Bu, ${reference} için örnek bir yasal metin içeriğidir. 
      Gerçek uygulamada burada ilgili kanun maddesinin tam metni olacaktır.`,
      relatedCases: [
        {
          title: 'Örnek Yargıtay Kararı 2023/1234',
          court: 'Yargıtay 9. Hukuk Dairesi',
          date: '15.03.2023',
          summary: 'Bu kararda mahkeme, işverenin geçerli nedene dayanmaksızın iş akdini feshettiğine hükmetmiştir.'
        },
        {
          title: 'Örnek Danıştay Kararı 2022/4578',
          court: 'Danıştay 8. Dairesi',
          date: '22.06.2022',
          summary: 'Bu kararda mahkeme, idari işlemin hukuka aykırı olduğuna karar vermiştir.'
        }
      ],
      doctrinePerspectives: 'Hukuk doktrininde bu konu hakkında farklı görüşler bulunmaktadır. Bazı hukukçular maddenin dar yorumlanması gerektiğini savunurken, diğerleri geniş yorumu savunmaktadır.'
    };
    
    return res.json(referenceData);
  } catch (error) {
    console.error('Legal reference endpoint error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      details: error.message 
    });
  }
});

module.exports = router;