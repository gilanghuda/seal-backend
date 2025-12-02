# Seal Backend

Ringkasan singkat
- Nama: Seal Backend
- Framework: AdonisJS (TypeScript)
- Base URL (lokal): `http://localhost:3333`
- Prod URL : `https://seal.gilanghuda.my.id`
- Semua endpoint API diawali dengan prefix `/api`
- Dokumentasi interaktif (Swagger UI): `https://seal.gilanghuda.my.id/docs` (production) atau `http://localhost:3333/docs` (lokal)
- Spec Swagger JSON: `/swagger.json`
- Otentikasi: Bearer token (`Authorization: Bearer <token>`)

Quick Links
- Production: https://seal.gilanghuda.my.id/
- Swagger / API Docs: https://seal.gilanghuda.my.id/docs

Requirements
- Node.js >= 16
- PostgreSQL (atau DB sesuai config)
- npm atau yarn
- File `.env` terisi

Contoh .env (minimal)
```
APP_KEY=your_app_key_here
NODE_ENV=development
PORT=3333
DB_CONNECTION=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=secret
PG_DB_NAME=seal_db
```

Instalasi & Jalankan (lokal)
1. Clone repo
   - git clone <repo>
   - cd /home/gilanghuda/coding/seal-backend
2. Install dependencies
   - `npm install` atau `yarn`
3. Siapkan `.env`
4. Jalankan migrasi
   - `node ace migration:run`
5. Jalankan server development
   - `npm run dev`
   - Akses: `http://localhost:3333`

Build & Start (production)
- `npm run build`
- `npm start`

Docker
- Dockerfile sudah menyalin folder `docs`, sehingga Swagger UI dan `swagger.json` akan tersedia di image production jika ada.

Konfigurasi Swagger
- Tidak ada perubahan tambahan yang diperlukan di `config/swagger.ts`. Konfigurasi saat ini sudah mengaktifkan UI dan spec (pastikan file `docs/swagger.json` ada apabila ingin menampilkan spec di production).

Endpoint Summary (ringkas)
| Method | Path | Auth | Deskripsi |
|---:|---|---:|---|
| POST | /api/auth/register | No | Registrasi user baru |
| POST | /api/auth/login | No | Login -> return token |
| POST | /api/auth/logout | Yes | Logout (butuh token) |
| GET  | /api/auth/me | Yes | Ambil profil user saat ini |
| POST | /api/chat/questions | Yes | Kirim pertanyaan ke chatbot (buat percakapan baru jika tidak ada conversation_id) |
| GET  | /api/chat/conversations | Yes | Daftar percakapan user (cursor-based pagination) |
| GET  | /api/chat/conversations/:conversationId | Yes | Detail percakapan + pesan (messages pagination) |
| DELETE | /api/chat/conversations/:conversationId | Yes | Hapus percakapan & semua pesan (owner saja) |

Contoh Request (curl)
- Register
```
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'
```
- Login
```
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```
- Kirim pertanyaan ke chatbot
```
curl -X POST http://localhost:3333/api/chat/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"question":"Apa itu pajak daerah?"}'
```
- Ambil list percakapan (pagination)
```
curl "http://localhost:3333/api/chat/conversations?limit=10" \
  -H "Authorization: Bearer <token>"
```

Format Response (contoh singkat)
- Conversation item:
```
{
  "id": "uuid",
  "session_id": "string",
  "last_message": "string|null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
- Message item:
```
{
  "id": "uuid",
  "sender_type": "user|bot",
  "message": "string",
  "suggest_links": [ { "title":"", "link":"" } ] | null,
  "created_at": "datetime"
}
```

Cursor-based Pagination (penjelasan lengkap)
- Konsep singkat:
  - Cursor pagination menggunakan "pointer" (cursor) yang merepresentasikan posisi di dataset (biasanya base64-encoded ID).
  - Untuk halaman pertama, jangan sertakan `cursor`. Server mengembalikan data plus `pagination.next_cursor` jika masih ada halaman berikutnya.
  - Klien menggunakan `next_cursor` sebagai `cursor` pada request berikutnya untuk mengambil halaman selanjutnya.

- Mengapa base64?
  - Meng-encapsulate ID (atau kombinasi ID+timestamp) membuat cursor aman dan tidak langsung menampilkan internal ID.
  - Contoh encoding/decoding (pseudocode):
    - Encode: btoa(id)  (browser/JS) → menyiapkan cursor untuk query selanjutnya
    - Decode: atob(cursor)  (browser/JS) → dapatkan id asli (biasanya tidak perlu di-klien)

- Contoh alur:
  1. Request pertama (halaman pertama):
     curl "http://localhost:3333/api/chat/conversations?limit=10" -H "Authorization: Bearer <token>"
  2. Response misal mengandung:
     {
       "data": { "conversations": [ ... 10 items ... ], "pagination": { "next_cursor": "NjMwZWMwNzIt...", "has_more": true, "limit": 10 } }
     }
  3. Request selanjutnya:
     curl "http://localhost:3333/api/chat/conversations?limit=10&cursor=NjMwZWMwNzIt..." -H "Authorization: Bearer <token>"

- Contoh response (singkat):
  {
    "success": true,
    "data": {
      "conversations": [ /* items sorted desc by created_at or last_message */ ],
      "pagination": {
        "next_cursor": "NjMwZWMwNzItY2U4YS00MDEyLWFmMzUtOTAxZTcxMWE1MzUy",
        "has_more": true,
        "limit": 10
      }
    }
  }

- Implementasi server-side (catatan penting):
  - Urutan (ordering) harus konsisten antar request. Pilih:
    - Chronological (oldest first) atau reverse chronological (newest first). Pastikan client memahami urutan.
  - Contoh query (Postgres, newest-first):
    - Jika cursor kosong: SELECT * FROM conversations WHERE user_id = $1 ORDER BY id DESC LIMIT $limit
    - Jika cursor diberikan (decoded_id): SELECT * FROM conversations WHERE user_id = $1 AND id < decoded_id ORDER BY id DESC LIMIT $limit
    - Set next_cursor ke base64(id_terakhir_dari_halaman_ini) jika hasil penuh (jumlah == limit) dan masih mungkin ada data.
  - Untuk messages (chronological oldest-first), gunakan condition id > decoded_id dan ORDER BY id ASC.
  - Jangan gunakan OFFSET untuk dataset besar (kurang efisien). Cursor-based lebih stabil untuk list yang sering berubah.

- Edge cases & tips:
  - Jika item dihapus atau disisipkan di antara permintaan, cursor-based tetap lebih andal dibanding offset tapi bisa menyebabkan overlap/miss dalam skenario tertentu — pertimbangkan stable sort key (created_at + id).
  - Sertakan limit maksimum di server (misal 100) untuk mencegah abuse.
  - Jika ingin penjelasan lebih eksplisit di response, sertakan juga `first_item_id` atau `last_item_id` untuk debugging.

Swagger / API Docs
- Buka `/docs` untuk UI interaktif.
- UI memuat spec dari `/swagger.json`.
- Pastikan file `docs/swagger.json` ada di repository atau di-build pipeline untuk production.

Catatan Tambahan
- Semua endpoint yang membutuhkan otentikasi memakai middleware `auth:api`.
- Jika ingin mengganti host/servers di Swagger, ubah `config/swagger.ts` -> `options.definition.servers`.
