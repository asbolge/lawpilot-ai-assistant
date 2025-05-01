// frontend/src/utils/api.js

/**
 * API URL'i
 * .env dosyasından alınabilir, burada basitlik için sabit kullanıldı
 */
const API_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Kullanıcı mesajını API'ye gönderir ve yanıt alır
 * @param {string} message - Kullanıcı mesajı
 * @param {Array} history - Konuşma geçmişi
 * @returns {Promise<Object>} - API yanıtı
 */
export const sendMessage = async (message, history = []) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, conversationHistory: history })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Mesaj gönderilirken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
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
    const response = await fetch(`${API_URL}/legal-reference/${encodeURIComponent(reference)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Referans detayları alınamadı');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Referans detayları alma hatası:', error);
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
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Doküman yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Doküman yükleme hatası:', error);
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
      throw new Error(errorData.error || 'Dokümanlar alınamadı');
    }
    
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Dokümanları getirme hatası:', error);
    throw error;
  }
};

/**
 * Belirli bir dokümanı getirir
 * @param {string} id - Doküman ID
 * @returns {Promise<Object>} - Doküman bilgileri
 */
export const getDocument = async (id) => {
  try {
    const response = await fetch(`${API_URL}/documents/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Doküman alınamadı');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Doküman getirme hatası:', error);
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Belgeye soru sorulurken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Belgeye soru sorma hatası:', error);
    throw error;
  }
};

/**
 * Dilekçe oluşturma
 * @param {Object} petitionData - Dilekçe verileri
 * @returns {Promise<Object>} - Oluşturulan dilekçe bilgileri
 */
export const createPetition = async (petitionData) => {
  try {
    const response = await fetch(`${API_URL}/petitions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(petitionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Dilekçe oluşturulurken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Dilekçe oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Tüm dilekçeleri getir
 * @returns {Promise<Array>} - Dilekçeler listesi
 */
export const getPetitions = async () => {
  try {
    const response = await fetch(`${API_URL}/petitions`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Dilekçeler alınamadı');
    }
    
    const data = await response.json();
    return data.petitions || [];
  } catch (error) {
    console.error('Dilekçeleri getirme hatası:', error);
    throw error;
  }
};

/**
 * Dilekçe indirme URL'ini oluştur
 * @param {string} id - Dilekçe ID
 * @returns {string} - İndirme URL'i
 */
export const downloadPetition = (id) => {
  return `${API_URL}/petitions/${id}/download`;
};