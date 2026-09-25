FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY gradle.properties .
RUN chmod +x gradlew
COPY src src
RUN ./gradlew bootJar --no-daemon

# 코딩 문제 채점(JavaRunner)이 서버에서 자바를 컴파일하므로 실행 이미지도 JDK를 쓴다
FROM eclipse-temurin:17-jdk-alpine
ENV LANG=ko_KR.UTF-8
ENV LC_ALL=ko_KR.UTF-8
ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
COPY src/main/resources/content content
EXPOSE 8080
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
