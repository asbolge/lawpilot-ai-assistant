const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const htmlPdf = require('html-pdf-node');
const { createPetitionTemplate } = require('../templates/petitionTemplate');

/**
 * Dilekçe oluşturma ve yönetimi için servis sınıfı
 */
class PetitionService {
  constructor() {
    // Dilekçeler için klasör oluştur
    this.petitionsDir = path.join(__dirname, '../../uploads/petitions');
    if (!fs.existsSync(this.petitionsDir)) {
      fs.mkdirSync(this.petitionsDir, { recursive: true });
    }
    
    // Oluşturulan dilekçeleri saklama
    this.petitions = new Map();
    
    // PDF oluşturma için varsayılan seçenekler
    this.pdfOptions = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    };
  }

  /**
   * Gemini API kullanarak dilekçe metni oluşturur
   * @param {Object} data - Dilekçe için gerekli veriler
   * @param {GeminiService} geminiService - Gemini API servis örneği
   * @returns {Promise<Object>} - Oluşturulan dilekçe bilgileri
   */
  async generatePetition(data, geminiService) {
    try {
      const { petitionType, description, userDetails, receiver } = data;
      
      // Dilekçe türüne göre prompt oluştur
      const prompt = this.createPetitionPrompt(petitionType, description, userDetails, receiver);
      
      // Gemini API'den dilekçe metni al
      const response = await geminiService.generatePetitionContent(prompt);
      
      // Dilekçe metni
      const petitionContent = response.text;
      
      // PDF oluştur
      const petitionId = uuidv4();
      const fileName = `dilekce-${petitionId}.pdf`;
      const filePath = path.join(this.petitionsDir, fileName);
      
      await this.createPetitionPDF(petitionContent, userDetails, receiver, filePath);
      
      // Dilekçe bilgilerini kaydet
      const petition = {
        id: petitionId,
        title: `${petitionType} Dilekçesi`,
        content: petitionContent,
        fileName: fileName,
        filePath: filePath,
        createDate: new Date().toISOString(),
        petitionType,
        userDetails,
        receiver
      };
      
      this.petitions.set(petitionId, petition);
      
      return {
        id: petitionId,
        title: petition.title,
        fileName: petition.fileName,
        createDate: petition.createDate,
        petitionType
      };
    } catch (error) {
      console.error('Dilekçe oluşturma hatası:', error);
      throw error;
    }
  }
  
  /**
   * ID ile dilekçe bilgisini döndürür
   * @param {string} id - Dilekçe ID
   * @returns {Object|null} - Dilekçe bilgileri
   */
  getPetition(id) {
    return this.petitions.get(id) || null;
  }
  
  /**
   * Tüm dilekçeleri listeler
   * @returns {Array} - Dilekçe listesi
   */
  getAllPetitions() {
    return Array.from(this.petitions.values()).map(petition => ({
      id: petition.id,
      title: petition.title,
      fileName: petition.fileName,
      createDate: petition.createDate,
      petitionType: petition.petitionType
    }));
  }
  
  /**
   * Dilekçe için PDF dosyası oluşturur - HTML tabanlı
   * @param {string} content - Dilekçe içeriği
   * @param {Object} userDetails - Kullanıcı bilgileri
   * @param {Object} receiver - Alıcı bilgileri
   * @param {string} outputPath - Çıktı dosya yolu
   * @returns {Promise<void>}
   */
  async createPetitionPDF(content, userDetails, receiver, outputPath) {
    try {
      // Türkçe tarih formatı
      const today = new Date();
      const turkishMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const dateStr = today.getDate() + ' ' + turkishMonths[today.getMonth()] + ' ' + today.getFullYear();
      
      // HTML şablonu oluştur
      const htmlContent = createPetitionTemplate(content, userDetails, receiver, dateStr);
      
      // PDF dosyasını oluştur
      const file = { content: htmlContent };
      const pdfBuffer = await htmlPdf.generatePdf(file, this.pdfOptions);
      
      // PDF dosyasını kaydet
      fs.writeFileSync(outputPath, pdfBuffer);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw error;
    }
  }
  
  /**
   * Dilekçe türüne göre prompt oluşturur
   * @param {string} petitionType - Dilekçe türü
   * @param {string} description - Kullanıcı açıklaması
   * @param {Object} userDetails - Kullanıcı bilgileri
   * @param {Object} receiver - Alıcı bilgileri
   * @returns {string} - Dilekçe prompt'u
   */
  createPetitionPrompt(petitionType, description, userDetails, receiver) {
    const basePrompt = `
    Sen profesyonel bir hukuk asistanısın ve Türkiye'de hukuk diline ve dilekçe formatlarına hakimsin.
    Kullanıcıdan gelen bilgilere dayanarak ${petitionType} için Türkiye standartlarına uygun resmi bir dilekçe hazırlamanı istiyorum.
    
    ### KULLANICI BİLGİLERİ:
    Ad Soyad: ${userDetails.name}
    Adres: ${userDetails.address}
    ${userDetails.phone ? 'Telefon: ' + userDetails.phone : ''}
    ${userDetails.email ? 'E-posta: ' + userDetails.email : ''}
    ${userDetails.tcNo ? 'T.C. Kimlik No: ' + userDetails.tcNo : ''}
    
    ### ALICI BİLGİLERİ:
    Kurum: ${receiver.name}
    ${receiver.department ? 'Birim: ' + receiver.department : ''}
    
    ### KULLANICININ AÇIKLAMASI:
    ${description}
    
    ### DİLEKÇE TÜRÜ:
    ${petitionType}
    
    ### HAZIRLANACAK DİLEKÇE İÇİN TALİMATLAR:
    1. Resmi bir Türk dilekçe formatına uygun olarak hazırlayın (tarih/alıcı/metin/imza sıralamasında).
    2. Dilekçenin ana metnini paragraflar halinde düzenleyin, blok halinde yazma.
    3. Kısa, açık ve anlaşılır cümleler kullanın.
    4. Her paragraf tek bir düşünceyi ifade etmeli.
    5. Dilekçenin giriş bölümünde, dilekçenin neden yazıldığını kısaca açıklayın.
    6. Gelişme bölümünde, ana konuyu detaylandırın ve gerekçeleri açıklayın.
    7. Sonuç bölümünde, ne talep edildiğini açıkça belirtin.
    8. Resmi, saygılı ve ölçülü bir dil kullanın. Duygusal ifadelerden kaçının.
    9. İlgili kanun maddeleri varsa, bunlara uygun şekilde atıfta bulunun.
    10. Dilekçe sonunda "Saygılarımla," veya "Gereğini arz ederim." gibi uygun bir kapanış ifadesi kullanın.
    
    Lütfen sadece dilekçe metnini yaz, başka yorum veya açıklama ekleme.
    `;
    
    return basePrompt;
  }
}

module.exports = { PetitionService }; 