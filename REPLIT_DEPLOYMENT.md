# Cash or Crash - Replit Deployment Rehberi

## Replit Deployments ile Deploy Etme

### 1. Automatic Deployment (Önerilen)
Replit otomatik olarak projenizi deploy edecek:

1. **Deploy Butonu**: Replit editöründe "Deploy" butonuna tıklayın
2. **Otomatik Build**: Replit otomatik olarak `npm run build` çalıştıracak
3. **Production Start**: `node dist/index.js` komutu ile production server başlatılacak
4. **HTTPS**: Otomatik SSL sertifikası ve custom domain desteği

### 2. Environment Variables (Üretim için)
Deploy sonrası aşağıdaki environment variables'ı ayarlayın:
- `NODE_ENV=production` (otomatik ayarlanır)
- `SESSION_SECRET=your-random-secure-key` (güvenlik için)

### 3. Deploy Sonrası
- Uygulamanız `https://your-repl-name.your-username.repl.co` adresinde çalışacak
- Health check: `https://your-app-url/health` adresine GET request atarak kontrol edebilirsiniz
- Logs: Replit console'da real-time logs görebilirsiniz

### 4. Özellikler
✅ **Otomatik Build**: npm build pipeline  
✅ **Production Optimization**: Security headers, session management  
✅ **Health Monitoring**: /health endpoint ile uptime check  
✅ **Environment Detection**: Otomatik Replit deployment detection  
✅ **HTTPS**: Built-in SSL certificate  
✅ **Custom Domains**: Replit Pro ile custom domain desteği  

### 5. Troubleshooting
Eğer deployment başarısız olursa:
1. Console'da build loglarını kontrol edin
2. `npm run build` komutu local'da çalışıyor mu test edin
3. Dependencies eksik değil mi kontrol edin: `npm install`
4. TypeScript errors var mı kontrol edin: `npm run check`

### 6. Development vs Production
- **Development**: `npm run dev` (Hot reload, debugging)
- **Production**: `node dist/index.js` (Optimized, secure)

Replit'in built-in deployment sistemi en kolay ve güvenilir seçenektir!