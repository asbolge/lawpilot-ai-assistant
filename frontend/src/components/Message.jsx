// frontend/src/components/Message.jsx

import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

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
  const { showLegalReferenceDetails, darkMode } = useChatContext();
  
  /**
   * Mesajı düzenli bir şekilde biçimlendirir
   * @param {string} text - Biçimlendirilecek metin
   * @returns {JSX.Element} - Biçimlendirilmiş metin
   */
  const formatLegalContent = (text) => {
    if (!text) return null;
    
    // Yasal bölümleri tespit et
    const sections = [];
    let currentSection = '';
    
    // Metni satırlara böl
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Yeni bölüm başlangıcı kontrolü
      if (line.includes('**İlgili Yasal Düzenleme/Hüküm Özeti:**') || 
          line.includes('**Doğrudan İlişkili Madde veya Hüküm Alıntıları:**') ||
          line.includes('**İlgili Yargı Kararları veya İçtihatlar:**') ||
          line.includes('**Uygulamadaki Pratik Yansıması:**')) {
        
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
    
    // Bölümleri formatla
    return (
      <div className="legal-content">
        {sections.map((section, index) => {
          // Başlık ve içerik ayırma
          const titleMatch = section.match(/^\*\*(.*?)\*\*/);
          let title = titleMatch ? titleMatch[1] : '';
          let content = titleMatch ? section.substring(titleMatch[0].length).trim() : section;
          
          // Özel yasal bölüm stilleri
          let sectionClass = '';
          if (title.includes('Yasal Düzenleme') || title.includes('Hüküm Özeti')) {
            sectionClass = 'legal-section-summary';
          } else if (title.includes('İlişkili Madde') || title.includes('Hüküm Alıntıları')) {
            sectionClass = 'legal-section-citation';
          } else if (title.includes('Yargı Kararları') || title.includes('İçtihatlar')) {
            sectionClass = 'legal-section-cases';
          } else if (title.includes('Pratik Yansımalar')) {
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
    references.forEach(ref => {
      // Regex ile referansı bul ve HTML ile vurgula
      const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedRef})`, 'gi');
      highlightedText = highlightedText.replace(regex, 
        `<span class="bg-yellow-100 text-yellow-800 px-1 rounded hover:bg-yellow-200 cursor-pointer" 
               data-reference="${ref}">$1</span>`);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
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
        
        <div 
          className="text-left" 
          onClick={(e) => {
            const target = e.target;
            if (target.dataset && target.dataset.reference) {
              showLegalReferenceDetails(target.dataset.reference);
            }
          }}
        >
          {role === 'assistant' && !error
            ? formatLegalContent(content)
            : <div className="whitespace-pre-wrap">{content}</div>
          }
        </div>
        
        {/* Yasal referanslar bölümü */}
        {role === 'assistant' && !error && legalReferences && legalReferences.length > 0 && (
          <div className={`mt-3 pt-2 border-t ${
            darkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Yasal Referanslar:
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {legalReferences.map((ref, idx) => (
                <span 
                  key={idx}
                  className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    darkMode
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => showLegalReferenceDetails(ref)}
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;