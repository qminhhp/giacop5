# Hướng dẫn đẩy code lên GitHub

## Bước 1: Tạo repository trên GitHub

1. Truy cập https://github.com/new
2. Đặt tên repository: `giacop5`
3. Chọn **Public** hoặc **Private** tùy ý
4. **KHÔNG** chọn "Initialize this repository with a README"
5. Click **Create repository**

## Bước 2: Kết nối và đẩy code

Sau khi tạo repository, chạy các lệnh sau trong terminal:

```bash
# Thêm remote origin (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/giacop5.git

# Hoặc nếu dùng SSH
git remote add origin git@github.com:YOUR_USERNAME/giacop5.git

# Đẩy code lên GitHub
git push -u origin main
```

## Bước 3: Deploy lên Vercel (Tùy chọn)

1. Truy cập https://vercel.com
2. Click **New Project**
3. Import repository `giacop5` từ GitHub
4. Click **Deploy**
5. Đợi vài phút để deploy hoàn tất

## Thông tin dự án

- **Tên repository**: giacop5
- **Branch chính**: main
- **Framework**: Next.js 15
- **Node version**: 18+

## Các lệnh Git thường dùng

```bash
# Xem trạng thái
git status

# Thêm thay đổi
git add .

# Commit
git commit -m "Mô tả thay đổi"

# Push lên GitHub
git push

# Pull từ GitHub
git pull
```

## Environment Variables (nếu cần)

Không có biến môi trường nào cần thiết cho dự án này.
Tất cả dữ liệu được lưu trong localStorage của trình duyệt.

## Build Production

```bash
# Build locally
npm run build

# Start production server
npm start
```

---

✅ Code đã được commit và sẵn sàng để push lên GitHub!