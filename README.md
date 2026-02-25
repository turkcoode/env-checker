# Env Checker ✅

`.env` dosyalarını `.env.example` ile karşılaştırıp eksik değişkenleri bulan, tipleri doğrulayan CLI aracı.

## Sorun

Bir projede çalışırken en sık karşılaşılan hatalardan biri: eksik environment variable. Bu araç production'a deploy öncesi tüm env değişkenlerini kontrol eder.

## Kurulum

```bash
npm install -g env-checker-cli
```

## Kullanım

```bash
# Mevcut dizindeki .env ve .env.example karşılaştır
env-checker

# Belirli dosya
env-checker --env .env.production --example .env.example

# CI/CD entegrasyonu (eksik varsa exit 1)
env-checker --strict
```

## Örnek Çıktı

```
.env Doğrulama Raporu
━━━━━━━━━━━━━━━━━━━━
✅ DB_HOST: localhost
✅ DB_PORT: 3306
❌ DB_PASSWORD: Eksik!
⚠️  API_KEY: Boş değer
✅ NODE_ENV: production

Sonuç: 1 eksik, 1 boş | 3/5 geçerli
```

## .env.example Format

```env
# Veritabanı (zorunlu)
DB_HOST=localhost
DB_PORT=3306
DB_PASSWORD=required

# API (opsiyonel)
API_KEY=optional
DEBUG=false
```

## Programatik Kullanım

```javascript
const { checkEnv } = require('env-checker-cli');

const result = checkEnv({
  envPath: '.env',
  examplePath: '.env.example',
  strict: true
});

if (!result.valid) {
  console.log('Eksik degiskenler:', result.missing);
  process.exit(1);
}
```

## CI/CD Entegrasyonu

```yaml
# GitHub Actions
- name: Env Check
  run: npx env-checker-cli --strict
```

## Geliştirici Araçları

Bu araç, [TurkCode geliştirici araçları](https://turkcode.net) koleksiyonunun bir parçasıdır.

## Lisans

MIT
