import React from 'react';
import { useChatContext } from '../contexts/ChatContext';
import LegalReferenceLink from './LegalReferenceLink';

/**
 * Kanun referans formatı test bileşeni
 */
function TestLegalReference() {
  const { darkMode } = useChatContext();
  
  // Test referansları
  const testReferences = [
    {
      number: "6563",
      name: "Elektronik Ticaretin Düzenlenmesi Hakkında Kanun",
      article: "5",
      text: "6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Madde 5"
    },
    {
      number: "4857",
      name: "İş Kanunu",
      article: "18",
      text: "4857 sayılı İş Kanunu Madde 18"
    },
    {
      number: "6098",
      name: "Türk Borçlar Kanunu",
      article: "11",
      text: "6098 sayılı Türk Borçlar Kanunu Madde 11"
    },
    {
      number: "6102",
      name: "Türk Ticaret Kanunu",
      article: "573",
      text: "6102 sayılı Türk Ticaret Kanunu Madde 573"
    },
    {
      number: "6102",
      name: "Türk Ticaret Kanunu",
      article: "576",
      text: "6102 sayılı Türk Ticaret Kanunu Madde 576"
    },
    {
      number: "6102",
      name: "Türk Ticaret Kanunu",
      article: "580",
      text: "6102 sayılı Türk Ticaret Kanunu Madde 580"
    }
  ];

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">Kanun Referans Formatı Test</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Doğrudan Referans Linkleri:</h3>
        <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-opacity-30 border border-gray-200 dark:border-gray-700">
          {testReferences.map((ref, index) => (
            <div key={index}>
              <LegalReferenceLink reference={ref} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">TTK Şirket Kuruluşu Referansları:</h3>
        <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`mb-4 pb-3 border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <div className={`font-bold text-sm mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              Doğrudan İlişkili Madde veya Hüküm Alıntıları:
            </div>
            
            <div className="mb-3">
              <div className="mb-1">
                <LegalReferenceLink reference={testReferences[3]} />
              </div>
              <div className={`ml-4 pl-2 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                "Limited şirketin kuruluşu, ticaret siciline tescil ve ilan ile tamam olur."
              </div>
            </div>
            
            <div className="mb-3">
              <div className="mb-1">
                <LegalReferenceLink reference={testReferences[4]} />
              </div>
              <div className={`ml-4 pl-2 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                "(1) Ana sözleşme, şirketin kuruluşunda yer alan bütün ortaklar tarafından imzalanır ve ticaret siciline tescil ve Türkiye Ticaret Sicili Gazetesinde ilan olunur."
              </div>
            </div>
            
            <div className="mb-3">
              <div className="mb-1">
                <LegalReferenceLink reference={testReferences[5]} />
              </div>
              <div className={`ml-4 pl-2 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                "(1) Şirketin tescili için ticaret siciline tescil ve ilanı gereken ana sözleşme, ortakların kimliği, imzaları ve taahhüt ettikleri sermaye payları ile varsa yönetim kurulu üyelerinin kimlik bilgilerinin yer aldığı kuruluş bildirimi verilir."
              </div>
            </div>
          </div>
          
          <div className={`font-bold text-sm mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            İlgili Yargı Kararları veya İçtihatlar:
          </div>
          <div className={`pl-2 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <p className="mb-2">
              Yargıtay 11. Hukuk Dairesi 2019/3215 E., 2020/1254 K. - "Limited şirket kuruluşunda tescil, kurucu işlemin tamamlanması bakımından kurucu niteliktedir."
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">E-Ticaret Kanunu Referansları:</h3>
        <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`font-bold text-sm mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            Doğrudan İlişkili Madde veya Hüküm Alıntıları:
          </div>
          <div className={`pl-2 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <div className="mb-3">
              <div className="mb-1">
                <LegalReferenceLink reference={testReferences[0]} />
              </div>
              <div className="ml-4">
                "Ticari elektronik ileti gönderimi, alıcının önceden açık rızasının alınması şartıyla gerçekleştirilir."
              </div>
            </div>
            
            <div className="mb-3">
              <div className="mb-1 font-bold">
                6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Madde 6/1
              </div>
              <div className="ml-4">
                "Ticari elektronik iletinin içeriği, alıcının ticari elektronik ileti göndermine rıza gösterdiği tarihte bilgilendirildiği konularla sınırlı olmalı ve alıcının ticari elektronik ileti almaktan vazgeçebileceği hususunda açık ve anlaşılır bir şekilde bilgilendirilmesi sağlanmalıdır."
              </div>
            </div>
            
            <div className="mb-3">
              <div className="mb-1 font-bold">
                6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Madde 6/2
              </div>
              <div className="ml-4">
                "Alıcı, ticari elektronik ileti almaktan vazgeçtiğini bildirdiği takdirde, kendisine ticari elektronik ileti gönderilmeyecektir."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestLegalReference; 