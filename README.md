# Bảng Thi Đua Thánh Đồ

Hệ thống chấm điểm thi đua cho các thánh đồ trong khu vực Hội Thánh của Đức Chúa Trời.

## Tính năng

- ✅ Danh sách 22 thành viên với bảng xếp hạng theo điểm số
- ✅ Giao diện đơn giản như Google Sheets, tối ưu cho mobile
- ✅ 16 hạng mục chấm điểm với các điều kiện khác nhau
- ✅ Bảo mật bằng mật khẩu: `gc5ctcm`
- ✅ Chấm điểm cho ngày hiện tại và các ngày trước đó
- ✅ Lưu trữ dữ liệu trên trình duyệt (localStorage)
- ✅ Tính điểm tự động theo quy định
- ✅ URL thân thiện theo tên thành viên (ví dụ: `/thanh-vien/vu-huy-diep`)
- ✅ Xem bảng xếp hạng theo tháng (tháng hiện tại và tháng trước)
- ✅ Checkbox và form input được tối ưu cho mobile

## Cách sử dụng

### 1. Trang chủ
- Hiển thị danh sách toàn bộ thành viên
- Sắp xếp theo tổng điểm từ cao xuống thấp
- Nhấp vào tên thành viên để vào trang chấm điểm
- **Mới:** Chuyển đổi giữa tháng hiện tại và tháng trước bằng nút mũi tên

### 2. Nhập điểm
- Nhập mật khẩu: `gc5ctcm` (lưu 30 phút)
- Chọn ngày cần nhập điểm (mặc định là hôm nay)
- **Cải tiến:** 
  - Checkbox và radio button hiển thị rõ ràng với dấu tích xanh
  - Nút +/- to và rõ ràng cho nhập số
  - Mật khẩu tự động lưu 30 phút
- Điền điểm theo từng hạng mục
- Nhấn "Lưu điểm" để hoàn tất

## Hạng mục chấm điểm

| Hạng mục | Điểm | Giới hạn | Loại nhập |
|----------|------|----------|-----------|
| Nhóm sáng: 8h-8h30 | 50 | 50/ngày, T2-T6 | Checkbox |
| Phát biểu 1 bài GĐ | 50 | - | Số |
| Hoàn thành Edu | 500 | 500/tháng | Checkbox |
| Hoàn thành My page | 100 | 100/ngày | Checkbox |
| Praydaily | 50 | 50/ngày | Checkbox |
| Cầu nguyện hằng hiến | 10 | 20/ngày | Checkbox (sáng+chiều) |
| Cầu nguyện khác (3p+) | 10 | 100/ngày | Số |
| Bốc giáo huấn viết lên nhóm | 10 | 20/ngày | Radio (0,1,2) |
| Viết thư lên Mẹ | 50 | 50/ngày | Số |
| Viết 3 điều cảm tạ | 50 | 50/ngày | Checkbox |
| Truyền đạo trực tuyến | 50 | 50/ngày | Checkbox |
| 1 Ca trudo | 200 | - | Số |
| Báp têm | 1000 | - | Số |
| Đơn thuần | 50 | - | Số |
| Hữu hiệu | 200 | - | Số |
| Nhập Mymemo | 20 | - | Checkbox |

## Danh sách thành viên

22 thành viên được quản lý trong hệ thống:

1. Vũ Huy Điệp
2. Vũ Quang Minh  
3. Bùi Hồng Dương
4. Hoàng Văn Đào
5. Nguyễn Tiến Đạt
6. Vương Văn Chính
7. Ninh Văn Thành
8. Ngô Ngọc Phúc
9. Trương Đình Đạt
10. Vũ Văn Bảng
11. Nguyễn Ngọc Khanh
12. Lê Trung Kiên
13. Nguyễn Hồng Tam
14. Đỗ Văn Thoại
15. Nguyễn Văn Phương
16. Lê Ngọc Trí
17. Nguyễn Văn Khôi
18. Khuất Thanh Duy
19. Nguyễn Huy Công
20. Nguyễn Văn Thắng
21. Đỗ Long Thành
22. Nguyễn Thái Ất

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
npm start
```

Mở [http://localhost:3001](http://localhost:3001) để xem ứng dụng.

**Lưu ý:** Nếu port 3000 đã được sử dụng, ứng dụng sẽ tự động chuyển sang port khả dụng tiếp theo.

## Công nghệ sử dụng

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **LocalStorage** - Lưu trữ dữ liệu

## Ghi chú

- Dữ liệu được lưu trữ trên trình duyệt, không cần server
- Giao diện tối ưu cho mobile như native app
- Hỗ trợ PWA (có thể cài đặt trên điện thoại)
- Mật khẩu cố định: `gc5ctcm`
