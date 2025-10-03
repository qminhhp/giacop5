# Hướng dẫn Migration Supabase

## Migration mới: Lịch làm việc (Work Schedules)

### File migration:
- `migrations/001_work_schedules.sql`

### Mục đích:
Tạo bảng `work_schedules` để lưu trữ lịch làm việc hàng ngày của các thành viên với 3 buổi: sáng, chiều, tối.

### Cách chạy migration:

#### Cách 1: Sử dụng Supabase Dashboard
1. Đăng nhập vào Supabase Dashboard
2. Chọn project của bạn
3. Vào phần **SQL Editor**
4. Copy toàn bộ nội dung file `migrations/001_work_schedules.sql`
5. Paste vào SQL Editor
6. Nhấn **Run** để thực thi

#### Cách 2: Sử dụng Supabase CLI (nếu đã cài đặt)
```bash
supabase db push --file supabase/migrations/001_work_schedules.sql
```

### Cấu trúc bảng `work_schedules`:
- `id`: Primary key tự động tăng
- `member_id`: ID thành viên (liên kết với bảng members)
- `date`: Ngày làm việc (format: YYYY-MM-DD)
- `morning`: Mã hoạt động buổi sáng (vd: 101, 102, 201...)
- `afternoon`: Mã hoạt động buổi chiều
- `evening`: Mã hoạt động buổi tối
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### Tính năng:
- Row Level Security (RLS) đã được bật
- Indexes cho tối ưu hiệu năng
- Unique constraint cho (member_id, date) để tránh trùng lặp
- Trigger tự động cập nhật `updated_at`

### Lưu ý:
- Hệ thống sẽ tự động sử dụng Supabase khi có kết nối
- Nếu không kết nối được Supabase, sẽ fallback về localStorage
- Dữ liệu được lưu song song ở cả 2 nơi để đảm bảo không mất dữ liệu

### Kiểm tra sau khi chạy:
1. Vào **Table Editor** trong Supabase Dashboard
2. Kiểm tra bảng `work_schedules` đã được tạo
3. Kiểm tra các policies và indexes

### Rollback (nếu cần):
```sql
DROP TABLE IF EXISTS work_schedules CASCADE;
```