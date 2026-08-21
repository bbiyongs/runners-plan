# 빌드 스테이지
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# gradle 래퍼 및 설정 파일 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle

# gradlew 실행 권한 부여 및 의존성 사전 다운로드
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

# 소스코드 복사 및 앱빌드
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# 실행 스테이지 (경량 jre)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 결과물 jar 복사
COPY --from=builder /app/build/libs/*.jar app.jar

#타임존 설정
ENV TZ=Asia/Seoul

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]