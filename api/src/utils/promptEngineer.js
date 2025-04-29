// api/src/utils/promptEngineer.js

/**
 * Kullanıcı sorusunu zenginleştirir ve bağlam ekler
 * @param {string} userQuestion - Kullanıcının sorusu
 * @param {Array} conversationHistory - Önceki konuşma geçmişi
 * @returns {string} - Zenginleştirilmiş prompt
 */
function enrichPrompt(userQuestion, conversationHistory = []) {
    // Soruyu analiz et
    const topicAnalysis = analyzeQuestion(userQuestion);
    
    // Önceki bağlamı incele 
    const contextRelatedInfo = extractContextFromHistory(conversationHistory);
    
    // Pratik bilgi sorusu mu analiz et
    const isPracticalInfoQuestion = checkIfPracticalQuestion(userQuestion);
    
    // Soruyu zenginleştir ve daha spesifik hale getir
    let enrichedQuestion = `
    ### Kullanıcı Sorusu: ${userQuestion}
    
    ### Konu Analizi:
    ${topicAnalysis}
    
    ### Önceki Konuşma Bağlamı:
    ${contextRelatedInfo}
    
    ### Cevap İçin Yönlendirmeler:
    1. Bu soruyla ilgili güncel yasal mevzuatı belirt
    2. İlgili kanun maddeleri, yönetmelikler veya genelgelerden alıntılar yap
    3. Mümkünse Yargıtay/Danıştay gibi yüksek mahkemelerin konuyla ilgili emsal kararlarına atıf yap
    4. Yanıtı hem hukuki açıdan doğru hem de anlaşılır bir dille aktarmaya özen göster
    `;
    
    // Eğer pratik bilgi sorusu ise yanıt sıralamasını değiştir
    if (isPracticalInfoQuestion) {
      enrichedQuestion += `
    ### Yanıt Sıralaması:
    Bu soru pratik/prosedürel bilgi gerektiriyor. Yanıtını şu sırayla yapılandır:
    
    1. Önce kullanıcının doğrudan sorduğu soruya net ve pratik bir cevap ver (gerekli belgeler, adımlar, prosedürler)
    2. Sonra yasal dayanakları ve detayları açıkla
    
    **Uygulamadaki Pratik Yansıması:**
    [Kullanıcının sorduğu pratik soruya doğrudan cevap ver, gerekli belgeleri listele, prosedürü açıkla]
    
    **İlgili Yasal Düzenleme/Hüküm Özeti:**
    [İlgili yasal düzenlemeyi sonra açıkla]
    
    **Doğrudan İlişkili Madde veya Hüküm Alıntıları:**
    [Kanun maddelerini alıntıla]
    
    **İlgili Yargı Kararları veya İçtihatlar:**
    [Varsa içtihatları belirt]
    `;
    } else {
      enrichedQuestion += `
    ### Yanıt Biçimlendirme:
    Cevabı aşağıdaki bölümlere ayırarak yanıtla:
    
    **İlgili Yasal Düzenleme/Hüküm Özeti:**
    [İlgili yasal düzenlemeyi ve ana hükümleri özet olarak yaz]
    
    **Doğrudan İlişkili Madde veya Hüküm Alıntıları:**
    [İlgili kanun maddelerini veya hükümleri tırnak içinde doğrudan alıntıla]
    
    **İlgili Yargı Kararları veya İçtihatlar:**
    [Varsa ilgili yargı kararları veya içtihatları belirt]
    
    **Uygulamadaki Pratik Yansıması:**
    [Bu hukuki düzenlemelerin pratik etkisini açıkla]
    `;
    }
    
    enrichedQuestion += `
    NOT: Yanıtını okunabilir ve düzenli bir formatta yap. Tüm kanun maddelerini ve yasal referansları belirgin şekilde vurgula. Cevabı çok uzun ve karmaşık yapmaktan kaçın.
    `;
    
    return enrichedQuestion;
  }
  
  /**
   * Bir sorunun pratik bilgi gerektiren bir soru olup olmadığını kontrol eder
   * @param {string} question - Kullanıcı sorusu
   * @returns {boolean} - Pratik bilgi sorusu mu
   */
  function checkIfPracticalQuestion(question) {
    const practicalKeywords = [
      'belge', 'belgeler', 'dokuman', 'döküman', 'evrak', 'evraklar',
      'hangi', 'nasıl', 'ne gerekli', 'gereklilik', 'gerekli', 'şart',
      'prosedür', 'adım', 'süreç', 'işlem', 'başvuru', 'form',
      'ne yapmalıyım', 'yapmam gereken', 'nereye', 'ne zaman',
      'ihtiyaç', 'kaç gün', 'süre', 'maliyet', 'ücret', 'harç'
    ];
    
    const questionLower = question.toLowerCase();
    
    // Soru işareti ile biten sorular
    if (questionLower.includes('?')) {
      for (const keyword of practicalKeywords) {
        if (questionLower.includes(keyword)) {
          return true;
        }
      }
    }
    
    // Özel soru kalıpları
    if (questionLower.includes('hangi belge') || 
        questionLower.includes('ne gerek') || 
        questionLower.includes('nasıl yap') ||
        questionLower.includes('gerekli olan') ||
        questionLower.includes('ihtiyaç var') ||
        questionLower.includes('neler gerek')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Soruyu analiz eder ve ilgili hukuk alanını tespit eder
   * @param {string} question - Kullanıcı sorusu
   * @returns {string} - Analiz sonucu
   */
  function analyzeQuestion(question) {
    // Sorunun hangi hukuk alanıyla ilgili olduğunu tespit et
    const legalAreas = [
      { area: "Ceza Hukuku", keywords: ["ceza", "suç", "hapis", "tutuklama", "soruşturma", "kovuşturma", "yakalama", "gözaltı", "mahkum", "sabıka"] },
      { area: "Medeni Hukuk", keywords: ["evlilik", "boşanma", "velayet", "nafaka", "miras", "mal paylaşımı", "aile", "nişan", "maddi manevi tazminat"] },
      { area: "İş Hukuku", keywords: ["işveren", "işçi", "tazminat", "kıdem", "ihbar", "işten çıkarma", "iş akdi", "fesih", "mobbing", "fazla mesai", "yıllık izin"] },
      { area: "İdare Hukuku", keywords: ["idari", "kamu", "memur", "devlet", "idari yargı", "iptal davası", "yürütmeyi durdurma", "kamu görevlisi", "disiplin cezası"] },
      { area: "Ticaret Hukuku", keywords: ["şirket", "ticari", "tacir", "iflas", "konkordato", "anonim", "limited", "hisse", "pay", "ticari defter", "bono", "çek", "poliçe"] },
      { area: "Vergi Hukuku", keywords: ["vergi", "matrah", "mükellef", "beyanname", "maliye", "tahakkuk", "tahsil", "stopaj", "kdv", "gelir vergisi", "kurumlar vergisi"] },
      { area: "Borçlar Hukuku", keywords: ["borç", "alacak", "temerrüt", "sözleşme", "ifa", "tazminat", "zarar", "ziyan", "imzasız senet", "ipotek", "kefil", "borçlu", "alacaklı"] },
      { area: "Tüketici Hukuku", keywords: ["tüketici", "ayıplı mal", "cayma", "ürün", "hizmet", "garanti", "iade", "sözleşmeden dönme", "tüketici hakem heyeti"] },
      { area: "Sosyal Güvenlik Hukuku", keywords: ["emeklilik", "sigorta", "prim", "bağkur", "ssk", "sgk", "maluliyet", "yaşlılık", "ölüm aylığı", "yetim aylığı"] },
      { area: "Kira Hukuku", keywords: ["kira", "kiracı", "kiralayan", "tahliye", "taşınmaz", "konut", "işyeri", "depozito", "kefil", "kira artışı", "kira sözleşmesi"] }
    ];
    
    // Soruyu anahtar kelimelere göre analiz et
    let detectedAreas = [];
    legalAreas.forEach(area => {
      if (area.keywords.some(keyword => question.toLowerCase().includes(keyword.toLowerCase()))) {
        detectedAreas.push(area.area);
      }
    });
    
    // Spesifik yasal referansları ara (örn: "4857 sayılı kanun", "TCK 142")
    const legalReferences = extractLegalReferences(question);
    
    return `
      Tespit Edilen Hukuk Alanları: ${detectedAreas.length > 0 ? detectedAreas.join(", ") : "Belirsiz"}
      Tespit Edilen Yasal Referanslar: ${legalReferences.length > 0 ? legalReferences.join(", ") : "Yok"}
      Pratik Bilgi Sorusu Mu: ${checkIfPracticalQuestion(question) ? "Evet" : "Hayır"}
    `;
  }
  
  /**
   * Metinden yasal referansları çıkarır
   * @param {string} text - İncelenecek metin
   * @returns {Array} - Bulunan yasal referanslar
   */
  function extractLegalReferences(text) {
    const references = [];
    
    // Kanun numarası tespiti (örn: 4857 sayılı kanun)
    const lawNumberPattern = /(\d{3,5})\s*say[ıi]l[ıi]\s*(kanun|yasa|torba|[İi]ş\s*Kanunu|[Cc]eza\s*Kanunu|[Bb]orçlar\s*Kanunu)/gi;
    let match;
    while ((match = lawNumberPattern.exec(text)) !== null) {
      references.push(`${match[1]} Sayılı ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}`);
    }
    
    // Kanun kısaltmaları (TCK, CMK, vb.)
    const codePattern = /(TCK|CMK|HMK|TMK|TTK|İİK|VUK|HUMK|SGK|İYUK|AYM|AYMK|TBK|KVK|KVKK|KHK)\b/g;
    while ((match = codePattern.exec(text)) !== null) {
      references.push(match[1]);
    }
    
    // Madde referansları
    const articlePattern = /((madde|md\.|m\.)\s*(\d+))|((TCK|CMK|HMK|TMK|TTK|İİK|TBK)\s*\.?\s*(\d{1,3}))/gi;
    while ((match = articlePattern.exec(text)) !== null) {
      if (match[2]) {
        references.push(`Madde ${match[3]}`);
      } else if (match[5]) {
        references.push(`${match[5]} Madde ${match[6]}`);
      }
    }
    
    // Yargı kararları
    const courtPattern = /(Yargıtay|Danıştay|Anayasa Mahkemesi|AYM|AİHM)[\s,]+((\d+)\.?\s*([A-Za-z]+\.?)?\s*Daire(si)?|Genel Kurul|Büyük Daire)[\s,]+(\d+\/\d+|\d+\.\d+\.\d+)/gi;
    while ((match = courtPattern.exec(text)) !== null) {
      references.push(`${match[1]} ${match[2]} ${match[6]}`);
    }
    
    // Tekrarlayan referansları temizle
    const uniqueReferences = [...new Set(references)];
    
    return uniqueReferences;
  }
  
  /**
   * Konuşma geçmişinden bağlam bilgisi çıkarır
   * @param {Array} history - Konuşma geçmişi
   * @returns {string} - Çıkarılan bağlam bilgisi
   */
  function extractContextFromHistory(history) {
    if (!history || history.length === 0) {
      return "Önceki konuşma bağlamı bulunmamaktadır.";
    }
    
    // Son 3 konuşmayı al
    const relevantHistory = history.slice(-3);
    
    // Önemli yasal referansları ve konuları çıkar
    let topics = new Set();
    let references = new Set();
    
    relevantHistory.forEach(exchange => {
      // Kullanıcı sorusundaki ve asistan yanıtındaki yasal referansları bul
      let refs = extractLegalReferences(exchange.userQuestion + " " + exchange.assistantResponse);
      refs.forEach(ref => references.add(ref));
      
      // Önceki konuşmadaki hukuk alanlarını tespit et
      let analysis = analyzeQuestion(exchange.userQuestion + " " + exchange.assistantResponse);
      let areaMatch = analysis.match(/Tespit Edilen Hukuk Alanları: ([^]*?)(?=\n|$)/);
      if (areaMatch && areaMatch[1] !== "Belirsiz") {
        areaMatch[1].split(", ").forEach(area => topics.add(area));
      }
    });
    
    return `
      Önceki Konuşma Konuları: ${Array.from(topics).join(", ") || "Belirlenemedi"}
      Bahsedilen Yasal Referanslar: ${Array.from(references).join(", ") || "Yok"}
      Son Konuşma Özeti: ${summarizeLastExchange(relevantHistory[relevantHistory.length - 1])}
    `;
  }
  
  /**
   * Son konuşmayı özetler
   * @param {Object} exchange - Son konuşma
   * @returns {string} - Özet
   */
  function summarizeLastExchange(exchange) {
    if (!exchange) return "Önceki konuşma bulunmuyor.";
    
    // Son soruyu ve yanıtı özetle
    return `Kullanıcı '${truncateText(exchange.userQuestion, 50)}' konusunda sormuş, 
    yanıtta ${getResponseCharacteristics(exchange.assistantResponse)} bilgiler verilmiştir.`;
  }
  
  /**
   * Yanıtın karakteristik özelliklerini belirler
   * @param {string} response - Yanıt metni
   * @returns {string} - Yanıt özellikleri
   */
  function getResponseCharacteristics(response) {
    // Yanıttaki yasal referans sayısını, uzunluğu vs. gibi özellikleri çıkar
    const legalRefs = extractLegalReferences(response);
    
    let characteristics = [];
    if (legalRefs.length > 0) {
      characteristics.push(`${legalRefs.length} yasal referans içeren`);
    }
    
    if (response.length < 200) {
      characteristics.push("kısa ve özet");
    } else if (response.length > 800) {
      characteristics.push("detaylı ve kapsamlı");
    } else {
      characteristics.push("orta uzunlukta");
    }
    
    if (response.includes("Yargıtay") || response.includes("Danıştay") || response.includes("AYM")) {
      characteristics.push("içtihatlar içeren");
    }
    
    return characteristics.join(", ");
  }
  
  /**
   * Metni belirli bir uzunlukta kısaltır
   * @param {string} text - Metin
   * @param {number} maxLength - Maksimum uzunluk
   * @returns {string} - Kısaltılmış metin
   */
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
  
  module.exports = { 
    enrichPrompt,
    analyzeQuestion,
    extractLegalReferences,
    extractContextFromHistory,
    summarizeLastExchange,
    getResponseCharacteristics,
    truncateText,
    checkIfPracticalQuestion
  };