FROM node:20-alpine

WORKDIR /app

# 의존성 설치 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# vite 개발 서버 포트 노출
EXPOSE 5173

# 외부에서 접근 가능하도록 --host 옵션 포함
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]