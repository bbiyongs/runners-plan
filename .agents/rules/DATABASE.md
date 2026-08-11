# Database Rules

## 1. Database

PostgreSQL을 사용한다.

DB 변경 전 기존 테이블과 관계를 확인한다.

---

## 2. MyBatis

Spring Boot에서는 MyBatis를 사용한다.

```text
Service
  ↓
Mapper
  ↓
MyBatis
  ↓
PostgreSQL
```

SQL은 Java 코드에 직접 작성하지 않는다.

---

## 3. DB Design

다음을 고려한다.

* Primary Key
* Foreign Key
* NOT NULL
* UNIQUE
* Index
* 데이터 타입
* NULL 처리

---

## 4. Query

SQL은 가독성과 유지보수성을 우선한다.

조회 성능이 중요한 경우 실행 계획을 확인한다.

불필요한 조회와 중복 SQL을 줄인다.

---

## 5. Schema Change

DB 구조를 변경하기 전에 확인한다.

```text
Table
 ↓
Relationship
 ↓
Existing Data
 ↓
Mapper
 ↓
Service
 ↓
API
```

기존 기능에 영향을 주는 경우 먼저 설명한다.
