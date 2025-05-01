import React, { useState, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import LoadingIndicator from './LoadingIndicator';

/**
 * Dilekçe Formu Bileşeni
 */
function PetitionForm() {
  const { 
    darkMode, 
    createPetition, 
    petitionLoading, 
    petitions,
    viewPetition,
    downloadPetition
  } = useChatContext();
  
  const [formStep, setFormStep] = useState(1);
  const [petitionTypes, setPetitionTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [formData, setFormData] = useState({
    petitionType: '',
    description: '',
    userDetails: {
      name: '',
      address: '',
      phone: '',
      email: '',
      tcNo: '',
      subject: ''
    },
    receiver: {
      name: '',
      department: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dilekçe türlerini yükle
  useEffect(() => {
    const loadPetitionTypes = async () => {
      try {
        setTypesLoading(true);
        const response = await fetch('/api/petitions/types/list');
        const data = await response.json();
        setPetitionTypes(data.petitionTypes || []);
      } catch (error) {
        console.error('Dilekçe türleri yüklenirken hata:', error);
      } finally {
        setTypesLoading(false);
      }
    };
    
    loadPetitionTypes();
  }, []);
  
  /**
   * Form alanlarını günceller
   * @param {Event} e - Form olayı
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  /**
   * Form adımını ilerletir
   */
  const nextStep = () => {
    // Adım 1 validasyonu
    if (formStep === 1) {
      const errors = {};
      
      if (!formData.petitionType) {
        errors.petitionType = 'Lütfen bir dilekçe türü seçin';
      }
      if (!formData.description || formData.description.length < 30) {
        errors.description = 'Lütfen durumunuzu en az 30 karakter olacak şekilde açıklayın';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    
    // Adım 2 validasyonu
    if (formStep === 2) {
      const errors = {};
      
      if (!formData.userDetails.name) {
        errors['userDetails.name'] = 'Ad Soyad gereklidir';
      }
      if (!formData.userDetails.address) {
        errors['userDetails.address'] = 'Adres gereklidir';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    
    setFormStep(formStep + 1);
  };
  
  /**
   * Form adımını geri alır
   */
  const prevStep = () => {
    setFormStep(formStep - 1);
  };
  
  /**
   * Dilekçe oluşturur
   * @param {Event} e - Form gönderme olayı
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Son adım validasyonu
    const errors = {};
    
    if (!formData.receiver.name) {
      errors['receiver.name'] = 'Alıcı kurum/makam adı gereklidir';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Dilekçe oluştur
      await createPetition(formData);
      
      // Başarı mesajı göster
      setSuccessMessage('Dilekçeniz başarıyla oluşturuldu! İndirme butonunu kullanarak dilekçeyi PDF olarak kaydedebilirsiniz.');
      
      // Formu temizle ve ilk adıma dön
      setFormStep(1);
      setFormData({
        petitionType: '',
        description: '',
        userDetails: {
          name: '',
          address: '',
          phone: '',
          email: '',
          tcNo: '',
          subject: ''
        },
        receiver: {
          name: '',
          department: ''
        }
      });
    } catch (error) {
      console.error('Dilekçe oluşturma hatası:', error);
      setFormErrors({
        submit: 'Dilekçe oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
    }
  };
  
  /**
   * Form adımına göre içerik render edilir
   */
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Adım 1: Dilekçe Türü ve Açıklama
            </h3>
            
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Dilekçe Türü
              </label>
              {typesLoading ? (
                <div className="py-2">
                  <LoadingIndicator size="small" />
                </div>
              ) : (
                <select
                  name="petitionType"
                  value={formData.petitionType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${formErrors.petitionType ? 'border-red-500' : ''}`}
                >
                  <option value="">Dilekçe türü seçin</option>
                  {petitionTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
              {formErrors.petitionType && (
                <p className="mt-1 text-sm text-red-500">{formErrors.petitionType}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="6"
                placeholder="Lütfen durumunuzu detaylı olarak açıklayın. Dilekçenin ne için olduğunu, talebinizi ve gerekçelerinizi belirtin."
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${formErrors.description ? 'border-red-500' : ''}`}
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                En az 30 karakter, ne kadar detaylı olursa dilekçe o kadar doğru hazırlanacaktır.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Devam
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Adım 2: Kişisel Bilgiler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="userDetails.name"
                  value={formData.userDetails.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${formErrors['userDetails.name'] ? 'border-red-500' : ''}`}
                />
                {formErrors['userDetails.name'] && (
                  <p className="mt-1 text-sm text-red-500">{formErrors['userDetails.name']}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  T.C. Kimlik No
                </label>
                <input
                  type="text"
                  name="userDetails.tcNo"
                  value={formData.userDetails.tcNo}
                  onChange={handleInputChange}
                  maxLength="11"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Adres *
                </label>
                <textarea
                  name="userDetails.address"
                  value={formData.userDetails.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${formErrors['userDetails.address'] ? 'border-red-500' : ''}`}
                ></textarea>
                {formErrors['userDetails.address'] && (
                  <p className="mt-1 text-sm text-red-500">{formErrors['userDetails.address']}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Telefon
                </label>
                <input
                  type="tel"
                  name="userDetails.phone"
                  value={formData.userDetails.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-posta
                </label>
                <input
                  type="email"
                  name="userDetails.email"
                  value={formData.userDetails.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dilekçe Konusu
                </label>
                <input
                  type="text"
                  name="userDetails.subject"
                  value={formData.userDetails.subject}
                  onChange={handleInputChange}
                  placeholder="Örn: İtiraz / Başvuru / Tazminat talebi"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Geri
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Devam
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Adım 3: Alıcı Bilgileri
            </h3>
            
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Alıcı Kurum/Makam Adı *
              </label>
              <input
                type="text"
                name="receiver.name"
                value={formData.receiver.name}
                onChange={handleInputChange}
                placeholder="Örn: İstanbul Büyükşehir Belediyesi / İzmir 1. Asliye Hukuk Mahkemesi"
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${formErrors['receiver.name'] ? 'border-red-500' : ''}`}
              />
              {formErrors['receiver.name'] && (
                <p className="mt-1 text-sm text-red-500">{formErrors['receiver.name']}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Birim/Departman
              </label>
              <input
                type="text"
                name="receiver.department"
                value={formData.receiver.department}
                onChange={handleInputChange}
                placeholder="Örn: İnsan Kaynakları Müdürlüğü / Başkanlık"
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div className="mt-6 p-4 rounded-md bg-blue-50 dark:bg-blue-900/30 text-sm">
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Bilgilendirme
              </h4>
              <p className={darkMode ? 'text-blue-200' : 'text-blue-600'}>
                "Dilekçe Oluştur" butonuna tıkladığınızda yapay zeka tarafından dilekçeniz hazırlanacak ve 
                PDF formatında indirilebilir olacaktır. Oluşturulan dilekçeyi dikkatle okuyun ve gerekirse 
                düzenlemeler yapın. Dilekçenin yasal geçerliliği için imzalamayı unutmayın.
              </p>
            </div>
            
            {formErrors.submit && (
              <div className={`mt-4 p-3 rounded-md ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-700'}`}>
                {formErrors.submit}
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Geri
              </button>
              <button
                type="submit"
                disabled={petitionLoading}
                className={`px-4 py-2 rounded-md flex items-center ${
                  petitionLoading
                    ? darkMode 
                      ? 'bg-blue-700 cursor-not-allowed' 
                      : 'bg-blue-400 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {petitionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </>
                ) : (
                  'Dilekçe Oluştur'
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  /**
   * Oluşturulan dilekçeleri render eder
   */
  const renderPetitions = () => {
    if (petitions.length === 0) {
      return (
        <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Henüz oluşturulmuş dilekçe bulunmuyor.</p>
        </div>
      );
    }
    
    return (
      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow mt-4`}>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {petitions.map(petition => (
            <li key={petition.id} className={`flex items-center justify-between p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {petition.title}
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(petition.createDate).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => viewPetition(petition.id)}
                  className={`p-2 rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                  }`}
                  title="Görüntüle"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => downloadPetition(petition.id)}
                  className={`p-2 rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-green-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                  }`}
                  title="İndir"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Dilekçe Oluşturma
      </h2>
      
      {successMessage && (
        <div className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-700'}`}>
          {successMessage}
          <button 
            onClick={() => setSuccessMessage('')}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Kapat
          </button>
        </div>
      )}
      
      <div className={`mb-6 rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={handleSubmit}>
          {renderFormStep()}
        </form>
      </div>
      
      <h3 className={`text-lg font-semibold mt-8 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Oluşturulan Dilekçeler
      </h3>
      
      {petitionLoading ? (
        <div className="flex justify-center py-8">
          <LoadingIndicator />
        </div>
      ) : (
        renderPetitions()
      )}
    </div>
  );
}

export default PetitionForm; 