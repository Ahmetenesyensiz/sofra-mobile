# Sofra Backend

Sofra, restoran yönetim süreçlerini dijitalleştirmeyi amaçlayan kapsamlı bir sistemdir. Bu repoda projenin **backend (sunucu tarafı)** geliştirmesi yer almaktadır. Uygulama, restoran sahiplerinin menü ve masa yönetimi yapmasını, garsonların siparişleri almasını ve müşterilerin mobil veya web uygulama üzerinden sipariş vermesini sağlar.

## 🚀 Teknolojiler

- **Java 17**
- **Spring Boot**
- **Spring Security + JWT**
- **MongoDB**
- **Gradle (Groovy DSL)**
- **WebSocket (Gerçek zamanlı bildirimler için)**
- **RESTful API yapısı**

## 🧹 Proje Modülleri

Bu backend projesi aşağıdaki modüllerden oluşmaktadır:

- **Authentication** – Kayıt, giriş ve JWT token üretimi
- **User Management** – Kullanıcı rolleri: `CUSTOMER`, `OWNER`, `WAITER`
- **Restaurant Management** – Restoran ve masa bilgileri
- **Menu Management** – Kategorilere göre ürün tanımlama
- **Order System** – Sipariş oluşturma, görüntüleme ve yönetim
- **Call Request System** – Müşteri tarafından garson çağırma sistemi
- **Real-time Updates** – WebSocket ile canlı bildirimler

## 📂 Proje Mimarisi

```plaintext
src/
 ├ config/                 → Güvenlik, JWT ve genel yapılandırmalar
 ├ controller/             → REST endpoint'leri
 ├ dto/                    → Veri transfer nesneleri
 ├ exception/              → Özel hata sınıfları ve global handler
 ├ model/                  → MongoDB veri modelleri
 ├ repository/             → MongoDB etkileşimi için arayüzler
 └ service/                → İş mantığı katmanı
```

## 🔐 Kullanıcı Rolleri

Sistem üç ana kullanıcı rolünü içerir:

- **CUSTOMER**: Mobil uygulama üzerinden sipariş oluşturur ve masa çağrısı yapar.
- **OWNER**: Restoranı yönetir, menü ve masa düzenlemeleri yapar.
- **WAITER**: Sipariş ve masa yönetimini üstlenir, çağrı sistemine cevap verir.

## 🌐 İlgili Projeler

Bu backend yapısı aşağıdaki frontend projeleriyle birlikte çalışacak şekilde yapılandırılmıştır:

- 📱 [**Mobil Uygulama (React Native)** – `sofra-mobile`](https://github.com/Ahmetenesyensiz/sofra-mobile)  
  → Müşteri ve garson kullanıcılar için mobil uygulama.

- 📋 [**Web Arayüz (ReactJS)** – `sofra-web`](https://github.com/Ahmetenesyensiz/sofra-web)  
  → Restoran sahipleri için masaüstü web arayüzü.

## ⚙️ Başlatma Talimatları

> Aşağıdaki adımlar yerel geliştirme ortamında backend projesini başlatmak içindir.

### 1. Gereksinimler

- Java 17+
- MongoDB (Local veya uzak bağlantı)
- Gradle

### 2. Uygulama Başlatma

```bash
# Projeyi klonla
git clone https://github.com/Ahmetenesyensiz/sofra-backend.git
cd sofra-backend

# Gradle ile derle
./gradlew build

# Uygulamayı başlat
./gradlew bootRun
```

MongoDB bağlantısı ve JWT ayarları için `application.properties` ya da `application.yml` dosyasını düzenlemeyi unutmayın.

## 📨 Katkı Sağlamak

Katkı sağlamak isterseniz:

1. Fork'layın.
2. Yeni bir branch oluşturun.
3. Değişikliklerinizi yapın.
4. Pull Request gönderin.

---

> Geliştirici: **Ahmet Enes Yensiz**  
> 📧 [ahmetenesyensiz@gmail.com](mailto:ahmetenesyensiz@gmail.com)
