// frontend/src/components/Message.jsx

import React from 'react';
import { useChatContext } from '../contexts/ChatContext';
import LegalReferenceLink from './LegalReferenceLink';

/**
 * Tekil mesaj bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {string} props.role - Mesaj rolü (user/assistant)
 * @param {string} props.content - Mesaj içeriği
 * @param {Array} props.legalReferences - Yasal referanslar
 * @param {boolean} props.documentContext - Doküman bağlamı var mı?
 * @param {string} props.documentName - Doküman adı
 * @param {boolean} props.error - Hata durumu
 */
function Message({ role, content, legalReferences = [], documentContext = false, documentName = '', error = false }) {
  const { darkMode } = useChatContext();
  
  /**
   * Mesajı düzenli bir şekilde biçimlendirir
   * @param {string} text - Biçimlendirilecek metin
   * @returns {JSX.Element} - Biçimlendirilmiş metin
   */
  const formatLegalContent = (text) => {
    if (!text) return null;
    
    // Yıldız ve bold işaretlerini temizle
    text = text.replace(/\*\*/g, '');
    
    // Yasal bölümleri tespit et
    let sections = [];
    let currentSection = '';
    
    // Metni satırlara böl
    const lines = text.split('\n');
    
    // Yasal bölüm başlıkları
    const legalSectionHeaders = [
      'İlgili Yasal Düzenleme/Hüküm Özeti:',
      'Doğrudan İlişkili Madde veya Hüküm Alıntıları:',
      'İlgili Yargı Kararları veya İçtihatlar:',
      'Uygulamadaki Pratik Yansıması:'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Yeni bölüm başlangıcı kontrolü
      const isSectionHeader = legalSectionHeaders.some(header => 
        line.includes(header));
      
      if (isSectionHeader) {
        if (currentSection.trim()) {
          sections.push(currentSection.trim());
        }
        currentSection = line;
      } else {
        currentSection += '\n' + line;
      }
    }
    
    // Son bölümü ekle
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    // Eğer bölüm bulunamadıysa tüm metni döndür
    if (sections.length === 0) {
      return (
        <div className="whitespace-pre-wrap">{highlightReferences(text, legalReferences)}</div>
      );
    }
    
    // Bölümleri sırala - Uygulamadaki Pratik Yansıması her zaman en başta olsun
    let orderedSections = [];
    let pratikYansimaSection = sections.find(section => section.includes('Uygulamadaki Pratik Yansıması:'));
    
    if (pratikYansimaSection) {
      orderedSections.push(pratikYansimaSection);
      sections = sections.filter(section => !section.includes('Uygulamadaki Pratik Yansıması:'));
    }
    
    // Diğer bölümleri ekle
    orderedSections = [...orderedSections, ...sections];
    
    // Bölümleri formatla
    return (
      <div className="legal-content">
        {orderedSections.map((section, index) => {
          // Başlık ve içerik ayırma
          let title = '';
          let content = section;
          
          // Başlık tespiti
          for (const header of legalSectionHeaders) {
            if (section.includes(header)) {
              title = header;
              content = section.replace(header, '').trim();
              break;
            }
          }
          
          // Özel yasal bölüm stilleri
          let sectionClass = '';
          if (title.includes('Yasal Düzenleme') || title.includes('Hüküm Özeti')) {
            sectionClass = 'legal-section-summary';
          } else if (title.includes('İlişkili Madde') || title.includes('Hüküm Alıntıları')) {
            sectionClass = 'legal-section-citation';
          } else if (title.includes('Yargı Kararları') || title.includes('İçtihatlar')) {
            sectionClass = 'legal-section-cases';
          } else if (title.includes('Pratik Yansıması')) {
            sectionClass = 'legal-section-practical';
          }
          
          return (
            <div key={index} className={`mt-3 ${sectionClass}`}>
              {title && (
                <h3 className={`font-bold text-sm mb-1 ${
                  darkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {title}
                </h3>
              )}
              <div className={`pl-1 ${
                darkMode ? 'border-l-2 border-gray-600' : 'border-l-2 border-gray-300'
              }`}>
                <div className="whitespace-pre-wrap ml-2">
                  {highlightReferences(content, legalReferences)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  /**
   * Yasal referansları vurgulayan işlev
   * @param {string} text - Vurgulanacak metin
   * @param {Array} references - Vurgulanacak referanslar
   * @returns {JSX.Element} - Vurgulanmış metin
   */
  const highlightReferences = (text, references) => {
    if (!references || references.length === 0) return text;
    
    let highlightedText = text;
    
    // ADIM 1: TEMİZLEME İŞLEMLERİ - FORMATLAMAYI DÜZELTME
    
    // Yıldız ve alt çizgileri kaldır
    highlightedText = highlightedText.replace(/[\*_]/g, '');
    
    // Gereksiz tırnak işaretlerini temizle
    highlightedText = highlightedText.replace(/"+/g, '"');
    highlightedText = highlightedText.replace(/"+/g, '"');
    
    // Tekrarlanan kanun isimlerini düzelt
    highlightedText = highlightedText.replace(/(\d{4} sayılı [^\n<>]*? Kanunu)[^\n<>\d]*(aynı sayı tekrar edilebilir:)?\s*\1/g, '$1');
    highlightedText = highlightedText.replace(/(\d{4} sayılı [^\n<>]*? Kanunu)\s+\1/g, '$1');
    
    // Yazım biçimini düzelt: 2577 Sayılı -> 2577 sayılı (tutarlılık için)
    highlightedText = highlightedText.replace(/(\d{4}) Sayılı/g, '$1 sayılı');
    
    // Standardize edilmiş format: "6102 sayılı Türk Ticaret Kanunu Madde 573"
    const standardFormatRegex = /(\d{1,5})\s+sayılı\s+([^<>\n]+?)\s+(?:Kanunu|Kanun)\s+[Mm]adde\s+(\d+[a-z]?(?:\/\d+)?)/g;
    
    // Yasal referansları linkleme
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // İlk olarak verilen referansları kontrol edelim
    if (references && references.length > 0) {
      references.forEach(reference => {
        // text özelliği varsa kullan, yoksa oluştur
        const refText = reference.text || 
                      (reference.number && reference.name && reference.article ? 
                       `${reference.number} sayılı ${reference.name} Madde ${reference.article}` : null);
        
        if (refText) {
          // Güvenli regex oluştur - özel karakterleri escape et
          const safeText = refText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(safeText, 'g');
          
          while ((match = regex.exec(highlightedText)) !== null) {
            // Eğer bu referans zaten işlenmiş bir alanın içindeyse atla
            if (match.index < lastIndex) continue;
            
            // Referanstan önceki metni ekle
            if (match.index > lastIndex) {
              parts.push(highlightedText.substring(lastIndex, match.index));
            }
            
            // Referans link bileşenini ekle
            parts.push(
              <LegalReferenceLink 
                key={`ref-${parts.length}`} 
                reference={reference} 
              />
            );
            
            // Son konumu güncelle
            lastIndex = match.index + match[0].length;
          }
        }
      });
    }
    
    // Ardından standart format regex ile arayalım (text ile eşleşmeyen referanslar için)
    while ((match = standardFormatRegex.exec(highlightedText)) !== null) {
      // Eğer bu referans zaten işlenmiş bir alanın içindeyse atla
      if (match.index < lastIndex) continue;
      
      // Referanstan önceki metni ekle
      if (match.index > lastIndex) {
        parts.push(highlightedText.substring(lastIndex, match.index));
      }
      
      // Kanun numarası, adı ve madde numarasını al
      const kanunNo = match[1];
      const kanunAdi = match[2].trim();
      const maddeNo = match[3];
      
      // Referans nesnesini oluştur
      const reference = {
        number: kanunNo,
        name: kanunAdi,
        article: maddeNo,
        text: match[0]
      };
      
      // Referans link bileşenini ekle
      parts.push(
        <LegalReferenceLink 
          key={`ref-${parts.length}`} 
          reference={reference} 
        />
      );
      
      // Son konumu güncelle
      lastIndex = match.index + match[0].length;
    }
    
    // Kalan metni ekle
    if (lastIndex < highlightedText.length) {
      parts.push(highlightedText.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : highlightedText;
  };
  
  return (
    <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      <div 
        className={`inline-block max-w-3xl rounded-lg p-3 ${
          role === 'user' 
            ? darkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-900'
            : error 
              ? darkMode
                ? 'bg-red-900 text-red-100'
                : 'bg-red-50 text-red-800'
              : darkMode
                ? 'bg-gray-700 text-gray-100'
                : 'bg-gray-100 text-gray-900'
        }`}
      >
        {role === 'assistant' && (
          <div className={`font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Hukuki Asistan
          </div>
        )}
        
        {/* Doküman bağlamı var ise göster */}
        {documentContext && documentName && (
          <div className={`text-xs mb-2 ${
            role === 'user'
              ? darkMode
                ? 'bg-blue-700 text-blue-200'
                : 'bg-blue-200 text-blue-800'
              : darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-200 text-gray-700'
          } py-1 px-2 rounded-full inline-block`}>
            <span role="img" aria-label="document">📄</span> {documentName}
          </div>
        )}
        
        <div className="text-left">
          {role === 'assistant' && !error
            ? formatLegalContent(content)
            : <div className="whitespace-pre-wrap">{content}</div>
          }
        </div>
        
        {/* Yasal referanslar bölümü - yeni yapılandırılmış format */}
        {role === 'assistant' && !error && legalReferences && legalReferences.length > 0 && (
          <div className={`mt-4 pt-3 border-t ${
            darkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <div className={`text-xs font-semibold mb-2 flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Yasal Referanslar
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {legalReferences.map((ref, idx) => {
                // Yapılandırılmış referans kontrolü
                if (typeof ref === 'object' && (ref.code || ref.name)) {
                  return (
                    <LegalReferenceLink 
                      key={idx} 
                      reference={ref}
                      className={`text-xs cursor-pointer ${
                        darkMode
                          ? 'bg-blue-900/20 hover:bg-blue-900/30'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    />
                  );
                }
                
                // Eski tip string referanslar için (geriye uyumluluk)
                // TBK maddelerini ayrı şekilde işle
                if (typeof ref === 'string') {
                  if (ref.includes("TBK") || ref.includes("Türk Borçlar Kanunu")) {
                    const match = ref.match(/(?:TBK|Türk Borçlar Kanunu).*?Madde\s+(\d+)/i);
                    if (match && match[1]) {
                      const maddeNo = match[1];
                      return (
                        <a 
                          key={idx}
                          href={`https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1&MevzuatTertip=5#MADDE_${maddeNo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Türk Borçlar Kanunu Madde"
                          className={`text-xs px-2 py-1 rounded inline-flex items-center cursor-pointer hover:opacity-90 transition-all ${
                            darkMode
                              ? 'bg-blue-900/20 text-blue-100 hover:bg-blue-900/30'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          <span>{ref}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            className="w-3.5 h-3.5 ml-1 mb-0.5"
                          >
                            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                          </svg>
                        </a>
                      );
                    }
                  }
                  
                  // Diğer referanslar için normal gösterimi kullan
                  return (
                <span 
                  key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                    darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ref}
                </span>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;