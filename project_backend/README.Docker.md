# Docker Configuration Guide

## Giới thiệu

Project này đã được cấu hình với Docker bao gồm:
- **Backend**: Node.js/TypeScript application
- **MongoDB**: Database
- **MinIO**: Object storage (tương thích S3)

## Yêu cầu

- Docker Desktop hoặc Docker Engine
- Docker Compose

## Cấu trúc Files

```
├── Dockerfile                 # Production build
├── Dockerfile.dev            # Development build
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── .dockerignore             # Files to ignore in Docker builds
└── .env.example              # Environment variables template
```

## Cách sử dụng

### Development Mode (Khuyến nghị cho development)

1. **Tạo file .env từ .env.example:**
```bash
cp .env.example .env
```

2. **Chỉnh sửa .env theo nhu cầu của bạn**

3. **Khởi động services:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. **Xem logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f backend
```

5. **Dừng services:**
```bash
docker-compose -f docker-compose.dev.yml down
```

### Production Mode

1. **Build và start:**
```bash
docker-compose up -d --build
```

2. **Xem logs:**
```bash
docker-compose logs -f backend
```

3. **Dừng services:**
```bash
docker-compose down
```

## Services và Ports

| Service | Port | Mô tả |
|---------|------|-------|
| Backend | 5000 | API Server |
| MongoDB | 27017 | Database |
| MinIO | 9000 | S3-compatible API |
| MinIO Console | 9001 | MinIO Web UI |

## Truy cập Services

- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017
- **MinIO Console**: http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

## MinIO Configuration

MinIO được cấu hình với:
- **Endpoint**: http://localhost:9000
- **Access Key**: minioadmin
- **Secret Key**: minioadmin
- **Default Bucket**: project-bucket

### Sử dụng MinIO trong code

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});
```

## Quản lý Volumes

### Xem volumes:
```bash
docker volume ls
```

### Xóa data (cẩn thận!):
```bash
# Development
docker-compose -f docker-compose.dev.yml down -v

# Production
docker-compose down -v
```

## Troubleshooting

### Backend không kết nối được MongoDB:
```bash
# Kiểm tra MongoDB đang chạy
docker-compose ps

# Xem logs MongoDB
docker-compose logs mongo
```

### Reset toàn bộ:
```bash
# Development
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build

# Production
docker-compose down -v
docker-compose up -d --build
```

### Kết nối MongoDB từ local machine:
```bash
# Install MongoDB Compass hoặc mongosh
mongosh mongodb://localhost:27017/project_db
```

## Môi trường Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Hot Reload | ✅ Yes | ❌ No |
| Source Maps | ✅ Yes | ❌ No |
| Volume Mounting | ✅ Yes | ❌ No |
| Build Optimization | ❌ No | ✅ Yes |
| Health Checks | ❌ No | ✅ Yes |

## Lệnh hữu ích

```bash
# Rebuild một service cụ thể
docker-compose up -d --build backend

# Vào shell của container
docker-compose exec backend sh

# Xem resource usage
docker stats

# Clean up unused images
docker system prune -a

# Backup MongoDB
docker-compose exec mongo mongodump --out /data/backup

# Restore MongoDB
docker-compose exec mongo mongorestore /data/backup
```
