const express = require('express');
const path = require('path');
const { PetitionService } = require('../services/petitionService');
const { GeminiService } = require('../services/gemini');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

const router = express.Router();
const petitionService = new PetitionService();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

/**
 * POST /api/petitions/generate
 * Dilekçe oluşturma
 */
router.post('/generate', async (req, res) => {
  try {
    const { petitionType, description, userDetails, receiver } = req.body;
    
    // Girdileri doğrula
    if (!petitionType || !description || !userDetails || !receiver) {
      return res.status(400).json({ error: 'Eksik bilgi. Dilekçe türü, açıklama, kullanıcı ve alıcı bilgileri gereklidir.' });
    }
    
    // Gerekli user bilgilerini kontrol et
    if (!userDetails.name || !userDetails.address) {
      return res.status(400).json({ error: 'Ad-soyad ve adres zorunludur.' });
    }
    
    // Gerekli alıcı bilgilerini kontrol et
    if (!receiver.name) {
      return res.status(400).json({ error: 'Alıcı kurum/makam adı gereklidir.' });
    }
    
    // Dilekçe oluştur
    const petition = await petitionService.generatePetition({
      petitionType,
      description,
      userDetails,
      receiver
    }, geminiService);
    
    return res.status(201).json({
      message: 'Dilekçe başarıyla oluşturuldu',
      petition
    });
  } catch (error) {
    console.error('Dilekçe oluşturma hatası:', error);
    return res.status(500).json({ 
      error: 'Dilekçe oluşturma başarısız', 
      details: error.message 
    });
  }
});

/**
 * GET /api/petitions
 * Tüm dilekçeleri listele
 */
router.get('/', (req, res) => {
  try {
    const petitions = petitionService.getAllPetitions();
    return res.json({ petitions });
  } catch (error) {
    console.error('Dilekçe listeleme hatası:', error);
    return res.status(500).json({ 
      error: 'Dilekçeler alınamadı', 
      details: error.message 
    });
  }
});

/**
 * GET /api/petitions/types/list
 * Dilekçe türleri listesi
 */
router.get('/types/list', (req, res) => {
  try {
    // Yaygın dilekçe türleri listesi
    const petitionTypes = [
      { id: 'itiraz', name: 'İtiraz Dilekçesi' },
      { id: 'basvuru', name: 'Başvuru Dilekçesi' },
      { id: 'sikayet', name: 'Şikayet Dilekçesi' },
      { id: 'bilgi-edinme', name: 'Bilgi Edinme Dilekçesi' },
      { id: 'tazminat', name: 'Tazminat Dilekçesi' },
      { id: 'sorusturma', name: 'Soruşturma Dilekçesi' },
      { id: 'ihtarname', name: 'İhtarname' },
      { id: 'ihbar', name: 'İhbar Dilekçesi' },
      { id: 'ozur', name: 'Özür Dilekçesi' },
      { id: 'dava', name: 'Dava Dilekçesi' },
      { id: 'istifa', name: 'İstifa Dilekçesi' },
      { id: 'izin', name: 'İzin Dilekçesi' },
      { id: 'itiraz-mahkeme', name: 'Mahkemeye İtiraz Dilekçesi' }
    ];
    
    return res.json({ petitionTypes });
  } catch (error) {
    console.error('Dilekçe türleri listesi hatası:', error);
    return res.status(500).json({ 
      error: 'Dilekçe türleri alınamadı', 
      details: error.message 
    });
  }
});

/**
 * GET /api/petitions/:id
 * Belirli bir dilekçeyi getir
 */
router.get('/:id', (req, res) => {
  try {
    const petition = petitionService.getPetition(req.params.id);
    
    if (!petition) {
      return res.status(404).json({ error: 'Dilekçe bulunamadı' });
    }
    
    return res.json(petition);
  } catch (error) {
    console.error('Dilekçe getirme hatası:', error);
    return res.status(500).json({ 
      error: 'Dilekçe alınamadı', 
      details: error.message 
    });
  }
});

/**
 * GET /api/petitions/:id/download
 * Dilekçe PDF'ini indir
 */
router.get('/:id/download', (req, res) => {
  try {
    const petition = petitionService.getPetition(req.params.id);
    
    if (!petition) {
      return res.status(404).json({ error: 'Dilekçe bulunamadı' });
    }
    
    // PDF dosyasını indir
    const filePath = petition.filePath;
    const fileName = petition.fileName;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`
    });
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Dilekçe indirme hatası:', error);
    return res.status(500).json({ 
      error: 'Dilekçe indirilemedi', 
      details: error.message 
    });
  }
});

module.exports = router; 