FROM registry-gitlab.nexon.com/publishingrpg_web/docker_images/node-22.4

# 작업 디렉토리 설정
WORKDIR /app

# ------ Start: Nodejs App Build ------
# 환경 변수 설정
ENV NODE_ENV=production

# ARG 정의 (Docker 빌드 시 --build-arg 옵션으로 전달)
ARG APP_ENV=live
ENV APP_ENV=${APP_ENV}

# 환경별 .env 파일 복사 (예: .env.live)
# RUN rm -f .env
COPY .env.${APP_ENV} .env
RUN cat .env

# package.json 및 기타 관련 파일 복사
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# 종속성 설치 및 node_modules 폴더 이동
RUN npm install --silent --only=production && mv node_modules ../
# 나머지 파일 복사
COPY . .
# Nuxt.js(or Next.js) 애플리케이션 빌드
RUN npm cache clean --force

RUN npm run build

# PM2 설치
RUN npm install pm2 -g
# 웹서버 3000 포트 오픈
EXPOSE 3000
# ------ End: Nodejs App Build ------

# ------ Start: SSHD, Nodejs App Execute ------
# ENTRYPOINT 실행권한 부여
RUN chmod +x ./entrypoint.sh
# ENTRYPOINT 실행
ENTRYPOINT ./entrypoint.sh
# ------ End: SSHD, Nodejs App Execute ------
