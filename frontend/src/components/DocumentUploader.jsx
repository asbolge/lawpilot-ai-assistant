import React, { useState, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Doküman yükleme bileşeni
 */
function DocumentUploader() {
  const { handleDocumentUpload, darkMode, docsLoading } = useChatContext();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  
  // Desteklenen dosya tipleri
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  /**
   * Dosya sürükleme olaylarını yönetir
   * @param {Event} e - Sürükleme olayı
   * @param {boolean} entering - Sürükleme alanına giriyor mu?
   */
  const handleDrag = (e, entering) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(entering);
  };

  /**
   * Dosya bırakma olayını yönetir
   * @param {Event} e - Bırakma olayı
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Dosya seçimi olayını yönetir
   * @param {Event} e - Dosya seçim olayı
   */
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Yükleme butonunu tetikler
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  /**
   * Dosyayı işler ve yükler
   * @param {File} file - Yüklenecek dosya
   */
  const processFile = async (file) => {
    // Dosya tipi kontrolü
    if (!supportedTypes.includes(file.type)) {
      setError('Desteklenmeyen dosya formatı. Lütfen PDF, Word veya resim (JPG/PNG) yükleyin.');
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu çok büyük. Maksimum dosya boyutu 10MB olabilir.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      // Dosyayı yükle
      const uploadedDoc = await handleDocumentUpload(file);
      
      setSuccess(`"${file.name}" başarıyla yüklendi! Şimdi belge hakkında sorular sorabilirsiniz.`);
      
      // Başarı mesajını 5 saniye sonra temizle
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      setError('Dosya yüklenirken bir hata oluştu: ' + error.message);
    }
  };

  return (
    <div className={`mt-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h3 className="font-medium mb-2">Belge Yükle</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? darkMode
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-blue-500 bg-blue-50'
            : darkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          disabled={docsLoading}
        />
        
        {docsLoading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <>
            <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Dosya yüklemek için buraya tıklayın veya sürükleyip bırakın
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              PDF, Word, JPG veya PNG (Maks. 10MB)
            </p>
          </>
        )}
      </div>
      
      {error && (
        <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-600'}`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-600'}`}>
          {success}
        </div>
      )}
    </div>
  );
}

export default DocumentUploader; 