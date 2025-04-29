import React, { useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import LoadingIndicator from './LoadingIndicator';

/**
 * Doküman görünümü ve soru-cevap bileşeni
 */
function DocumentView() {
  const { 
    selectedDocument, 
    closeDocumentView,
    handleDocumentQuestion,
    loading,
    darkMode,
    docsLoading
  } = useChatContext();
  
  const [question, setQuestion] = useState('');
  
  if (!selectedDocument) {
    return (
      <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'}`}>
        <div className="flex justify-center items-center p-8">
          {docsLoading ? (
            <LoadingIndicator />
          ) : (
            <p>Lütfen bir belge seçin</p>
          )}
        </div>
      </div>
    );
  }
  
  /**
   * Doküman tipine göre ikonu döndürür
   * @returns {JSX.Element} - İkon
   */
  const getDocumentTypeIcon = () => {
    switch (selectedDocument.type) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2z"/>
            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029z"/>
          </svg>
        );
      case 'word':
        return (
          <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3.5 9v-1h-1v1a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1H.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H5v-1a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1h4.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H11v1a1 1 0 0 1-1 1z"/>
          </svg>
        );
      case 'image':
        return (
          <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
          </svg>
        );
    }
  };
  
  /**
   * Tarih formatlar
   * @param {string} dateString - ISO tarih formatı
   * @returns {string} - Formatlanmış tarih
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  /**
   * Form gönderildiğinde belgeye soru sorar
   * @param {Event} e - Form submit olayı
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      handleDocumentQuestion(selectedDocument.id, question);
      setQuestion('');
    }
  };
  
  /**
   * Yaygın sorular listesi
   */
  const commonQuestions = [
    "Bu belgenin ana konusu nedir?",
    "Bu belgedeki en önemli tarihler nelerdir?",
    "Bu belgedeki yasal referansları listele.",
    "Bu belgede geçen şirket/kurum isimleri nelerdir?",
    "Bu belgenin özeti nedir?"
  ];
  
  /**
   * Örnek bir soruyu soru alanına yerleştirir
   * @param {string} q - Soru
   */
  const setExampleQuestion = (q) => {
    setQuestion(q);
  };
  
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'}`}>
      {/* Belge başlığı ve bilgisi */}
      <div className={`px-4 py-3 flex items-center justify-between ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center">
          <div className="mr-2">
            {getDocumentTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium">{selectedDocument.filename}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Yüklenme: {formatDate(selectedDocument.uploadDate)}
            </p>
          </div>
        </div>
        <button 
          onClick={closeDocumentView} 
          className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Belge özeti */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Belge Özeti
        </h4>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {selectedDocument.summary || "Bu belge için özet bulunmuyor."}
        </p>
      </div>
      
      {/* Soru sorma alanı */}
      <div className="p-4">
        <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Belge Hakkında Soru Sor
        </h4>
        
        <form onSubmit={handleSubmit}>
          <div className="flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Belge hakkında bir soru sorun..."
              className={`flex-1 rounded-l-lg px-4 py-2 border focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className={`px-4 py-2 rounded-r-lg ${
                loading || !question.trim()
                  ? darkMode 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-300 text-white cursor-not-allowed'
                  : darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Soruluyor...' : 'Sor'}
            </button>
          </div>
        </form>
        
        {/* Yaygın sorular */}
        <div className="mt-4">
          <h5 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Örnek Sorular:
          </h5>
          <div className="flex flex-wrap gap-2">
            {commonQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setExampleQuestion(q)}
                className={`text-xs px-2 py-1 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentView; 