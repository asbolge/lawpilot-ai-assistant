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
        
        // API yanıtını işle
        const { cleanedText, structuredLegalReferences } = this.processApiResponse(result.text);
        
        // Eski yöntemle de yasal referansları çıkar (yedek olarak)
        const fallbackReferences = extractLegalReferences(cleanedText);
        
        return {
          text: cleanedText,
          legalReferences: structuredLegalReferences.length > 0 ? structuredLegalReferences : fallbackReferences
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
        
        // API yanıtını işle
        const { cleanedText, structuredLegalReferences } = this.processApiResponse(responseText);
        
        // Eski yöntemle de yasal referansları çıkar (yedek olarak)
        const fallbackReferences = extractLegalReferences(cleanedText);
        
        // Yanıtı ve meta verileri döndür
        return {
          text: cleanedText,
          legalReferences: structuredLegalReferences.length > 0 ? structuredLegalReferences : fallbackReferences
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
   * API yanıtını işler ve yapılandırılmış yasal referansları çıkarır
   * @param {string} responseText - API yanıtı
   * @returns {Object} - İşlenmiş yanıt ve yasal referanslar
   */
  processApiResponse(responseText) {
    // JSON bölümünü ara
    const jsonMatch = responseText.match(/```json\s*({[\s\S]*?})\s*```/);
    let structuredLegalReferences = [];
    let cleanedText = responseText;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        // JSON'ı parse et
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // Yasal referansları al
        if (jsonData.legalReferences && Array.isArray(jsonData.legalReferences)) {
          structuredLegalReferences = jsonData.legalReferences;
        }
        
        // JSON bloğunu temizle
        cleanedText = responseText.replace(/```json[\s\S]*?```/, '').trim();
      } catch (error) {
        console.error('JSON parse hatası:', error);
        // JSON parse hatası durumunda orijinal metni koru
      }
    }
    
    // Eğer yapılandırılmış referanslar boşsa, metinden çıkarmaya çalış
    if (structuredLegalReferences.length === 0) {
      const { extractLegalReferences } = require('../utils/promptEngineer');
      
      // Metinden tüm yasal referansları çıkar
      const textReferences = extractLegalReferences(responseText);
      
      // Referansları yapılandırılmış formata dönüştür
      for (const ref of textReferences) {
        // Kanun kısaltması ve madde formatı (örn: TMK Madde 123)
        const codeArticleMatch = ref.match(/^(TMK|TBK|HMK|İYUK|IYUK|TTK|TCK|CMK|İİK|IIK|VUK|SGK|KVKK|TKHK|SPK|BTK|ÇK|FSEK|SK|KVK|GVK|ASK|AK)\s+Madde\s+(\d+)$/i);
        if (codeArticleMatch) {
          const code = codeArticleMatch[1].toUpperCase();
          const article = codeArticleMatch[2];
          
          // Bilinen kanunlar sözlüğünden numarayı ve adı al
          const lawsMap = {
            'TMK': { number: '4721', name: 'Türk Medeni Kanunu' },
            'TBK': { number: '6098', name: 'Türk Borçlar Kanunu' },
            'HMK': { number: '6100', name: 'Hukuk Muhakemeleri Kanunu' },
            'İYUK': { number: '2577', name: 'İdari Yargılama Usulü Kanunu' },
            'IYUK': { number: '2577', name: 'İdari Yargılama Usulü Kanunu' },
            'TTK': { number: '6102', name: 'Türk Ticaret Kanunu' },
            'TKHK': { number: '6502', name: 'Tüketicinin Korunması Hakkında Kanun' },
            'TCK': { number: '5237', name: 'Türk Ceza Kanunu' },
            'CMK': { number: '5271', name: 'Ceza Muhakemesi Kanunu' },
            'İİK': { number: '2004', name: 'İcra ve İflas Kanunu' },
            'IIK': { number: '2004', name: 'İcra ve İflas Kanunu' },
            'VUK': { number: '213', name: 'Vergi Usul Kanunu' },
            'SGK': { number: '5510', name: 'Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu' },
            'KVKK': { number: '6698', name: 'Kişisel Verilerin Korunması Kanunu' },
            'SPK': { number: '6362', name: 'Sermaye Piyasası Kanunu' },
            'BTK': { number: '5809', name: 'Elektronik Haberleşme Kanunu' },
            'ÇK': { number: '4857', name: 'Çalışma Kanunu' },
            'FSEK': { number: '5846', name: 'Fikir ve Sanat Eserleri Kanunu' },
            'SK': { number: '7166', name: 'Sosyal Hizmetler Kanunu' },
            'KVK': { number: '5520', name: 'Kurumlar Vergisi Kanunu' },
            'GVK': { number: '193', name: 'Gelir Vergisi Kanunu' },
            'ASK': { number: '5718', name: 'Milletlerarası Özel Hukuk ve Usul Hukuku Hakkında Kanun' },
            'AK': { number: '2709', name: 'Türkiye Cumhuriyeti Anayasası' }
          };
          
          if (lawsMap[code]) {
            structuredLegalReferences.push({
              code,
              name: lawsMap[code].name,
              number: lawsMap[code].number,
              article,
              url: `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=${lawsMap[code].number}&MevzuatTur=1&MevzuatTertip=5#MADDE_${article}`
            });
          }
          continue;
        }
        
        // Kanun numarası, adı ve madde formatı (örn: 6098 sayılı Türk Borçlar Kanunu Madde 123)
        const fullLawMatch = ref.match(/^(\d{3,5})\s+sayılı\s+(.*?)\s+(?:Kanunu|Kanun)\s+Madde\s+(\d+)$/i);
        if (fullLawMatch) {
          const number = fullLawMatch[1];
          const name = fullLawMatch[2];
          const article = fullLawMatch[3];
          
          structuredLegalReferences.push({
            name: name + (fullLawMatch[0].includes('Kanunu') ? ' Kanunu' : ' Kanun'),
            number,
            article,
            url: `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=${number}&MevzuatTur=1&MevzuatTertip=5#MADDE_${article}`
          });
          continue;
        }
        
        // Diğer formatları burada işleyebiliriz...
      }
    }
    
    // Tekrarlanan referansları temizle (aynı kanun ve madde numarasına sahip olanları birleştir)
    const uniqueRefs = {};
    for (const ref of structuredLegalReferences) {
      const key = `${ref.code || ref.number}_${ref.article}`;
      if (!uniqueRefs[key]) {
        uniqueRefs[key] = ref;
      }
    }
    
    return {
      cleanedText,
      structuredLegalReferences: Object.values(uniqueRefs)
    };
  }
  
  /**
   * Dilekçe içeriği oluşturma
   * @param {string} prompt - Dilekçe promptu
   * @returns {Object} - Oluşturulan dilekçe yanıtı
   */
  async generatePetitionContent(prompt) {
    try {
      // Gemini API ayarları
      const generationConfig = {
        temperature: 0.1, // Daha deterministik yanıtlar için düşük sıcaklık
        topK: 20,
        topP: 0.95,
        maxOutputTokens: 8192, // Uzun içerik için yüksek token limiti
      };

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

      // İçerik oluştur
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      return {
        text: response.text()
      };
    } catch (error) {
      console.error('Dilekçe oluşturma API hatası:', error);
      throw new Error('Dilekçe oluşturulurken bir hata meydana geldi');
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