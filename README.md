Links penting
- Production (try API here): https://seal.gilanghuda.my.id/
- Swagger / API Docs: https://seal.gilanghuda.my.id/docs
  - (Contoh: coba API di https://seal.gilanghuda.my.id/  atau buka dokumentasi interaktif di https://seal.gilanghuda.my.id/docs  )

Ringkasan singkat
- Nama: Seal Backend
- Framework: AdonisJS (TypeScript)
- Base URL (lokal): http://localhost:3333
- Semua endpoint API diawali dengan prefix `/api`
- Otentikasi: Bearer token (header `Authorization: Bearer <token>`)

Persyaratan
- Node.js >= 16
- PostgreSQL (atau DB yang dikonfigurasi)
- Yarn atau npm
- .env terisi sesuai contoh di bawah

Contoh .env
- Buat file .env di root proyek. Contoh variabel:
  APP_KEY=your_app_key_here
  NODE_ENV=development
  PORT=3333
  DB_CONNECTION=pg
  PG_HOST=127.0.0.1
  PG_PORT=5432
  PG_USER=postgres
  PG_PASSWORD=secret
  PG_DB_NAME=seal_db

Instalasi & Jalankan secara lokal
1. Clone repo dan masuk ke folder:
   - git clone <repo>
   - cd /home/gilanghuda/coding/seal-backend
2. Install dependencies:
   - npm install
   - atau yarn
3. Siapkan .env sesuai contoh di atas
4. Jalankan migrasi database:
   - node ace migration:run
   (Jika menggunakan seed: node ace db:seed --files=...)
5. Jalankan server development:
   - npm run dev
   - Akses: http://localhost:3333

Build & Start production
- npm run build
- npm start
- Pastikan environment variabel production sudah di-set.

Testing
- npm run test

Autentikasi
- Sistem menggunakan token Bearer. Dapatkan token lewat endpoint /api/auth/login.
- Sertakan header: Authorization: Bearer <token>

API Endpoints 

1) Auth
- POST /api/auth/register
  - Deskripsi: Registrasi user baru
  - Body JSON:
    {
      "username":"johndoe",
      "email":"john@example.com",
      "password":"password123"
    }
  - Contoh curl:
    curl -X POST http://localhost:3333/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'
  - Response: 201 (user created) atau 400 (validation)

- POST /api/auth/login
  - Deskripsi: Login, kembalikan token
  - Body JSON:
    { "email":"john@example.com", "password":"password123" }
  - Contoh:
    curl -X POST http://localhost:3333/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"john@example.com","password":"password123"}'
  - Response: 200, { success, message, data: { token, user } }

- POST /api/auth/logout
  - Deskripsi: Logout (memerlukan Authorization header)
  - Contoh:
    curl -X POST http://localhost:3333/api/auth/logout \
      -H "Authorization: Bearer <token>"

- GET /api/auth/me
  - Deskripsi: Ambil profil user saat ini
  - Contoh:
    curl -X GET http://localhost:3333/api/auth/me \
      -H "Authorization: Bearer <token>"

2) Chat (prefix: /api/chat, perlu auth)
- POST /api/chat/questions
  - Deskripsi: Kirim pertanyaan ke chatbot. Jika `conversation_id` kosong, server buat percakapan baru. Memanggil API eksternal (Majadigi) dan menyimpan balasan.
  - Body JSON:
    {
      "question": "Apa itu pajak daerah?",
      "conversation_id": "optional-uuid"
    }
  - Contoh curl:
    curl -X POST http://localhost:3333/api/chat/questions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <token>" \
      -d '{"question":"Apa itu pajak daerah?"}'
  - Response: 200, data: { conversation, user_message, bot_message }

- GET /api/chat/conversations
  - Deskripsi: Daftar percakapan user (cursor-based pagination)
  - Query params:
    - cursor (base64 id) — kosong untuk halaman pertama
    - limit (integer, default 10, max 100)
  - Contoh:
    curl "http://localhost:3333/api/chat/conversations?limit=10" \
      -H "Authorization: Bearer <token>"
  - Response: 200, { conversations: [...], pagination: { next_cursor, has_more, limit }, meta: {...} }

- GET /api/chat/conversations/:conversationId
  - Deskripsi: Detail percakapan + pesan (messages pagination)
  - Query params:
    - messages_cursor (base64 message id)
    - messages_limit (default 20)
  - Contoh:
    curl "http://localhost:3333/api/chat/conversations/CONV_UUID?messages_limit=20" \
      -H "Authorization: Bearer <token>"
  - Response: 200, { conversation, messages: [...], pagination: {...} }

- DELETE /api/chat/conversations/:conversationId
  - Deskripsi: Hapus percakapan & semua pesan (hanya owner)
  - Contoh:
    curl -X DELETE http://localhost:3333/api/chat/conversations/CONV_UUID \
      -H "Authorization: Bearer <token>"

Detail format response (contoh singkat)
- Conversation item:
  {
    "id": "uuid",
    "session_id": "string",
    "last_message": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }

- Message item:
  {
    "id": "uuid",
    "sender_type": "user|bot",
    "message": "string",
    "suggest_links": [ { "title":"", "link":"" } ] | null,
    "created_at": "datetime"
  }

Penjelasan Cursor Pagination 
- Cursor adalah base64 dari ID (biasanya ID terakhir dari halaman sebelumnya).
- Untuk mendapatkan halaman pertama: omit cursor
- Jika response mengandung pagination.next_cursor -> gunakan itu sebagai cursor param pada request berikutnya
- Has_more = false -> tidak ada data lagi
