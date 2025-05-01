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
    
    ### Kanun Madde Referansları:
    1. Bahsettiğin TÜM kanun maddelerini aşağıdaki formatta belirt:
       - Tam format şöyle olmalı: "6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Madde 5"
       - Her zaman kanun numarasını, tam adını ve madde numarasını içerecek şekilde yaz
       - Yazım birliği için "sayılı" kelimesini küçük harfle yaz
       - Alıntı yaparken doğrudan bu formatta kullan
       - Herhangi bir metin biçimlendirme (yıldız, alt çizgi, tırnak işareti) KULLANMA
    2. Alıntı yaparken mutlaka doğru madde numarasını belirt
    3. Yanıtın içerisinde geçen tüm kanun maddeleri için yukarıdaki standart gösterimi kullan
    `;
    
    // Eğer pratik bilgi sorusu ise yanıt sıralamasını değiştir
    if (isPracticalInfoQuestion) {
      enrichedQuestion += `
    ### Yanıt Sıralaması:
    Bu soru pratik/prosedürel bilgi gerektiriyor. Yanıtını şu sırayla yapılandır:
    
    1. Önce kullanıcının doğrudan sorduğu soruya net ve pratik bir cevap ver (gerekli belgeler, adımlar, prosedürler)
    2. Sonra yasal dayanakları ve detayları açıkla
    
    Uygulamadaki Pratik Yansıması:
    [Kullanıcının sorduğu pratik soruya doğrudan cevap ver, gerekli belgeleri listele, prosedürü açıkla]
    
    İlgili Yasal Düzenleme/Hüküm Özeti:
    [İlgili yasal düzenlemeyi sonra açıkla]
    
    Doğrudan İlişkili Madde veya Hüküm Alıntıları:
    [Kanun maddelerini alıntıla]
    
    İlgili Yargı Kararları veya İçtihatlar:
    [Varsa içtihatları belirt]
    `;
    } else {
      enrichedQuestion += `
    ### Yanıt Biçimlendirme:
    Cevabı aşağıdaki bölümlere ayırarak yanıtla:
    
    İlgili Yasal Düzenleme/Hüküm Özeti:
    [İlgili yasal düzenlemeyi ve ana hükümleri özet olarak yaz]
    
    Doğrudan İlişkili Madde veya Hüküm Alıntıları:
    [İlgili kanun maddelerini veya hükümleri doğrudan alıntıla]
    
    İlgili Yargı Kararları veya İçtihatlar:
    [Varsa ilgili yargı kararları veya içtihatları belirt]
    
    Uygulamadaki Pratik Yansıması:
    [Bu hukuki düzenlemelerin pratik etkisini açıkla]
    `;
    }
    
    enrichedQuestion += `
    ### Yanıt Yapısı:
    Yanıtın sonunda, bahsettiğin tüm kanun maddelerini aşağıdaki JSON formatında listele (bu liste kullanıcıya gösterilmeyecek, sistem tarafından kullanılacaktır):
    
    \`\`\`json
    {
      "legalReferences": [
        {
          "number": "6563", 
          "name": "Elektronik Ticaretin Düzenlenmesi Hakkında Kanun", 
          "article": "5", 
          "text": "6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Madde 5" 
        },
        {
          "number": "4857", 
          "name": "İş Kanunu", 
          "article": "18",
          "text": "4857 sayılı İş Kanunu Madde 18"
        }
      ]
    }
    \`\`\`
    
    NOT 1: Yukarıdaki JSON formatına MUTLAKA uy. Her kanun maddesi için "number" (kanun numarası), "name" (tam adı), "article" (madde numarası) ve "text" (tam gösterim metni) bilgilerini içermelidir.
    NOT 2: Eğer bir bilgi yoksa (örneğin kısaltma), o alanı JSON'da dahil etme.
    NOT 3: Yanıtında bahsettiğin TÜM kanun maddelerini bu JSON'a eklediğinden emin ol.
    NOT 4: JSON formatı çıktısı yanıtından sonra, üç backtick içinde olmalıdır.
    NOT 5: "text" alanında asla yıldız, alt çizgi, tırnak işareti gibi biçimlendirmeler kullanma.
    
    Yanıtını okunabilir ve düzenli bir formatta yap. Tüm kanun maddelerini ve yasal referansları belirgin şekilde vurgula. Cevabı çok uzun ve karmaşık yapmaktan kaçın.
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
    
    // Tam kanun ismi ve madde referansları - öncelikli olarak bunları yakala
    const fullLawArticlePattern = /(\d{3,5})\s*say[ıi]l[ıi]\s*(.*?)\s*[Kk]anunu['nu]*\s*(?:[Mm]adde|[Mm]d\.?|[Mm]\.?\s*)(\d{1,3})/gi;
    let match;
    while ((match = fullLawArticlePattern.exec(text)) !== null) {
      // Standardize edilmiş format 
      references.push(`${match[1]} sayılı ${match[2].trim()} Kanunu Madde ${match[3]}`);
    }
    
    // Kanun numarası tespiti (Tam madde referansı olmadan)
    const lawNumberPattern = /(\d{3,5})\s*say[ıi]l[ıi]\s*(kanun|yasa|torba|[İi]ş\s*Kanunu|[Cc]eza\s*Kanunu|[Bb]orçlar\s*Kanunu|[İiI]dari\s*[Yy]argılama\s*[Uu]sulü\s*Kanunu|[Tt]ürk\s*[Mm]edeni\s*Kanunu)/gi;
    while ((match = lawNumberPattern.exec(text)) !== null) {
      // Önceki metni kontrol et, eğer zaten maddeyle birlikte yakalanmadıysa ekle
      const prevText = text.substring(Math.max(0, match.index - 50), match.index);
      const nextText = text.substring(match.index, Math.min(text.length, match.index + 50));
      
      // Eğer tam kanun referansı içinde değilse ekle
      if (!nextText.match(/\s+[Mm]adde\s+\d+/)) {
        references.push(`${match[1]} Sayılı ${match[2].charAt(0).toUpperCase() + match[2].slice(1).trim()}`);
      }
    }
    
    // Kanun kısaltmaları (TCK, CMK, vb.)
    const codePattern = /(TCK|CMK|HMK|TMK|TTK|İİK|VUK|HUMK|SGK|İYUK|AYM|AYMK|TBK|KVK|KVKK|KHK|TKHK)\b/g;
    while ((match = codePattern.exec(text)) !== null) {
      // Sonraki metni kontrol et, eğer maddeyle birlikte yakalanmadıysa ekle
      const nextText = text.substring(match.index, Math.min(text.length, match.index + 30));
      if (!nextText.match(/\s+[Mm]adde\s+\d+/)) {
        references.push(match[1]);
      }
    }
    
    // Kısaltmalı madde referansları (TCK Madde 112 gibi)
    const codeArticlePattern = /(TCK|CMK|HMK|TMK|TTK|İİK|TBK|TKHK)\s*(?:[Mm]adde|[Mm]d\.?|[Mm]\.?)\s*(\d{1,3})/g;
    while ((match = codeArticlePattern.exec(text)) !== null) {
      references.push(`${match[1]} Madde ${match[2]}`);
    }
    
    // Bağımsız madde referansları (metinde kanunsuz "Madde X" şeklinde geçenler)
    const articlePattern = /(?:[Mm]adde|[Mm]d\.?|[Mm]\.?\s*)(\d{1,3})/g;
    while ((match = articlePattern.exec(text)) !== null) {
      // Önceki ve sonraki metni kontrol et
      const prevText = text.substring(Math.max(0, match.index - 100), match.index);
      
      // Eğer kanun ismi ya da kısaltması içeren bir madde referansı değilse
      if (!(/\d{3,5}\s*say[ıi]l[ıi]/i.test(prevText) || 
            /(TCK|CMK|HMK|TMK|TTK|İİK|TBK)[^\w]*$/i.test(prevText))) {
        
        // 80 karakter öncesinde ve Madde X sonrasında 80 karakter içinde kanun adı var mı kontrol et 
        const contextText = text.substring(Math.max(0, match.index - 80), 
                                           Math.min(text.length, match.index + match[0].length + 80));
        
        // Bilinen kanunları kontrol et
        if (contextText.includes("İdari Yargılama Usulü") || contextText.includes("2577 sayılı")) {
          references.push(`2577 sayılı İdari Yargılama Usulü Kanunu Madde ${match[1]}`);
        } else if (contextText.includes("Türk Medeni") || contextText.includes("4721 sayılı")) {
          references.push(`4721 sayılı Türk Medeni Kanunu Madde ${match[1]}`);
        } else if (contextText.includes("Türk Borçlar") || contextText.includes("6098 sayılı")) {
          references.push(`6098 sayılı Türk Borçlar Kanunu Madde ${match[1]}`);
        } else if (contextText.includes("Türk Ceza") || contextText.includes("5237 sayılı")) {
          references.push(`5237 sayılı Türk Ceza Kanunu Madde ${match[1]}`);
        } else if (contextText.includes("İş Kanunu") || contextText.includes("4857 sayılı")) {
          references.push(`4857 sayılı İş Kanunu Madde ${match[1]}`);
        } else if (contextText.includes("Tüketicinin Korunması") || contextText.includes("6502 sayılı")) {
          references.push(`6502 sayılı Tüketicinin Korunması Hakkında Kanun Madde ${match[1]}`);
        } else {
          // Referansı ekle
          references.push(`Madde ${match[1]}`);
        }
      }
    }
    
    // Yargı kararları
    const courtPattern = /(Yargıtay|Danıştay|Anayasa Mahkemesi|AYM|AİHM)[\s,]+((\d+)\.?\s*([A-Za-z]+\.?)?\s*Daire(si)?|Genel Kurul|Büyük Daire)[\s,]+(\d+\/\d+|\d+\.\d+\.\d+)/gi;
    while ((match = courtPattern.exec(text)) !== null) {
      references.push(`${match[1]} ${match[2]} ${match[6]}`);
    }
    
    // Tekrarlayan referansları temizle, benzersiz hale getir ve sırala
    // Aynı kanunun farklı maddeleri için gruplandırma yap
    const uniqueRefs = new Map();
    
    references.forEach(ref => {
      // Standardize et (büyük/küçük harf, fazla boşluk vb.)
      const standardRef = ref.replace(/\s+/g, ' ').trim();
      
      // Referansı benzersiz şekilde sakla
      if (!uniqueRefs.has(standardRef.toLowerCase())) {
        uniqueRefs.set(standardRef.toLowerCase(), standardRef);
      }
    });
    
    // Sıralama için yardımcı fonksiyon
    const sortRefs = (refs) => {
      return refs.sort((a, b) => {
        // Tam kanun ve madde referanslarını üstte göster
        const aFullRef = /\d{3,5} sayılı .* Kanunu Madde \d+/.test(a);
        const bFullRef = /\d{3,5} sayılı .* Kanunu Madde \d+/.test(b);
        
        if (aFullRef && !bFullRef) return -1;
        if (!aFullRef && bFullRef) return 1;
        
        // Ardından kısaltma madde referanslarını göster
        const aCodeRef = /(TCK|CMK|HMK|TMK|TTK|İİK|TBK) Madde \d+/.test(a);
        const bCodeRef = /(TCK|CMK|HMK|TMK|TTK|İİK|TBK) Madde \d+/.test(b);
        
        if (aCodeRef && !bCodeRef) return -1;
        if (!aCodeRef && bCodeRef) return 1;
        
        // Kanun referansları
        const aLawRef = /\d{3,5} Sayılı/.test(a);
        const bLawRef = /\d{3,5} Sayılı/.test(b);
        
        if (aLawRef && !bLawRef) return -1;
        if (!aLawRef && bLawRef) return 1;
        
        // Alfabetik sırala
        return a.localeCompare(b);
      });
    };
    
    // Benzersiz referansları sıralayarak döndür
    return sortRefs([...uniqueRefs.values()]);
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