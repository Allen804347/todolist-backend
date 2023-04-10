# 重要！鎖定 node 版本，保證開發環境與部屬環境一致
FROM node:lts-alpine AS base
# 建立 App 資料夾並授權給 node 使用者
RUN mkdir -p /opt/app && chown -R node /opt/app
COPY package.json /opt/app
WORKDIR /opt/app
# 可設定參數
ARG NODE_ENV=production
ARG NODE_PORT=3000
# 設定環境變數
ENV \
  NODE_ENV=${NODE_ENV} \
  NODE_PORT=${NODE_PORT}
# 暴露阜號
EXPOSE ${NODE_PORT}

# 用於本地 local 開發
FROM base AS local
# 安裝全部依賴套件
RUN npm install
# 複製本地 local 開發會用到的程式碼
COPY . /opt/app
CMD ["npm", "run", "dev"]
