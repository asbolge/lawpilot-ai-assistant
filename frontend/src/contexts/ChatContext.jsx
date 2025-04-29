// frontend/src/contexts/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  sendMessage, 
  fetchLegalReferenceDetails, 
  uploadDocument,
  getDocuments,
  getDocument,
  askDocumentQuestion
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
  const [activeReferenceModal, setActiveReferenceModal] = useState(null);
  const [referenceData, setReferenceData] = useState(null);
  const [referenceLoading, setReferenceLoading] = useState(false);
  
  // Doküman state tanımlamaları
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentView, setDocumentView] = useState(false); // Doküman görünümü aktif mi?

  // Local Storage'dan konuşmaları yükle
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
    } catch (error) {
      console.error('Belgeye soru sorulurken hata:', error);
      
      // Hata mesajını ekle
      const errorMessage = { 
        role: 'assistant', 
        content: 'Belgeye soru sorulurken bir hata oluştu. Lütfen tekrar deneyin.',
        error: true,
        documentContext: true,
        documentId: docId
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Doküman görünümünü kapatır ve normal sohbete döner
   */
  const closeDocumentView = () => {
    setDocumentView(false);
    setSelectedDocument(null);
  };

  /**
   * Yeni bir konuşma başlatır
   */
  const startNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: 'Yeni Konuşma',
      messages: [],
      history: [],
      createdAt: new Date().toISOString()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
    setMessages([]);
    setDocumentView(false);
    setSelectedDocument(null);
  };

  /**
   * Bir konuşmayı aktif hale getirir
   * @param {string} conversationId - Konuşma ID'si
   */
  const switchConversation = (conversationId) => {
    const selectedConversation = conversations.find(conv => conv.id === conversationId);
    if (selectedConversation) {
      setCurrentConversation(selectedConversation);
      setMessages(selectedConversation.messages);
      setDocumentView(false);
      setSelectedDocument(null);
    }
  };

  /**
   * Bir konuşmayı kaldırır
   * @param {string} conversationId - Konuşma ID'si
   */
  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    // Eğer aktif konuşma silindiyse yeni bir konuşma başlat
    if (currentConversation.id === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[0]);
        setMessages(updatedConversations[0].messages);
      } else {
        startNewConversation();
      }
    }
  };

  /**
   * Bir konuşmanın başlığını günceller
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} newTitle - Yeni başlık
   */
  const renameConversation = (conversationId, newTitle) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, title: newTitle } : conv
    );
    
    setConversations(updatedConversations);
    
    if (currentConversation.id === conversationId) {
      setCurrentConversation({ ...currentConversation, title: newTitle });
    }
  };

  /**
   * Kullanıcı mesajını gönderir ve API yanıtını alır
   * @param {string} message - Kullanıcı mesajı
   */
  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;
    
    setLoading(true);
    
    // Eğer currentConversation.id 'default' ise önce yeni bir konuşma oluştur
    if (currentConversation.id === 'default') {
      const newId = Date.now().toString();
      const newConversation = {
        id: newId,
        title: 'Yeni Konuşma',
        messages: [],
        history: [],
        createdAt: new Date().toISOString()
      };
      
      setCurrentConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    }
    
    // Kullanıcı mesajını ekle
    const userMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // API'ye gönder
      const response = await sendMessage(message, currentConversation.history);
      
      // Asistan yanıtını ekle
      const assistantMessage = { 
        role: 'assistant', 
        content: response.text,
        legalReferences: response.legalReferences || []
      };
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Konuşma geçmişini güncelle
      const newHistoryItem = {
        userQuestion: message,
        assistantResponse: response.text
      };
      
      const updatedHistory = [...currentConversation.history, newHistoryItem];
      
      // Aktif konuşmayı güncelle
      const updatedCurrentConversation = {
        ...currentConversation,
        messages: newMessages,
        history: updatedHistory,
        title: currentConversation.title === 'Yeni Konuşma' && updatedHistory.length === 1 
          ? truncateText(message, 30) 
          : currentConversation.title
      };
      
      setCurrentConversation(updatedCurrentConversation);
      
      // Tüm konuşmaları güncelle (eğer konuşma listede yoksa ekle, varsa güncelle)
      const conversationExists = conversations.some(conv => conv.id === currentConversation.id);
      
      if (conversationExists) {
        const updatedConversations = conversations.map(conv => 
          conv.id === currentConversation.id ? updatedCurrentConversation : conv
        );
        setConversations(updatedConversations);
      } else {
        setConversations([updatedCurrentConversation, ...conversations]);
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      
      // Hata mesajını ekle
      const errorMessage = { 
        role: 'assistant', 
        content: 'Mesajınız işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
        error: true
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Yasal referans detaylarını gösterir
   * @param {string} reference - Yasal referans
   */
  const showLegalReferenceDetails = async (reference) => {
    try {
      setActiveReferenceModal(reference);
      setReferenceLoading(true);
      
      const data = await fetchLegalReferenceDetails(reference);
      setReferenceData(data);
      
      setReferenceLoading(false);
    } catch (error) {
      console.error('Referans detayları alınırken hata:', error);
      setReferenceData({ error: true, message: 'Referans detayları alınamadı.' });
      setReferenceLoading(false);
    }
  };

  /**
   * Yasal referans modalını kapatır
   */
  const closeLegalReferenceModal = () => {
    setActiveReferenceModal(null);
    setReferenceData(null);
  };

  /**
   * Koyu/açık tema geçişini yapar
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  /**
   * Metni belirli bir uzunlukta kısaltır
   * @param {string} text - Kısaltılacak metin
   * @param {number} maxLength - Maksimum karakter sayısı
   * @returns {string} - Kısaltılmış metin
   */
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + '...'
      : text;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        conversations,
        currentConversation,
        activeReferenceModal,
        referenceData,
        referenceLoading,
        darkMode,
        documents,
        docsLoading,
        selectedDocument,
        documentView,
        handleSendMessage,
        startNewConversation,
        switchConversation,
        deleteConversation,
        renameConversation,
        showLegalReferenceDetails,
        closeLegalReferenceModal,
        toggleDarkMode,
        handleDocumentUpload,
        loadDocuments,
        selectDocument,
        handleDocumentQuestion,
        closeDocumentView
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;