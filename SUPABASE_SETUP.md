# Hướng dẫn thiết lập Supabase Database

## Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào: https://supabase.com/dashboard
2. Chọn project của bạn hoặc tạo project mới

## Bước 2: Thiết lập Database Schema

1. Trong Dashboard, chọn **SQL Editor** từ sidebar
2. Click **New Query**
3. Copy và paste toàn bộ nội dung từ file `supabase/schema.sql`
4. Click **Run** để tạo tables và data

## Bước 3: Kiểm tra Database

### Kiểm tra Tables đã được tạo:
1. Chọn **Table Editor** từ sidebar
2. Bạn sẽ thấy 2 tables:
   - `members` (22 rows)
   - `scores` (empty - sẽ có data khi sử dụng app)

### Kiểm tra Row Level Security:
1. Chọn **Authentication** > **Policies**
2. Bạn sẽ thấy policies cho cả 2 tables

## Bước 4: Test Connection

1. Chạy app local: `npm run dev`
2. Truy cập http://localhost:3001
3. Thử nhập điểm cho một thành viên
4. Kiểm tra trong Table Editor xem data đã được lưu chưa

## Environment Variables đã cấu hình:

```env
NEXT_PUBLIC_SUPABASE_URL=https://scxmxttkzaqticgklgmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeG14dHRremFxdGljZ2tsZ21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjI5ODcsImV4cCI6MjA3MjM5ODk4N30.AAKj8dWFaxmHNpAKcex0RsZgAt8DdwpYk2Bb4wP3Kyw
```

## Database Schema:

### Table: `members`
- `id` (TEXT) - Primary Key
- `name` (TEXT) - Tên thành viên
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table: `scores`
- `id` (SERIAL) - Primary Key
- `member_id` (TEXT) - Foreign Key to members.id
- `date` (DATE) - Ngày chấm điểm
- `activities` (JSONB) - Chi tiết điểm từng hoạt động
- `total_points` (INTEGER) - Tổng điểm
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Unique constraint**: (member_id, date)

## Tính năng Offline/Fallback:

Ứng dụng sẽ tự động:
1. **Ưu tiên Supabase**: Lưu và đọc từ database
2. **Fallback localStorage**: Nếu không kết nối được Supabase
3. **Sync tự động**: Khi kết nối trở lại

## Troubleshooting:

### Lỗi kết nối:
- Kiểm tra URL và API Key trong `.env.local`
- Đảm bảo RLS policies đã được tạo
- Kiểm tra network connection

### Data không hiển thị:
- Kiểm tra Console log để xem error
- Verify data trong Supabase Table Editor
- Test với localStorage fallback

### Schema changes:
- Backup data trước khi thay đổi
- Update schema.sql file
- Run migration scripts

---

✅ **Database đã sẵn sàng sử dụng!**

Giờ ứng dụng có thể lưu trữ data persistent và truy cập từ nhiều thiết bị.