// frontend/src/utils/api.js

/**
 * API URL'i
 * .env dosyasından alınabilir, burada basitlik için sabit kullanıldı
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Kullanıcı mesajını API'ye gönderir ve yanıt alır
 * @param {string} message - Kullanıcı mesajı
 * @param {Array} conversationHistory - Konuşma geçmişi
 * @returns {Promise<Object>} - API yanıtı
 */
export const sendMessage = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API istek hatası');
    }

    return await response.json();
  } catch (error) {
    console.error('API isteği başarısız:', error);
    throw error;
  }
};

/**
 * Yasal referans detaylarını API'den alır
 * @param {string} reference - Yasal referans
 * @returns {Promise<Object>} - Referans detayları
 */
export const fetchLegalReferenceDetails = async (reference) => {
  try {
    const encodedReference = encodeURIComponent(reference);
    const response = await fetch(`${API_URL}/legal-reference/${encodedReference}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API istek hatası');
    }

    return await response.json();
  } catch (error) {
    console.error('Referans detayları alınamadı:', error);
    throw error;
  }
};

/**
 * Doküman yükler
 * @param {File} file - Yüklenecek dosya
 * @returns {Promise<Object>} - Yüklenen doküman bilgileri
 */
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Doküman yükleme hatası');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Doküman yükleme başarısız:', error);
    throw error;
  }
};

/**
 * Yüklenen dokümanları listeler
 * @returns {Promise<Array>} - Doküman listesi
 */
export const getDocuments = async () => {
  try {
    const response = await fetch(`${API_URL}/documents`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Doküman listesi alınamadı');
    }
    
    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Doküman listesi alınamadı:', error);
    throw error;
  }
};

/**
 * Belirli bir dokümanı getirir
 * @param {string} docId - Doküman ID
 * @returns {Promise<Object>} - Doküman bilgileri
 */
export const getDocument = async (docId) => {
  try {
    const response = await fetch(`${API_URL}/documents/${docId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Doküman alınamadı');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Doküman alınamadı:', error);
    throw error;
  }
};

/**
 * Belgeye soru sorar
 * @param {string} docId - Doküman ID
 * @param {string} question - Soru
 * @returns {Promise<Object>} - Cevap
 */
export const askDocumentQuestion = async (docId, question) => {
  try {
    const response = await fetch(`${API_URL}/documents/${docId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Soru cevaplanamadı');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Belgeye soru sorma başarısız:', error);
    throw error;
  }
};