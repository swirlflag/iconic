# NNP, Nexon Nuxt Plate

## [TODO](https://gitlab.nexon.com/PublishingRPG_Web/nnp/-/wikis/%ED%95%A0%EC%9D%BC)

## 사전 설정 및 주요 기능

### Nuxt config

### Plates

#### loading

#### base

#### modal, toast

#### nav

#### page

### middleware

#### (server) IE 검거

#### (server) intro 셋팅

#### (global) 인증 가드

### 비동기 패턴

#### useAsyncStatus

#### useAsyncStore

#### ASC

### elf(API) (작성중)

-   로직 단계에서 try catch 없는 사용 방식 (errorless)
-   setAirplane: 각 요청처(airplane) 별로 기본 셋팅을 설정후 필요시 요청별로 추가 수정 가능
-   codePath: airplane별로 요청에 대한 응답 코드 위치를 설정 가능
-   codeMessage: airplane 별로 응답 코드에 대한 자연어 텍스트를 설정 가능, 요청 별로 수정 가능

### Store

#### async

#### modal, toast

#### nexon

#### global

#### info

#### nav

#### community

### Modal

#### system (alert, confirm, wait)

#### source (image, video, youtube)

#### custom (template 내에 코드 작성)

#### unique (vue 파일 작성)

### Island components

### Style: global, preload

#### reset

#### font

#### 전역 변수

#### 벡터 아이콘 등록, 설정

#### scramble

#### mixin, media

### Composables, Utils

### NEXON setting

#### inface

#### NEXON GNB

#### PS

#### TOY communit

##### config

#### JARVIS

#### applicationinsights

##### afterbuild

### code formatter, lint

#### prettier

#### eslint

## 시작하기

### 설치 및 실행

-   node 버전은 **22+** 로 준비해주세요.
-   로컬에 glt clone 후 `npm install` 합니다.
-   `npm run dev` 를 입력하여 `stage` 혹은 `live` 환경으로 실행합니다.

## npm script

로컬에서 사용할 수 있는 npm 스크립트는 다음과 같습니다

-   `npm run dev`: 개발 서버를 실행합니다 (sh/dev.sh).
-   `npm run stagebuild`: STAGE 설정으로 빌드합니다.
-   `npm run livebuild`: LIVE 설정으로 빌드합니다.
-   `npm run deploy`: 배포를 시작합니다. (sh/deploy.sh).
-   `npm run clean`: Nuxt 캐시와 node_modules를 삭제합니다.
-   `npm run pm2`: PM2를 사용하여 빌드된 결과물을 실행합니다.

서버에서 사용되는 npm 스크립트

-   `npm run build`

## 제작 시도 예정

-   전역 텍스트 관리 시스템 + 다국어 지원
-   더 나은 SSG를 위한 크롤링 시스템
-   프로젝트 env 셋팅을 쉽게 도와주는 bash 스크립트
-   nnp의 부분적 설치
-   private npm 저장소
-   균일한 프론트 API 제작을 위한 패턴 및 프론트 서버 실행 런타임의 기초 구성

## 문제 및 개선해야 할 사항들

-   useAsyncStatus 인스턴스의 서버 조작이 클라이언트 스코프까지 이어지지 않는 현상: 메소드가 serialization 되거나 status ref의 옵저버가 소실되는듯한 문제
-   useAsyncStore의 값들이 devtools에 표시되지 않음
