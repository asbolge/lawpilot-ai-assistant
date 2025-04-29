const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * Doküman işleme servisi
 */
class DocumentService {
  constructor() {
    // Yüklenen dokümanlar için klasör oluştur
    this.uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    // İşlenmiş dokümanları saklama
    this.documents = new Map();
  }
  
  /**
   * Yüklenen dosyanın türüne göre işleme fonksiyonu seçer
   * @param {Object} file - Multer tarafından işlenen dosya nesnesi
   * @returns {Promise<Object>} - İşlenen doküman bilgileri
   */
  async processDocument(file) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      let text = '';
      let docType = '';
      
      switch (fileExtension) {
        case '.pdf':
          text = await this.extractTextFromPDF(file.path);
          docType = 'pdf';
          break;
        case '.docx':
        case '.doc':
          text = await this.extractTextFromDOCX(file.path);
          docType = 'word';
          break;
        case '.jpg':
        case '.jpeg':
        case '.png':
          text = await this.extractTextFromImage(file.path);
          docType = 'image';
          break;
        default:
          throw new Error('Desteklenmeyen dosya formatı');
      }
      
      // Dokümanı kaydet
      const docId = uuidv4();
      const document = {
        id: docId,
        filename: file.originalname,
        type: docType,
        path: file.path,
        text: text,
        uploadDate: new Date().toISOString(),
        summary: await this.generateSummary(text)
      };
      
      this.documents.set(docId, document);
      
      return {
        id: docId,
        filename: file.originalname,
        type: docType,
        uploadDate: document.uploadDate,
        summary: document.summary
      };
    } catch (error) {
      console.error('Doküman işleme hatası:', error);
      throw error;
    }
  }
  
  /**
   * Belirli bir dokümanı ID ile alır
   * @param {string} docId - Doküman ID
   * @returns {Object|null} - Doküman bilgileri
   */
  getDocument(docId) {
    return this.documents.get(docId) || null;
  }
  
  /**
   * Tüm dokümanları listeler
   * @returns {Array} - Doküman listesi
   */
  getAllDocuments() {
    return Array.from(this.documents.values()).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      type: doc.type,
      uploadDate: doc.uploadDate,
      summary: doc.summary
    }));
  }
  
  /**
   * PDF dosyasından metin çıkarır
   * @param {string} filePath - Dosya yolu
   * @returns {Promise<string>} - Çıkarılan metin
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF metin çıkarma hatası:', error);
      throw new Error('PDF metin çıkarma başarısız oldu');
    }
  }
  
  /**
   * DOCX dosyasından metin çıkarır
   * @param {string} filePath - Dosya yolu
   * @returns {Promise<string>} - Çıkarılan metin
   */
  async extractTextFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('DOCX metin çıkarma hatası:', error);
      throw new Error('DOCX metin çıkarma başarısız oldu');
    }
  }
  
  /**
   * Görüntüden OCR ile metin çıkarır
   * @param {string} filePath - Dosya yolu
   * @returns {Promise<string>} - Çıkarılan metin
   */
  async extractTextFromImage(filePath) {
    try {
      const result = await Tesseract.recognize(filePath, 'tur');
      return result.data.text;
    } catch (error) {
      console.error('OCR metin çıkarma hatası:', error);
      throw new Error('Görüntüden metin çıkarma başarısız oldu');
    }
  }
  
  /**
   * Metinden özet çıkarır (Gemini API kullanarak)
   * @param {string} text - Özetlenecek metin
   * @returns {Promise<string>} - Özet metin
   */
  async generateSummary(text) {
    try {
      // Çok uzun metinleri kısalt (API limitlerini aşmamak için)
      const truncatedText = text.length > 15000 ? text.substring(0, 15000) + '...' : text;
      
      // NOT: Asıl uygulamada burada Gemini API'ye istek atarak özet alınabilir
      // Şimdilik basit bir özet dönelim
      return `Bu belge ${truncatedText.length} karakter uzunluğunda ve yaklaşık ${Math.ceil(truncatedText.split(' ').length / 200)} sayfa uzunluğundadır.`;
    } catch (error) {
      console.error('Özet oluşturma hatası:', error);
      return 'Özet oluşturulamadı';
    }
  }
  
  /**
   * Belgeye soru sorar ve Gemini API ile yanıt alır
   * @param {string} docId - Doküman ID
   * @param {string} question - Kullanıcı sorusu
   * @returns {Promise<string>} - Yanıt
   */
  async askDocumentQuestion(docId, question, geminiService) {
    try {
      const document = this.getDocument(docId);
      if (!document) {
        throw new Error('Belge bulunamadı');
      }
      
      // Doküman metni ve soruyla zenginleştirilmiş bir prompt oluştur
      const prompt = `
      Aşağıdaki belge içeriğine dayanarak soruyu yanıtla:
      
      ### BELGE İÇERİĞİ:
      ${document.text.substring(0, 15000)}
      
      ### SORU:
      ${question}
      
      ### YANITLAMA KURALLARI:
      1. Yanıtını YALNIZCA belgedeki bilgilere dayandır.
      2. Belgeyle ilgili olmayan bilgiler ekleme.
      3. Belgenin içeriğinde yanıt yoksa, bunu açıkça belirt.
      4. Tam referanslar ve alıntılar kullan.
      5. Yasal terimler varsa bunları açıkla.
      `;
      
      // Gemini API'ye gönder
      const response = await geminiService.directApiRequest('', prompt);
      
      return response.text;
    } catch (error) {
      console.error('Belge soru-cevap hatası:', error);
      throw error;
    }
  }
}

module.exports = { DocumentService }; 