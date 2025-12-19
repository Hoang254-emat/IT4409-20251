# Sử dụng môi trường Node.js phiên bản 18 [cite: 215]
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container [cite: 216]
WORKDIR /app

# Copy file quản lý thư viện và cài đặt [cite: 217, 218]
COPY package.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container [cite: 219]
COPY . .

# Mở cổng 3001 (cổng server của bạn) [cite: 220]
EXPOSE 3001

# Lệnh khởi chạy ứng dụng [cite: 221]
CMD ["node", "server.js"]