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