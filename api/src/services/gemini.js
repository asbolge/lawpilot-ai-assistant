// api/src/services/gemini.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { enrichPrompt, extractLegalReferences } = require('../utils/promptEngineer');

/**
 * Gemini API ile etkileşim için servis sınıfı
 */
class GeminiService {
  /**
   * GeminiService sınıfı constructor
   * @param {string} apiKey - Gemini API anahtarı
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API anahtarı gereklidir');
    }
    this.apiKey = apiKey;
    this.generativeAI = new GoogleGenerativeAI(apiKey);
    
    // Daha yeni model adını kullanın - model adı değişiklikleri olabilir
    try {
      // Önce gemini-1.5-pro modelini deneyin
      this.model = this.generativeAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (error) {
      console.log("gemini-1.5-pro modeli bulunamadı, alternatif modelleri deniyorum...");
      try {
        // Sonra gemini-pro-latest modelini deneyin
        this.model = this.generativeAI.getGenerativeModel({ model: "gemini-pro-latest" });
      } catch (error2) {
        console.log("gemini-pro-latest modeli bulunamadı, standart gemini-pro modelini deniyorum...");
        // Son olarak standart gemini-pro modelini deneyin
        this.model = this.generativeAI.getGenerativeModel({ model: "gemini-pro" });
      }
    }
  }
  
  /**
   * Kullanıcı sorusunu işler ve Gemini API'den yanıt alır
   * @param {string} userQuestion - Kullanıcının sorusu
   * @param {Array} conversationHistory - Önceki konuşma geçmişi
   * @returns {Object} - API yanıtı ve metadatası
   */
  async generateResponse(userQuestion, conversationHistory = []) {
    try {
      // Soruyu zenginleştir
      const enrichedPrompt = enrichPrompt(userQuestion, conversationHistory);
      
      // Sistem promptu
      const systemPrompt = `Sen bir hukuk uzmanısın ve Türkiye'deki yasal mevzuat, yönerge ve genelgeler konusunda derin bilgiye sahipsin. Görevin, kullanıcıların hukuki sorularına kanun maddeleri, içtihatlar ve diğer resmi kaynaklara dayanarak doğru, net ve güvenilir yanıtlar vermektir.

### Yanıt Kuralları:
1. Her zaman resmi hukuki kaynaklara atıfta bulun (kanun maddesi, genelge numarası, yönetmelik adı ve ilgili madde)
2. Verdiğin bilgilerin kaynağını mutlaka belirt
3. Yanıtlarını şu formatta yap:
   * İlgili yasal düzenleme/hüküm özeti
   * Doğrudan ilişkili madde veya hüküm alıntıları (tırnak içinde)
   * Varsa ilgili yargı kararları veya içtihatlar
   * Uygulamadaki pratik yansıması

4. Eğer bir konuda birden fazla hukuki görüş veya yorum varsa, bunları da belirterek açıkla
5. Emin olmadığın konularda spekülatif yanıtlar verme, bunun yerine bilgi eksikliğini belirt
6. Yanıtlarını Türkçe dil bilgisi kurallarına uygun ve resmi bir dille hazırla
7. Yasalardaki güncel değişiklikleri takip et ve bilgi verirken bunları göz önünde bulundur

### Konuşma Bağlamı Hakkında:
1. Kullanıcının önceki sorularını ve yanıtları göz önünde bulundur
2. Konuşmanın bağlamına uygun yanıtlar ver
3. Kullanıcı önceki bir soruya veya yanıta atıfta bulunuyorsa, bunu dikkate al
4. Önceki yanıtlarında verdiğin bilgileri hatırla ve tutarlı ol`;

      // Güvenlik ayarları
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Doğrudan API kullanarak istek gönder - alternatif yaklaşım
      try {
        console.log("Alternatif 1: Doğrudan istek gönderme denenecek...");
        const result = await this.directApiRequest(systemPrompt, enrichedPrompt);
        
        // Yasal referansları çıkar
        const legalReferences = extractLegalReferences(result.text);
        
        return {
          text: result.text,
          legalReferences: legalReferences
        };
      } catch (directApiError) {
        console.error("Doğrudan API isteği başarısız oldu, chat API'yi deneyin:", directApiError);
        
        // Chat geçmişi oluştur
        console.log("Alternatif 2: Chat API denenecek...");
        const generationConfig = {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        };

        const history = [];
        // Sistem mesajını ekle
        history.push({
          role: "user",
          parts: [{ text: systemPrompt }],
        });
        history.push({
          role: "model",
          parts: [{ text: "Anlaşıldı, hukuki konularda kanun maddeleri ve içtihatlara referans vererek yanıt vereceğim." }],
        });

        // Konuşma geçmişini ekle
        for (const exchange of conversationHistory) {
          history.push({
            role: "user",
            parts: [{ text: exchange.userQuestion }],
          });
          history.push({
            role: "model",
            parts: [{ text: exchange.assistantResponse }],
          });
        }

        // Chat başlat
        const chat = this.model.startChat({
          generationConfig,
          safetySettings,
          history
        });

        // Yanıt al
        const result = await chat.sendMessage(enrichedPrompt);
        const responseText = result.response.text();
        
        // Yasal referansları çıkar
        const legalReferences = extractLegalReferences(responseText);
        
        // Yanıtı ve meta verileri döndür
        return {
          text: responseText,
          legalReferences: legalReferences
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Son çare: Yapay bir yanıt döndür
      return {
        text: "Üzgünüm, şu anda Gemini API'ye bağlanırken bir sorun yaşıyorum. Lütfen başka bir zaman tekrar deneyin veya API anahtarınızı kontrol edin.",
        legalReferences: [],
        error: true
      };
    }
  }

  /**
   * Gemini API'ye doğrudan istek gönderir - alternatif yaklaşım
   * @param {string} systemPrompt - Sistem promptu
   * @param {string} userPrompt - Kullanıcı promptu
   * @returns {Object} - API yanıtı
   */
  async directApiRequest(systemPrompt, userPrompt) {
    const fullPrompt = `${systemPrompt}\n\nKULLANICI SORUSU: ${userPrompt}`;
    
    const result = await this.model.generateContent(fullPrompt);
    const response = result.response;
    
    return {
      text: response.text()
    };
  }
}

module.exports = { GeminiService };