// frontend/src/contexts/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  sendMessage, 
  fetchLegalReferenceDetails, 
  uploadDocument,
  getDocuments,
  getDocument,
  askDocumentQuestion,
  createPetition as apiCreatePetition,
  getPetitions as apiGetPetitions,
  downloadPetition as apiDownloadPetition
} from '../utils/api';

// Chat Context oluştur
const ChatContext = createContext();

// Hook oluştur
export const useChatContext = () => useContext(ChatContext);

/**
 * Chat Context Provider bileşeni
 * @param {Object} props - Bileşen özellikleri
 */
export const ChatProvider = ({ children }) => {
  // State tanımlamaları
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentConversation, setCurrentConversation] = useState({
    id: 'default',
    title: 'Yeni Konuşma',
    messages: [],
    history: []
  });
  
  // Doküman state tanımlamaları
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentView, setDocumentView] = useState(false); // Doküman görünümü aktif mi?
  
  // Dilekçe state tanımlamaları
  const [petitions, setPetitions] = useState([]);
  const [petitionLoading, setPetitionLoading] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [petitionView, setPetitionView] = useState(false); // Dilekçe görünümü aktif mi?

  // Local Storage'dan verileri yükle
  useEffect(() => {
    const savedConversations = localStorage.getItem('hukuki-asistan-conversations');
    const savedDarkMode = localStorage.getItem('hukuki-asistan-dark-mode');
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        
        // Aktif konuşmayı ayarla
        const lastConversationId = localStorage.getItem('hukuki-asistan-active-conversation');
        if (lastConversationId) {
          const lastConv = parsed.find(conv => conv.id === lastConversationId);
          if (lastConv) {
            setCurrentConversation(lastConv);
            setMessages(lastConv.messages);
          }
        }
      } catch (error) {
        console.error('Konuşma geçmişi yüklenirken hata:', error);
      }
    }
    
    // Koyu mod ayarını yükle
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Dokümanları yükle
    loadDocuments();
    
    // Dilekçeleri yükle
    loadPetitions();
  }, []);

  // Konuşmaları Local Storage'a kaydet
  useEffect(() => {
    localStorage.setItem('hukuki-asistan-conversations', JSON.stringify(conversations));
    localStorage.setItem('hukuki-asistan-active-conversation', currentConversation.id);
  }, [conversations, currentConversation]);

  // Koyu mod ayarını Local Storage'a kaydet
  useEffect(() => {
    localStorage.setItem('hukuki-asistan-dark-mode', darkMode);
  }, [darkMode]);

  /**
   * Dokümanları API'den yükler
   */
  const loadDocuments = async () => {
    try {
      setDocsLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
      setDocsLoading(false);
    } catch (error) {
      console.error('Dokümanlar yüklenirken hata:', error);
      setDocsLoading(false);
    }
  };

  /**
   * Dilekçeleri API'den yükler
   */
  const loadPetitions = async () => {
    try {
      setPetitionLoading(true);
      const petitionsData = await apiGetPetitions();
      setPetitions(petitionsData);
      setPetitionLoading(false);
    } catch (error) {
      console.error('Dilekçeler yüklenirken hata:', error);
      setPetitionLoading(false);
    }
  };

  /**
   * Yeni bir doküman yükler
   * @param {File} file - Yüklenecek dosya
   */
  const handleDocumentUpload = async (file) => {
    try {
      setDocsLoading(true);
      const result = await uploadDocument(file);
      setDocuments([result.document, ...documents]);
      setDocsLoading(false);
      return result.document;
    } catch (error) {
      console.error('Doküman yüklenirken hata:', error);
      setDocsLoading(false);
      throw error;
    }
  };

  /**
   * Bir dokümanı seçer ve detaylarını yükler
   * @param {string} docId - Doküman ID
   */
  const selectDocument = async (docId) => {
    try {
      setDocsLoading(true);
      const docDetail = await getDocument(docId);
      setSelectedDocument(docDetail);
      setDocumentView(true);
      setDocsLoading(false);
    } catch (error) {
      console.error('Doküman detayları alınırken hata:', error);
      setDocsLoading(false);
    }
  };

  /**
   * Bir dilekçe oluşturur
   * @param {Object} petitionData - Dilekçe verileri
   */
  const createPetition = async (petitionData) => {
    try {
      setPetitionLoading(true);
      const result = await apiCreatePetition(petitionData);
      setPetitions([result.petition, ...petitions]);
      setPetitionLoading(false);
      return result.petition;
    } catch (error) {
      console.error('Dilekçe oluşturulurken hata:', error);
      setPetitionLoading(false);
      throw error;
    }
  };

  /**
   * Bir dilekçeyi görüntüler
   * @param {string} petitionId - Dilekçe ID
   */
  const viewPetition = async (petitionId) => {
    try {
      // Dilekçeyi görüntüle - burada dilekçe içeriğini gösteren bir modal açılabilir
      // Veya PDF görüntüleyici kullanılabilir
      window.open(`/api/petitions/${petitionId}/download`, '_blank');
    } catch (error) {
      console.error('Dilekçe görüntülenirken hata:', error);
    }
  };

  /**
   * Bir dilekçeyi indirir
   * @param {string} petitionId - Dilekçe ID
   */
  const downloadPetition = (petitionId) => {
    const link = document.createElement('a');
    link.href = `/api/petitions/${petitionId}/download`;
    link.download = `dilekce-${petitionId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Belgeye soru sorar
   * @param {string} docId - Doküman ID
   * @param {string} question - Soru
   */
  const handleDocumentQuestion = async (docId, question) => {
    if (!question.trim() || loading) return;
    
    setLoading(true);
    
    // Kullanıcı mesajını ekle
    const userMessage = { 
      role: 'user', 
      content: question,
      documentContext: true,
      documentId: docId,
      documentName: documents.find(d => d.id === docId)?.filename || 'Belge'
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // API'ye gönder
      const response = await askDocumentQuestion(docId, question);
      
      // Asistan yanıtını ekle
      const assistantMessage = { 
        role: 'assistant', 
        content: response.answer,
        documentContext: true,
        documentId: docId,
        documentName: response.documentName
      };
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Konuşma geçmişini güncelle
      const newHistoryItem = {
        userQuestion: question,
        assistantResponse: response.answer,
        documentContext: true,
        documentId: docId,
        documentName: response.documentName
      };
      
      const updatedHistory = [...currentConversation.history, newHistoryItem];
      
      // Aktif konuşmayı güncelle
      const updatedCurrentConversation = {
        ...currentConversation,
        messages: newMessages,
        history: updatedHistory,
        title: currentConversation.title === 'Yeni Konuşma' && updatedHistory.length === 1 
          ? `${truncateText(question, 20)} (${truncateText(response.documentName, 10)})` 
          : currentConversation.title
      };
      
      setCurrentConversation(updatedCurrentConversation);
      
      // Tüm konuşmaları güncelle
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversation.id ? updatedCurrentConversation : conv
      );
      
      setConversations(updatedConversations);
      setLoading(false);
    } catch (error) {
      console.error('Belgeye soru sorma hatası:', error);
      
      // Hata mesajı ekle
      const errorMessage = { 
        role: 'assistant', 
        content: 'Üzgünüm, sorunuza cevap verirken bir hata oluştu. Lütfen tekrar deneyin.',
        isError: true
      };
      
      setMessages([...updatedMessages, errorMessage]);
      setLoading(false);
    }
  };

  /**
   * Doküman görünümünü kapatır
   */
  const closeDocumentView = () => {
    setDocumentView(false);
    setSelectedDocument(null);
  };

  /**
   * Dilekçe görünümünü kapatır
   */
  const closePetitionView = () => {
    setPetitionView(false);
    setSelectedPetition(null);
  };

  /**
   * Yeni konuşma başlatır
   */
  const startNewConversation = () => {
    // Eğer mevcut konuşmada mesaj varsa ve henüz kaydedilmemişse, onu conversations listesine ekle
    if (currentConversation.messages.length > 0) {
      // Id değeri 'default' ise ve konuşmalar listesinde bu konuşma yoksa ekle
      if (currentConversation.id === 'default' || !conversations.some(conv => conv.id === currentConversation.id)) {
        const updatedConversation = {
          ...currentConversation,
          id: currentConversation.id === 'default' ? Date.now().toString() : currentConversation.id
        };
        setConversations([updatedConversation, ...conversations]);
      }
    }
    
    // Yeni bir konuşma oluştur
    const newConversation = {
      id: 'default', // Geçici id, ilk mesaj gönderildiğinde değişecek
      title: 'Yeni Konuşma',
      messages: [],
      history: [],
      createdAt: new Date().toISOString()
    };
    
    setCurrentConversation(newConversation);
    setMessages([]);
  };

  /**
   * Belirli bir konuşmaya geçiş yapar
   * @param {string} conversationId - Konuşma ID
   */
  const switchConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
    }
  };

  /**
   * Bir konuşmayı siler
   * @param {string} conversationId - Konuşma ID
   */
  const deleteConversation = (conversationId) => {
    // Konuşmayı sil
    const newConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(newConversations);
    
    // Eğer aktif konuşma siliniyorsa, başka bir konuşmaya geç
    if (currentConversation.id === conversationId) {
      if (newConversations.length > 0) {
        switchConversation(newConversations[0].id);
      } else {
        startNewConversation();
      }
    }
  };

  /**
   * Bir konuşmanın başlığını değiştirir
   * @param {string} conversationId - Konuşma ID
   * @param {string} newTitle - Yeni başlık
   */
  const renameConversation = (conversationId, newTitle) => {
    // Konuşma başlığını değiştir
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, title: newTitle } : conv
    );
    
    setConversations(updatedConversations);
    
    // Eğer aktif konuşma yeniden adlandırılıyorsa, aktif konuşmayı da güncelle
    if (currentConversation.id === conversationId) {
      setCurrentConversation({ ...currentConversation, title: newTitle });
    }
  };

  /**
   * Mesaj gönderir ve yanıt alır
   * @param {string} message - Gönderilecek mesaj
   */
  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;
    
    setLoading(true);
    
    // Eğer aktif konuşma yoksa veya mevcut konuşma "Yeni Konuşma" ise ve henüz mesaj yoksa
    // otomatik olarak yeni bir konuşma oluştur
    let conversationId = currentConversation.id;
    let currentHistory = currentConversation.history;
    let updatedConversations = [...conversations];
    
    // İlk sohbet için yeni bir konuşma oluştur
    if (conversations.length === 0 || (currentConversation.messages.length === 0 && currentConversation.id === 'default')) {
      const newConversation = {
        id: Date.now().toString(),
        title: truncateText(message, 30),
        messages: [],
        history: [],
        createdAt: new Date().toISOString()
      };
      
      conversationId = newConversation.id;
      currentHistory = [];
      updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      setCurrentConversation(newConversation);
    }
    
    // Kullanıcı mesajını ekle
    const userMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // API'ye gönder
      const response = await sendMessage(
        message, 
        currentHistory
      );
      
      // Asistan yanıtını ekle
      const assistantMessage = { 
        role: 'assistant', 
        content: response.text,
        legalReferences: response.legalReferences
      };
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Konuşma geçmişini güncelle
      const newHistoryItem = {
        userQuestion: message,
        assistantResponse: response.text
      };
      
      const updatedHistory = [...currentHistory, newHistoryItem];
      
      // Aktif konuşmayı güncelle
      const updatedCurrentConversation = {
        ...currentConversation,
        id: conversationId,
        messages: newMessages,
        history: updatedHistory,
        title: currentConversation.title === 'Yeni Konuşma' ? truncateText(message, 30) : currentConversation.title
      };
      
      setCurrentConversation(updatedCurrentConversation);
      
      // Tüm konuşmaları güncelle
      const finalConversations = updatedConversations.map(conv => 
        conv.id === conversationId ? updatedCurrentConversation : conv
      );
      
      // Eğer bizim yeni oluşturduğumuz bir konuşma varsa ve listede yoksa ekle
      if (!finalConversations.some(conv => conv.id === conversationId)) {
        finalConversations.unshift(updatedCurrentConversation);
      }
      
      setConversations(finalConversations);
      setLoading(false);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      
      // Hata mesajı ekle
      const errorMessage = { 
        role: 'assistant', 
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin veya daha sonra tekrar deneyin.',
        isError: true
      };
      
      setMessages([...updatedMessages, errorMessage]);
      setLoading(false);
    }
  };

  /**
   * Koyu/açık tema modunu değiştirir
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  /**
   * Metni kısaltır
   * @param {string} text - Kısaltılacak metin
   * @param {number} maxLength - Maksimum uzunluk
   * @returns {string} - Kısaltılmış metin
   */
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Context değerlerini sağla
  const contextValue = {
    messages,
    loading,
    conversations,
    currentConversation,
    darkMode,
    documents,
    docsLoading,
    selectedDocument,
    documentView,
    petitions,
    petitionLoading,
    selectedPetition,
    petitionView,
    handleSendMessage,
    startNewConversation,
    switchConversation,
    deleteConversation,
    renameConversation,
    toggleDarkMode,
    handleDocumentUpload,
    selectDocument,
    closeDocumentView,
    handleDocumentQuestion,
    createPetition,
    viewPetition,
    downloadPetition,
    closePetitionView
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;