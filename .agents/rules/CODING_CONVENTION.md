# Coding Convention

## 1. Common

* 의미 있는 이름 사용
* 함수는 하나의 명확한 책임
* 중복 코드 최소화
* 하드코딩 금지
* 매직 넘버 금지
* 불필요한 전역 상태 금지
* 예외를 무시하지 않음

---

# 2. Spring Boot

```text
Controller
    ↓
Service
    ↓
Mapper
```

### Controller

* HTTP 요청 처리
* Validation
* Service 호출
* Response 반환

비즈니스 로직을 작성하지 않는다.

### Service

* 비즈니스 로직
* 데이터 조합
* 트랜잭션

### Mapper

* SQL 실행
* DB 접근

SQL과 비즈니스 로직을 분리한다.

### DTO

API Request / Response를 DTO로 관리한다.

Entity를 API Response로 직접 노출하지 않는다.

---

# 3. Python / FastAPI

```text
Router
   ↓
Service
   ↓
Analysis / Integration
```

Garmin 연동과 분석 로직을 분리한다.

Pandas 분석 코드를 Router에 직접 작성하지 않는다.

---

# 4. React

```text
Page
 ↓
Component
 ↓
Hook
 ↓
API Service
```

API 호출 코드를 화면 Component에 직접 작성하지 않는다.

반복되는 UI는 공통 Component로 분리한다.

---

# 5. OOP

Java는 객체지향 설계를 기본으로 한다.

중요한 원칙:

* SRP
* OCP
* DIP

단, 디자인 패턴을 사용하기 위해 구조를 복잡하게 만들지 않는다.

**이해하기 쉬운 구조를 우선한다.**

---

# 6. Comments

다음과 같은 코드에는 주석을 남긴다.

```text
복잡한 계산
데이터 변환
외부 API 처리
Garmin 데이터 처리
Pandas 분석
특별한 설계 결정
```

주석은 "무엇을 하는가"보다
"왜 이렇게 했는가"를 설명한다.
