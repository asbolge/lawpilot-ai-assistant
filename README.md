# Hukuki Yapay Zeka Asistanı

Bu proje, Gemini API kullanarak geliştirilmiş bir kurumsal hukuki yapay zeka asistanıdır. Yasal mevzuat, yönerge ve genelgelerle sürekli çalışan birimlerin ihtiyaç duyduğu bilgiye hızlı ve doğru bir şekilde erişimini sağlamak amacıyla tasarlanmıştır.

## Özellikler

- 🧠 Gemini API tabanlı hukuki soruları yanıtlama
- 📚 Yasal mevzuat, kanun maddeleri ve içtihatlara referans verme
- 💬 Sohbet bağlamını koruma ve takip sorularını anlama
- 🔍 Yasal referansların detaylı açıklamalarını görüntüleme
- 🌙 Koyu/açık tema desteği
- 📱 Mobil uyumlu (responsive) tasarım
- 💾 Konuşma geçmişini saklama ve yönetme

## Proje Yapısı

Proje iki ana bölümden oluşmaktadır:

1. **Backend API (api/)**: Gemini API ile etkileşime geçen, promptları düzenleyen ve yanıtları işleyen NodeJS uygulaması.
2. **Frontend (frontend/)**: Kullanıcı arayüzünü sağlayan React uygulaması.

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Google Cloud hesabı (Gemini API için)
- Gemini API anahtarı

### Backend Kurulumu

1. API dizinine geçin:
```bash
cd api
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını düzenleyin:
```
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:3000
```

4. API'yi başlatın:
```bash
npm run dev
```

### Frontend Kurulumu

1. Frontend dizinine geçin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını düzenleyin (gerekirse):
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Frontend uygulamasını başlatın:
```bash
npm start
```

5. Tarayıcınızda `http://localhost:3000` adresine giderek uygulamaya erişebilirsiniz.

## Prompt Mühendisliği

Projede kullanılan prompt mühendisliği, hukuki sorulara doğru ve kapsamlı yanıtlar almak için özel olarak tasarlanmıştır. Prompt zenginleştirme süreci şu adımları içerir:

1. **Soru Analizi**: Kullanıcının sorusu analiz edilerek hangi hukuk alanına ilişkin olduğu tespit edilir (İş Hukuku, Ceza Hukuku, vb.)
2. **Yasal Referans Tespiti**: Soru içerisindeki kanun numaraları, madde referansları gibi yasal atıflar çıkarılır
3. **Bağlam Zenginleştirme**: Önceki konuşmalara dayalı olarak bağlam bilgisi eklenir
4. **Format Yönlendirmeleri**: Yanıtların belirli bir formatta (yasal düzenleme özeti, ilgili madde alıntıları, içtihatlar, pratik yansımalar) verilmesi sağlanır

## Özelleştirme

### Hukuk Alanları Genişletme

`api/src/utils/promptEngineer.js` dosyasındaki `legalAreas` dizisine yeni hukuk alanları ve ilgili anahtar kelimeler ekleyerek sistemin tanıdığı alanları genişletebilirsiniz.

### Yasal Referans Veritabanı Ekleme

Gerçek projede, statik yanıtlar yerine yasal mevzuat veritabanı entegrasyonu eklemek isteyebilirsiniz. Bunun için:

1. MongoDB veya PostgreSQL gibi bir veritabanı kurun
2. `api/src/routes/chat.js` içindeki `/legal-reference/:reference` endpoint'ini veritabanından veri çekecek şekilde güncelleyin

## Dağıtım

### Backend Dağıtımı

Backend uygulaması Heroku, Google Cloud Run, AWS Elastic Beanstalk gibi platformlarda dağıtılabilir:

```bash
# Örnek Heroku dağıtımı
cd api
heroku create hukuki-asistan-api
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a hukuki-asistan-api
git push heroku master
```

### Frontend Dağıtımı

Frontend uygulaması Vercel, Netlify veya GitHub Pages gibi platformlarda dağıtılabilir:

```bash
# Örnek Vercel dağıtımı
cd frontend
npm run build
npx vercel --prod
```

## Güvenlik Önlemleri

- API anahtarlarını her zaman `.env` dosyasında saklayın ve bu dosyayı Git takibinden çıkarın
- Üretim ortamında HTTPS kullanın
- CORS ayarlarını sadece bilinen alan adlarına izin verecek şekilde yapılandırın
- Kullanıcı girdisini her zaman doğrulayın ve temizleyin

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin yeni-ozellik`)
5. Pull request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.