// Spring · Spring Boot · JPA 기술 면접·필기 대비 자체 제작 문제 60문항 (4지선다)
// 사이트의 스프링 이론 노트(content/spring)와 면접 빈출 주제를 기준으로 구성. Spring Boot 3 / Spring 6 동작 기준.
export const SPRING_SECTIONS = {
  core: {name:'스프링 코어', short:'코어', sub:'IoC·DI · 빈 스코프·생명주기 · 컴포넌트 스캔 · @Autowired · AOP · PSA', count:15},
  web:  {name:'웹 MVC·시큐리티', short:'웹', sub:'DispatcherServlet · 필터/인터셉터 · 요청 바인딩 · 예외 처리 · 검증 · Security · CORS/CSRF', count:15},
  data: {name:'JPA·트랜잭션', short:'데이터', sub:'영속성 컨텍스트 · 연관관계 · 지연 로딩 · N+1 · OSIV · @Transactional · 락', count:18},
  boot: {name:'스프링 부트·테스트·설계', short:'부트', sub:'자동 설정 · 스타터 · 외부 설정 · 내장 톰캣 · 액추에이터 · 슬라이스 테스트 · 패턴·SOLID', count:12},
};

export const SPRING_QUESTIONS = [
/* ===== 스프링 코어 15 ===== */
{id:'c01',sec:'core',topic:'IoC',q:'스프링의 IoC(제어의 역전)를 가장 정확하게 설명한 것은?',o:['객체 생성과 의존관계 연결의 제어권을 컨테이너가 가진다','개발자가 new로 직접 만든 객체만 컨테이너가 관리한다','빈의 생성 시점을 호출하는 쪽 코드가 직접 결정한다','컨테이너 없이 객체끼리 서로를 직접 찾아 연결한다'],a:0,e:'IoC는 객체의 생성·조립·생명주기 관리 권한이 개발자 코드에서 컨테이너로 넘어간 것을 말한다(①). ②는 반대로, new로 직접 만든 객체는 컨테이너가 관리하지 않는다. ③④는 제어권이 호출 코드에 남아 있는 전통적인 방식이다.'},
{id:'c02',sec:'core',topic:'DI·생성자 주입',q:'생성자 주입을 권장하는 이유로 옳지 않은 것은?',o:['final 필드로 선언해 불변성을 보장할 수 있다','컨테이너 없이도 단위 테스트에서 주입하기 쉽다','순환 참조가 있어도 애플리케이션이 정상 기동된다','의존성 누락을 객체 생성 시점에 바로 알 수 있다'],a:2,e:'생성자 주입은 순환 참조를 해결해 주는 것이 아니라 기동 시점에 드러내 실패시킨다. 그래서 ③이 틀린 설명이다. ①②④는 모두 생성자 주입의 실제 장점으로, 필드 주입은 final을 쓸 수 없고 테스트에서 리플렉션 없이는 주입하기 어렵다.'},
{id:'c03',sec:'core',topic:'순환 참조',code:`@Component
class A {
    private final B b;
    A(B b) { this.b = b; }
}

@Component
class B {
    private final A a;
    B(A a) { this.a = a; }
}`,q:'두 빈이 서로를 생성자로 주입받는다. 애플리케이션을 실행하면?',o:['기동은 되고 첫 호출에서 StackOverflowError가 난다','기동 중 순환 참조 예외가 나며 실패한다','컨테이너가 지연 프록시를 끼워 넣어 자동으로 해결한다','나중에 만들어진 빈에 null이 주입된 채로 기동된다'],a:1,e:'생성자 주입은 객체를 만들려면 상대 빈이 먼저 완성되어 있어야 하므로 순환을 풀 방법이 없고, 컨테이너가 기동 중에 BeanCurrentlyInCreationException을 던진다(②). ③처럼 프록시로 풀려면 개발자가 @Lazy를 직접 붙여야 하고, 근본 해결은 설계에서 순환을 끊는 것이다.'},
{id:'c04',sec:'core',topic:'빈 스코프',q:'싱글톤 빈 A가 프로토타입 스코프 빈 B를 생성자로 주입받았다. A의 메서드를 3번 호출하는 동안 A가 사용하는 B 인스턴스는?',o:['호출할 때마다 새로 만들어져 3개','스레드마다 하나씩 만들어진다','HTTP 요청마다 하나씩 만들어진다','A 생성 때 주입된 1개'],a:3,e:'프로토타입 빈은 컨테이너에 요청할 때마다 새로 만들어지지만, 주입은 A가 생성될 때 한 번만 일어난다. 따라서 A는 그때 받은 B 하나를 계속 쓴다(④). 호출마다 새 인스턴스가 필요하면 ObjectProvider나 @Lookup, 스코프 프록시를 써야 한다.'},
{id:'c05',sec:'core',topic:'프로토타입 빈',q:'프로토타입 스코프 빈에 대한 설명으로 옳은 것은?',o:['컨테이너 종료 시 @PreDestroy가 인스턴스마다 호출된다','컨테이너는 초기화까지만 관여하고 소멸 콜백은 부르지 않는다','컨테이너 기동 시 한 개가 미리 만들어져 캐시에 보관된다','같은 HTTP 요청 안에서는 항상 같은 인스턴스가 반환된다'],a:1,e:'컨테이너는 프로토타입 빈을 생성·의존성 주입·초기화까지만 하고 클라이언트에 넘긴 뒤 더는 관리하지 않으므로 @PreDestroy가 호출되지 않는다(②). ③은 싱글톤, ④는 request 스코프의 설명이다.'},
{id:'c06',sec:'core',topic:'빈 생명주기',q:'@PostConstruct가 붙은 메서드가 호출되는 시점은?',o:['의존성 주입이 끝난 직후','생성자가 실행되기 직전','첫 메서드 호출 직전','컨테이너 종료 직전'],a:0,e:'빈 생명주기는 객체 생성 → 의존성 주입 → 초기화 콜백(@PostConstruct) → 사용 → 소멸 콜백(@PreDestroy) 순이다. 주입이 끝난 뒤에 불리므로 주입받은 필드를 안전하게 쓸 수 있다(①). ④는 @PreDestroy의 시점이다.'},
{id:'c07',sec:'core',topic:'스테레오타입 애너테이션',q:'@Component 대신 @Repository를 붙였을 때 추가로 얻는 기능은?',o:['메서드마다 트랜잭션을 자동으로 시작하고 커밋한다','반환값을 JSON으로 직렬화해 응답 본문에 기록한다','데이터 접근 예외를 스프링 예외로 변환한다','빈을 프로토타입 스코프로 등록해 매번 새로 만든다'],a:2,e:'@Repository가 붙은 빈에는 PersistenceExceptionTranslationPostProcessor가 적용되어 기술별 예외가 스프링의 DataAccessException 계층으로 변환된다(③). 트랜잭션은 @Transactional(①), JSON 응답은 @ResponseBody(②)의 역할이며 스코프는 그대로 싱글톤이다.'},
{id:'c08',sec:'core',topic:'컴포넌트 스캔',code:`package com.shop.app;

@SpringBootApplication
public class ShopApplication { ... }

// ------------------------------
package com.shop.common;

@Service
public class MailService { ... }`,q:'별도 스캔 설정이 없을 때 MailService는 어떻게 되는가?',o:['com.shop이 같으므로 스캔되어 정상 주입된다','@Service는 패키지와 무관하게 항상 등록된다','등록은 되지만 지연 초기화 빈으로 취급된다','스캔 범위 밖이라 빈으로 등록되지 않는다'],a:3,e:'@SpringBootApplication의 컴포넌트 스캔은 그 클래스가 놓인 패키지(com.shop.app)와 하위 패키지만 대상으로 한다. com.shop.common은 형제 패키지라 스캔되지 않고(④), 주입받는 곳이 있으면 NoSuchBeanDefinitionException으로 기동에 실패한다. 메인 클래스를 com.shop으로 올리거나 scanBasePackages를 지정해야 한다.'},
{id:'c09',sec:'core',topic:'@Autowired',code:`public interface DiscountPolicy { ... }

@Component
class FixDiscountPolicy implements DiscountPolicy { ... }

@Component
class RateDiscountPolicy implements DiscountPolicy { ... }

@Service
class OrderService {
    private final DiscountPolicy discountPolicy;
    OrderService(DiscountPolicy discountPolicy) {
        this.discountPolicy = discountPolicy;
    }
}`,q:'애플리케이션을 실행하면 OrderService에는 무엇이 주입되는가?',o:['빈을 하나로 정하지 못해 기동에 실패한다','클래스 이름 순서가 앞선 FixDiscountPolicy가 주입된다','나중에 등록된 RateDiscountPolicy가 덮어써 주입된다','두 빈을 감싼 프록시가 만들어져 번갈아 호출된다'],a:0,e:'@Autowired는 먼저 타입으로 후보를 찾고, 후보가 여럿이면 @Primary·@Qualifier·파라미터 이름으로 좁힌다. 여기서는 어느 것도 없고 파라미터 이름 discountPolicy가 두 빈 이름(fixDiscountPolicy, rateDiscountPolicy)과도 다르므로 하나로 결정하지 못해 NoUniqueBeanDefinitionException이 난다(①). 등록 순서나 이름 순서로 고르는 규칙은 없다.'},
{id:'c10',sec:'core',topic:'@Primary·@Qualifier',q:'같은 타입의 빈 A(@Primary 있음)와 B(@Primary 없음)가 있다. 주입 지점에 @Qualifier("b")를 붙이면 주입되는 것은?',o:['@Primary가 우선하므로 A가 주입된다','@Qualifier가 우선하므로 B가 주입된다','먼저 등록된 쪽의 빈이 주입된다','지정이 충돌해 기동에 실패한다'],a:1,e:'@Primary는 "별다른 지정이 없을 때의 기본값"이고 @Qualifier는 주입 지점에서 직접 지정하는 것이라 더 구체적인 @Qualifier가 이긴다(②). 그래서 기본 구현에는 @Primary를, 예외적으로 다른 구현이 필요한 곳에만 @Qualifier를 쓰는 조합이 흔하다.'},
{id:'c11',sec:'core',topic:'AOP 프록시',q:'스프링 AOP가 쓰는 두 가지 프록시 방식에 대한 설명으로 옳은 것은?',o:['JDK 동적 프록시는 클래스를 상속하고, CGLIB은 인터페이스를 구현한다','둘 다 컴파일 시점에 바이트코드를 고쳐서 부가 기능을 끼워 넣는다','JDK 동적 프록시는 인터페이스를 구현하고, CGLIB은 클래스를 상속한다','CGLIB은 final 클래스와 final 메서드에도 프록시를 적용할 수 있다'],a:2,e:'JDK 동적 프록시는 대상이 구현한 인터페이스를 구현한 프록시를, CGLIB은 대상 클래스를 상속한 프록시를 런타임에 만든다(③). 상속 기반이라 final 클래스·메서드에는 적용할 수 없으므로 ④는 틀리다. ②는 AspectJ 컴파일 타임 위빙의 설명이다.'},
{id:'c12',sec:'core',topic:'프록시 기본값',q:'Spring Boot 2.0 이상(3.x 포함)의 기본 설정에서, 인터페이스를 구현한 빈에 @Transactional 같은 AOP를 적용하면 만들어지는 프록시는?',o:['JDK 동적 프록시','CGLIB 프록시','AspectJ 컴파일 타임 위빙','AspectJ 로드 타임 위빙'],a:1,e:'Spring Boot는 spring.aop.proxy-target-class의 기본값을 true로 두므로 인터페이스 유무와 관계없이 CGLIB 프록시를 만든다(②). 순수 스프링 프레임워크의 기본 동작은 인터페이스가 있으면 JDK 동적 프록시(①)라서 자주 혼동된다. ③④는 프록시가 아닌 바이트코드 위빙 방식이다.'},
{id:'c13',sec:'core',topic:'어드바이스 종류',q:'대상 메서드를 실행할지 말지를 어드바이스가 직접 결정하고, 반환값도 다른 객체로 바꿔 돌려줄 수 있는 것은?',o:['@Before','@AfterReturning','@AfterThrowing','@Around'],a:3,e:'@Around는 ProceedingJoinPoint.proceed()를 직접 호출해야 대상 메서드가 실행되므로 호출 여부, 인자, 반환값, 예외 처리를 모두 제어할 수 있다(④). @Before는 실행을 건너뛰게 할 수 없고(예외를 던지는 것만 가능), @AfterReturning은 반환값을 볼 수는 있어도 다른 객체로 교체하지 못한다.'},
{id:'c14',sec:'core',topic:'포인트컷',code:`@Around("execution(* com.shop.service..*(..))")
public Object log(ProceedingJoinPoint pjp) throws Throwable { ... }`,q:'이 포인트컷 표현식이 가리키는 범위는?',o:['com.shop.service 패키지와 하위 패키지의 모든 메서드','com.shop.service 패키지 바로 아래 클래스의 메서드만','com.shop 아래에서 이름이 service로 시작하는 메서드','com.shop.service 안에서 인자가 하나도 없는 메서드만'],a:0,e:'첫 *는 모든 반환 타입, service 뒤의 ..은 해당 패키지와 모든 하위 패키지, 그다음 *는 모든 메서드 이름, (..)은 인자 개수·타입 무관을 뜻한다(①). ②가 되려면 com.shop.service.*.*(..)처럼 점이 하나여야 하고, ④는 인자 부분이 ()일 때다.'},
{id:'c15',sec:'core',topic:'PSA',q:'스프링의 PSA(Portable Service Abstraction)에 해당하는 예로 가장 알맞은 것은?',o:['@Aspect 클래스로 로깅 같은 횡단 관심사를 핵심 로직에서 분리한다','생성자 파라미터로 의존 객체를 컨테이너가 외부에서 주입해 준다','트랜잭션 매니저 하나로 JDBC·JPA를 똑같이 다룬다','@ComponentScan으로 패키지 아래의 빈 후보 클래스를 자동 등록한다'],a:2,e:'PSA는 기술마다 다른 API를 일관된 추상화 뒤에 숨겨, 구현 기술을 바꿔도 코드가 그대로이게 하는 것이다. JDBC든 JPA든 @Transactional과 PlatformTransactionManager로 똑같이 다루는 것이 대표적이다(③). ①은 AOP, ②는 DI, ④는 컴포넌트 스캔으로 스프링 삼각형의 다른 축이다.'},

/* ===== 웹 MVC·시큐리티 15 ===== */
{id:'w01',sec:'web',topic:'MVC 요청 흐름',q:'DispatcherServlet이 요청을 처리하면서 구성요소를 사용하는 순서로 옳은 것은?',o:['HandlerAdapter → HandlerMapping → Controller → ViewResolver','HandlerMapping → HandlerAdapter → Controller → ViewResolver','HandlerMapping → ViewResolver → HandlerAdapter → Controller','ViewResolver → HandlerMapping → Controller → HandlerAdapter'],a:1,e:'DispatcherServlet은 HandlerMapping으로 요청을 처리할 핸들러를 찾고, 그 핸들러를 실행할 수 있는 HandlerAdapter를 통해 컨트롤러를 호출한 뒤, 반환된 논리 뷰 이름을 ViewResolver로 실제 뷰로 바꿔 렌더링한다(②). @ResponseBody라면 ViewResolver 단계 없이 메시지 컨버터가 본문을 쓴다.'},
{id:'w02',sec:'web',topic:'HandlerAdapter',q:'Spring MVC에서 HandlerAdapter가 맡는 역할은?',o:['요청 URL과 HTTP 메서드에 맞는 핸들러를 찾아서 돌려준다','컨트롤러가 반환한 논리 뷰 이름을 실제 뷰 객체로 바꿔 준다','모든 요청을 가장 먼저 받아 처리 흐름 전체를 조율한다','찾아낸 핸들러를 실제로 호출하고 인자와 반환값을 처리한다'],a:3,e:'HandlerAdapter는 핸들러의 종류가 달라도 DispatcherServlet이 같은 방식으로 호출할 수 있게 해 주는 어댑터로, 인자 바인딩과 반환값 처리까지 맡는다(④). ①은 HandlerMapping, ②는 ViewResolver, ③은 DispatcherServlet(프론트 컨트롤러)의 역할이다.'},
{id:'w03',sec:'web',topic:'@Controller vs @RestController',code:`@Controller
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}`,q:'Thymeleaf가 설정된 프로젝트에서 GET /hello를 요청하면?',o:['hello라는 논리 이름의 뷰를 찾아 렌더링한다','응답 본문에 문자열 hello가 그대로 쓰인다','{"value":"hello"} 형태의 JSON이 응답된다','반환 타입이 String이라 기동 중 오류가 난다'],a:0,e:'@Controller에서 String을 반환하면 논리 뷰 이름으로 해석되어 ViewResolver가 templates/hello.html을 찾아 렌더링한다(①). ②처럼 본문에 그대로 쓰려면 메서드에 @ResponseBody를 붙이거나 클래스를 @RestController(@Controller + @ResponseBody)로 바꿔야 한다.'},
{id:'w04',sec:'web',topic:'CORS',q:'CORS에 대한 설명으로 옳은 것은?',o:['서버가 다른 출처의 요청 수신 자체를 막는 방화벽 기능이다','같은 출처로 보내는 요청에도 매번 preflight가 먼저 전송된다','브라우저가 적용하는 정책이며 서버는 허용 출처를 응답 헤더로 알린다','Postman 같은 비브라우저 클라이언트의 요청도 똑같이 차단된다'],a:2,e:'동일 출처 정책과 CORS는 브라우저가 적용한다. 서버는 Access-Control-Allow-Origin 같은 응답 헤더로 허용 출처를 알릴 뿐이고, 허용되지 않으면 브라우저가 응답을 스크립트에 넘기지 않는다(③). 그래서 Postman이나 서버 간 호출은 영향을 받지 않고(④), preflight는 교차 출처이면서 단순 요청이 아닐 때만 나간다(②).'},
{id:'w05',sec:'web',topic:'요청 바인딩',code:`@GetMapping("/users/{id}")
public String find(@PathVariable Long id,
                   @RequestParam(defaultValue = "1") int page) {
    return "id=" + id + ", page=" + page;
}`,q:'@RestController 안의 이 메서드에 GET /users/7 을 요청하면 응답 본문은?',o:['id=7, page=1','id=7, page=0','id=1, page=7','400 오류 응답'],a:0,e:'경로 변수 {id}에는 7이 @PathVariable로 바인딩되고, 쿼리 스트링에 page가 없으므로 defaultValue인 1이 쓰인다(①). defaultValue가 없고 required도 기본값(true)이었다면 파라미터 누락으로 400이 됐을 것이다(④).'},
{id:'w06',sec:'web',topic:'@RequestBody',q:'JSON 요청 본문을 자바 객체로 받을 때 쓰는 애너테이션과, 실제 변환을 수행하는 구성요소의 짝으로 옳은 것은?',o:['@ModelAttribute와 HttpMessageConverter','@RequestParam과 ViewResolver','@RequestBody와 HttpMessageConverter','@RequestBody와 ViewResolver'],a:2,e:'@RequestBody는 HTTP 본문을 HttpMessageConverter(JSON이면 Jackson 기반 컨버터)로 역직렬화한다(③). @ModelAttribute는 쿼리 파라미터나 폼 데이터를 필드에 바인딩하는 방식이라 메시지 컨버터를 쓰지 않으며, ViewResolver는 뷰 이름을 해석하는 구성요소로 요청 변환과 무관하다.'},
{id:'w07',sec:'web',topic:'필터 vs 인터셉터',q:'서블릿 필터와 스프링 인터셉터의 차이로 옳은 것은?',o:['인터셉터는 DispatcherServlet 앞에서, 필터는 컨트롤러 직전에 실행된다','필터는 DispatcherServlet 앞에서, 인터셉터는 그 뒤 컨트롤러 전후에 실행된다','필터에서 던진 예외도 @ControllerAdvice의 핸들러가 그대로 처리해 준다','인터셉터는 서블릿 스펙에 속해서 스프링 없이도 web.xml로 등록된다'],a:1,e:'필터는 서블릿 컨테이너가 관리하며 DispatcherServlet에 도달하기 전에, 인터셉터는 스프링 MVC가 관리하며 DispatcherServlet이 핸들러를 호출하기 전후에 실행된다(②). 필터는 DispatcherServlet 바깥이라 거기서 난 예외는 @ControllerAdvice가 잡지 못한다(③).'},
{id:'w08',sec:'web',topic:'필터·인터셉터·AOP 선택',q:'서비스 계층의 특정 메서드들에 대해 메서드 인자와 반환값에 접근하면서 실행 시간을 기록하려 한다. 가장 알맞은 수단은?',o:['서블릿 필터','핸들러 인터셉터','ViewResolver','AOP @Around'],a:3,e:'필터와 인터셉터는 웹 요청 단위로 동작해 HttpServletRequest/Response만 다루며, 서비스 메서드의 인자·반환값에는 접근할 수 없다. 포인트컷으로 메서드를 골라 전후를 감싸는 AOP @Around가 맞다(④). 인코딩·보안처럼 요청 전체에 걸친 일은 필터, 로그인 체크처럼 컨트롤러 단위의 일은 인터셉터가 어울린다.'},
{id:'w09',sec:'web',topic:'인터셉터 콜백',q:'컨트롤러 메서드에서 예외가 발생했을 때, HandlerInterceptor의 메서드 중 호출되지 않는 것은?',o:['preHandle','postHandle','afterCompletion','셋 다 호출된다'],a:1,e:'preHandle은 컨트롤러 호출 전에 이미 실행됐고, afterCompletion은 예외 여부와 관계없이 요청 처리가 끝나면 호출된다(예외 객체를 인자로 받는다). postHandle은 컨트롤러가 정상 반환했을 때만 불리므로 예외가 나면 건너뛴다(②).'},
{id:'w10',sec:'web',topic:'@ExceptionHandler',code:`@RestControllerAdvice
public class GlobalHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("bad");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> error(Exception e) {
        return ResponseEntity.internalServerError().body("error");
    }
}`,q:'컨트롤러에서 NumberFormatException(IllegalArgumentException의 하위 클래스)이 발생하면 응답은?',o:['400 응답, 본문 bad','500 응답, 본문 error','두 핸들러가 차례로 실행','기본 오류 페이지로 이동'],a:0,e:'여러 @ExceptionHandler가 예외와 맞으면 상속 계층에서 가장 가까운 타입의 핸들러 하나만 선택된다. NumberFormatException에는 Exception보다 IllegalArgumentException이 더 가까우므로 bad()가 실행되어 400이 응답된다(①). 핸들러가 연달아 실행되는 일은 없다(③).'},
{id:'w11',sec:'web',topic:'@Valid 검증',q:'컨트롤러의 @Valid @RequestBody 파라미터가 검증에 실패했을 때(BindingResult 파라미터 없음) 발생하는 예외는?',o:['ConstraintViolationException','HttpMessageNotReadableException','MethodArgumentNotValidException','MissingServletRequestParameterException'],a:2,e:'@RequestBody 객체의 Bean Validation이 실패하면 MethodArgumentNotValidException이 발생하고 기본적으로 400으로 응답된다(③). ②는 JSON 문법 오류 등으로 본문을 아예 읽지 못했을 때, ④는 필수 @RequestParam이 빠졌을 때, ①은 주로 JPA 엔티티 검증 등 Validator를 직접 거칠 때 나오는 예외다.'},
{id:'w12',sec:'web',topic:'Security 필터 체인',q:'Spring Security가 요청을 가로채는 구조에 대한 설명으로 옳은 것은?',o:['DispatcherServlet이 컨트롤러 호출 직전에 인터셉터로 보안 검사를 실행한다','AOP 프록시가 모든 컨트롤러 메서드를 감싸서 호출마다 보안 검사를 실행한다','ViewResolver가 뷰를 렌더링하기 직전에 사용자 권한을 검사해 차단한다','DelegatingFilterProxy가 FilterChainProxy에 위임한다'],a:3,e:'Spring Security는 서블릿 필터 기반이다. 서블릿 컨테이너에 등록된 DelegatingFilterProxy가 스프링 빈인 FilterChainProxy에 요청을 넘기고, 여기서 요청에 맞는 SecurityFilterChain의 필터들이 순서대로 실행된다(④). 즉 DispatcherServlet에 도달하기 전에 인증·인가가 처리된다. 메서드 보안(@PreAuthorize)은 AOP를 쓰지만 기본 구조는 아니다.'},
{id:'w13',sec:'web',topic:'인증 vs 인가',q:'로그인은 정상적으로 했지만 ADMIN 권한이 없는 사용자가 ADMIN 전용 API를 호출했다. 응답 상태 코드와 실패 종류는?',o:['401 Unauthorized, 인증 실패','403 Forbidden, 인가 실패','404 Not Found, 매핑 실패','400 Bad Request, 검증 실패'],a:1,e:'인증(Authentication)은 "누구인가"를, 인가(Authorization)는 "이 일을 할 권한이 있는가"를 확인한다. 신원은 확인됐으나 권한이 부족한 경우이므로 인가 실패이고 403이다(②). 401은 이름과 달리 인증되지 않았을 때(토큰 없음·만료 등) 쓰인다.'},
{id:'w14',sec:'web',topic:'JWT vs 세션',q:'세션 기반 인증과 JWT 기반 인증을 비교한 설명으로 옳은 것은?',o:['JWT는 서버에 상태를 두지 않아 확장이 쉽지만 발급한 토큰을 바로 무효화하기 어렵다','세션은 서버에 상태를 두지 않아 서버를 늘려도 세션 공유 저장소가 필요하지 않다','JWT의 페이로드는 암호화되어 있어 비밀번호 같은 민감 정보를 담아도 안전하다','세션은 서명 검증만으로 사용자를 확인하므로 서버 메모리를 전혀 쓰지 않는다'],a:0,e:'JWT는 토큰 자체에 정보와 서명이 들어 있어 서버가 상태를 저장하지 않아도 되지만, 그만큼 만료 전 강제 무효화가 어렵다(그래서 짧은 만료 시간과 리프레시 토큰, 블랙리스트를 쓴다)(①). 세션은 서버가 상태를 저장하므로 다중 서버에서는 세션 클러스터링이나 Redis가 필요하다(②④). JWT 페이로드는 Base64URL 인코딩일 뿐 암호화가 아니다(③).'},
{id:'w15',sec:'web',topic:'CSRF',q:'JWT를 Authorization 헤더에 담아 보내는 stateless REST API에서 CSRF 보호를 꺼도 되는 근거는?',o:['JWT의 서명이 요청을 보낸 출처(Origin)까지 함께 검증해 주기 때문이다','CORS 설정이 다른 사이트에서 오는 위조 요청을 서버에서 모두 막기 때문이다','쿠키와 달리 헤더의 토큰은 브라우저가 요청에 자동으로 붙이지 않기 때문이다','HTTPS를 쓰면 다른 사이트에서 만든 요청이 서버에 도달하지 못하기 때문이다'],a:2,e:'CSRF는 브라우저가 쿠키(세션 ID)를 요청에 자동으로 실어 보내는 점을 악용한다. 토큰을 스크립트가 직접 헤더에 넣는 방식이면 다른 사이트의 위조 요청에는 토큰이 실리지 않으므로 CSRF가 성립하지 않는다(③). JWT를 쿠키에 담는다면 여전히 CSRF 대책이 필요하다. CORS는 응답 읽기를 막을 뿐 요청 전송 자체를 막지 못한다(②).'},

/* ===== JPA·트랜잭션 18 ===== */
{id:'d01',sec:'data',topic:'1차 캐시',code:`// 하나의 트랜잭션 안
Member a = em.find(Member.class, 1L);
Member b = em.find(Member.class, 1L);
System.out.println(a == b);`,q:'실행되는 SELECT 횟수와 출력 결과는?',o:['SELECT 1번, true','SELECT 2번, true','SELECT 1번, false','SELECT 2번, false'],a:0,e:'첫 find()에서 DB를 조회해 엔티티를 1차 캐시에 넣고, 두 번째 find()는 같은 식별자를 1차 캐시에서 찾아 그대로 돌려준다. 그래서 SELECT는 한 번이고 같은 인스턴스라 == 비교가 true다(①). 이것이 영속성 컨텍스트가 보장하는 동일성이다.'},
{id:'d02',sec:'data',topic:'쓰기 지연·IDENTITY',q:'기본 키 생성 전략이 GenerationType.IDENTITY인 엔티티에 em.persist()를 호출하면?',o:['커밋 시점까지 INSERT가 쓰기 지연된다','flush()를 직접 호출해야만 INSERT된다','persist() 시점에 INSERT가 바로 실행된다','식별자가 없어 persist()에서 예외가 난다'],a:2,e:'영속 상태가 되려면 식별자가 있어야 하는데 IDENTITY는 DB에 INSERT해야 키가 생긴다. 그래서 이 전략에서는 쓰기 지연 없이 persist() 시점에 INSERT가 나간다(③). SEQUENCE 전략이라면 시퀀스 값만 먼저 받아 오고 INSERT는 flush까지 미뤄진다(①). 이 때문에 IDENTITY에서는 JDBC 배치 INSERT도 쓸 수 없다.'},
{id:'d03',sec:'data',topic:'더티 체킹',code:`@Transactional
public void rename(Long id, String name) {
    Member m = memberRepository.findById(id).orElseThrow();
    m.setName(name);
    // save() 호출 없음
}`,q:'이 메서드가 정상 종료되면?',o:['save()를 호출하지 않아 변경이 버려진다','커밋 직전 flush 때 UPDATE가 실행된다','setName() 호출 즉시 UPDATE가 실행된다','스냅샷이 없어 예외와 함께 롤백된다'],a:1,e:'영속 상태 엔티티는 조회 시점의 스냅샷과 함께 관리된다. 트랜잭션 커밋 직전 flush에서 현재 상태와 스냅샷을 비교해 달라진 엔티티의 UPDATE를 만들어 보낸다(②). 그래서 save()가 필요 없다. 변경 즉시 SQL이 나가는 것은 아니다(③).'},
{id:'d04',sec:'data',topic:'준영속 상태',code:`tx.begin();
Member m = em.find(Member.class, 1L);
em.detach(m);
m.setName("changed");
tx.commit();`,q:'커밋 시 어떤 SQL이 실행되는가?',o:['UPDATE가 한 번 실행된다','DELETE 후 INSERT가 실행된다','커밋 시점에 예외가 발생한다','UPDATE가 실행되지 않는다'],a:3,e:'detach()로 준영속이 된 엔티티는 영속성 컨텍스트가 더는 관리하지 않으므로 변경 감지 대상이 아니다. 필드를 바꿔도 UPDATE가 나가지 않고 예외도 없다(④). 변경을 반영하려면 merge()로 다시 영속화하거나, 영속 상태로 다시 조회해서 값을 바꿔야 한다.'},
{id:'d05',sec:'data',topic:'격리 수준',q:'@Transactional의 isolation 속성을 지정하지 않았을 때(Isolation.DEFAULT) 적용되는 격리 수준은?',o:['사용 중인 DB의 기본 격리 수준을 따른다','항상 READ COMMITTED로 고정된다','항상 REPEATABLE READ로 고정된다','격리 없이 READ UNCOMMITTED로 동작한다'],a:0,e:'Isolation.DEFAULT는 스프링이 격리 수준을 따로 설정하지 않고 DB(데이터소스)의 기본값에 맡긴다는 뜻이다(①). 그래서 MySQL InnoDB에서는 REPEATABLE READ, PostgreSQL·Oracle에서는 READ COMMITTED로 동작한다. 스프링이 특정 수준으로 고정하지 않는다.'},
{id:'d06',sec:'data',topic:'연관관계의 주인',code:`@Entity class Team {
    @OneToMany(mappedBy = "team")
    List<Member> members = new ArrayList<>();
}
@Entity class Member {
    @ManyToOne @JoinColumn(name = "TEAM_ID")
    Team team;
}

em.persist(team);
em.persist(member);
team.getMembers().add(member);   // member.setTeam(team)은 호출하지 않음
tx.commit();`,q:'커밋 후 MEMBER 테이블의 TEAM_ID 값은?',o:['TEAM_ID에 팀 id가 저장된다','TEAM_ID가 null로 저장된다','커밋 시점에 예외가 발생한다','중간 조인 테이블에 저장된다'],a:1,e:'양방향 연관관계에서 외래 키를 관리하는 주인은 mappedBy가 없는 쪽, 즉 Member.team이다. mappedBy가 붙은 Team.members는 읽기 전용이라 여기에 추가한 것은 DB에 반영되지 않아 TEAM_ID가 null로 남는다(②). 그래서 주인 쪽에 값을 넣고, 양쪽을 함께 맞추는 연관관계 편의 메서드를 둔다.'},
{id:'d07',sec:'data',topic:'기본 fetch 전략',q:'JPA 연관관계 애너테이션의 fetch 기본값으로 옳은 것은? (~ToOne은 @ManyToOne·@OneToOne, ~ToMany는 @OneToMany·@ManyToMany)',o:['네 가지 모두 기본값은 LAZY','네 가지 모두 기본값은 EAGER','~ToOne은 LAZY, ~ToMany는 EAGER','~ToOne은 EAGER, ~ToMany는 LAZY'],a:3,e:'JPA 표준에서 @ManyToOne·@OneToOne의 기본값은 EAGER, @OneToMany·@ManyToMany의 기본값은 LAZY다(④). 실무에서는 예상치 못한 쿼리를 막기 위해 ~ToOne도 모두 fetch = FetchType.LAZY로 명시하고, 함께 필요한 곳에서만 fetch join을 쓴다.'},
{id:'d08',sec:'data',topic:'지연 로딩과 프록시',q:'spring.jpa.open-in-view=false인 환경에서, 서비스(@Transactional)가 반환한 엔티티의 지연 로딩 컬렉션을 컨트롤러에서 처음 접근하면?',o:['추가 SELECT가 실행되어 컬렉션이 정상적으로 조회된다','비어 있는 컬렉션이 예외 없이 그대로 반환된다','LazyInitializationException이 발생한다','EntityNotFoundException이 대신 발생한다'],a:2,e:'OSIV를 끄면 트랜잭션이 끝날 때 영속성 컨텍스트도 닫혀 엔티티가 준영속이 된다. 초기화되지 않은 프록시·컬렉션을 그 뒤에 건드리면 LazyInitializationException이 난다(③). 서비스 안에서 fetch join으로 미리 로딩하거나 DTO로 변환해 반환해야 한다. ①은 OSIV가 켜져 있을 때의 동작이다.'},
{id:'d09',sec:'data',topic:'OSIV',q:'Spring Boot에서 OSIV(open-in-view)를 기본값(true)으로 둘 때 생기는 단점은?',o:['응답이 끝날 때까지 DB 커넥션을 쥐고 있어 커넥션이 모자랄 수 있다','컨트롤러와 뷰에서 지연 로딩을 쓸 수 없어 DTO 변환이 강제된다','트랜잭션이 요청 전체로 넓어져 컨트롤러의 변경까지 커밋된다','영속성 컨텍스트가 메서드마다 새로 만들어져 1차 캐시를 못 쓴다'],a:0,e:'OSIV는 영속성 컨텍스트를 요청 시작부터 응답 완료까지 열어 두어 컨트롤러·뷰에서도 지연 로딩이 되게 한다(②는 반대). 대신 한 번 얻은 커넥션을 응답이 끝날 때까지 반환하지 않아, 외부 API 호출 등으로 응답이 길어지면 커넥션 풀이 고갈될 수 있다(①). 트랜잭션 범위는 여전히 서비스 계층까지다(③).'},
{id:'d10',sec:'data',topic:'N+1 문제',code:`// Team.members 는 @OneToMany(fetch = LAZY), batch size 설정 없음
List<Team> teams = teamRepository.findAll();   // 팀 10개 조회
for (Team team : teams) {
    System.out.println(team.getMembers().size());
}`,q:'실행되는 SELECT는 모두 몇 번인가?',o:['1번','2번','10번','11번'],a:3,e:'findAll()로 팀 목록을 가져오는 쿼리 1번에, 팀마다 members 컬렉션을 처음 건드릴 때 초기화 쿼리가 한 번씩 나가 10번이 더해져 총 11번이다(④). 이것이 N+1 문제이며 fetch join, @EntityGraph, default_batch_fetch_size로 줄인다.'},
{id:'d11',sec:'data',topic:'N+1과 EAGER',q:'N+1을 없애려고 Team.members를 fetch = EAGER로 바꿨다. teamRepository.findAll()(JPQL "select t from Team t")을 실행하면?',o:['조인 한 번으로 모두 조회되어 N+1이 사라진다','팀마다 추가 쿼리가 즉시 나가 N+1은 그대로다','컬렉션은 EAGER로 둘 수 없어 기동에 실패한다','추가 쿼리 없이 members가 빈 컬렉션으로 온다'],a:1,e:'JPQL은 글로벌 fetch 전략을 보지 않고 쓰인 그대로 SQL로 번역된다. 팀만 조회한 뒤, EAGER 설정을 맞추려고 팀마다 members 조회가 즉시 추가로 나가므로 N+1은 그대로다(②). EAGER는 시점만 당길 뿐이고, 해결책은 fetch join·@EntityGraph·배치 사이즈다. em.find() 단건 조회일 때만 조인으로 한 번에 가져온다.'},
{id:'d12',sec:'data',topic:'fetch join과 페이징',q:'Hibernate에서 일대다 컬렉션을 fetch join한 JPQL에 페이징(Pageable, setMaxResults)을 함께 적용하면?',o:['DB의 LIMIT으로 정확히 잘려 문제없이 조회된다','쿼리 생성 단계에서 예외가 나 실행되지 않는다','전체를 읽어 와 메모리에서 페이징하고 경고를 남긴다','fetch join이 무시되어 지연 로딩으로 바뀐다'],a:2,e:'컬렉션을 조인하면 행 수가 "다" 쪽 기준으로 늘어나 DB의 LIMIT으로는 엔티티 단위 페이징을 할 수 없다. Hibernate는 조건에 맞는 전체 행을 읽어 와 메모리에서 잘라 내고 경고 로그를 남기므로 데이터가 많으면 메모리 장애로 이어진다(③). 컬렉션은 지연 로딩으로 두고 default_batch_fetch_size를 쓰거나 ~ToOne만 fetch join하는 것이 정석이다.'},
{id:'d13',sec:'data',topic:'batch size',q:'hibernate.default_batch_fetch_size=100 설정의 효과는?',o:['INSERT 문을 100개씩 모아 JDBC 배치로 한 번에 전송한다','조회 결과를 100건씩 잘라서 자동으로 페이징해 준다','1차 캐시에 보관하는 엔티티 수를 100개로 제한한다','지연 로딩 대상을 IN 절로 묶어 여러 건을 한 번에 조회한다'],a:3,e:'지연 로딩이 일어날 때 같은 종류의 프록시·컬렉션을 최대 100개까지 모아 where ... in (?, ?, ...) 한 번으로 초기화한다. 팀 10개의 members라면 N+1(11번)이 2번으로 줄어든다(④). ①은 hibernate.jdbc.batch_size의 설명으로 이름이 비슷해 자주 혼동된다.'},
{id:'d14',sec:'data',topic:'@Transactional 내부 호출',code:`@Service
public class OrderService {

    public void outer() {
        inner();              // 같은 클래스 안에서 호출
    }

    @Transactional
    public void inner() {
        orderRepository.save(new Order());   // Spring Data JPA
        throw new RuntimeException();
    }
}`,q:'다른 빈에서 orderService.outer()를 호출하면 저장한 Order는?',o:['inner()에 트랜잭션이 없어 저장이 롤백되지 않는다','inner() 진입 시 새 트랜잭션이 열려 저장이 함께 롤백된다','프록시가 내부 호출을 감지해 기동 단계에서 예외가 발생한다','outer()까지 트랜잭션이 넓어져 저장이 함께 롤백된다'],a:0,e:'@Transactional은 프록시를 통해 들어온 호출에만 적용된다. outer()에는 애너테이션이 없어 프록시가 트랜잭션 없이 실제 객체로 넘기고, 그 안의 inner()는 this를 통한 호출이라 프록시를 거치지 않는다. 결국 save()는 리포지토리 자체의 트랜잭션으로 바로 커밋되고 이후 예외가 나도 되돌려지지 않는다(①). inner()를 다른 빈으로 분리하거나 outer()에 @Transactional을 붙여야 한다.'},
{id:'d15',sec:'data',topic:'롤백 규칙',code:`@Transactional
public void pay(Order order) throws IOException {
    orderRepository.save(order);
    throw new IOException("결제 서버 응답 없음");
}`,q:'다른 빈에서 pay()를 호출했을 때의 결과는? (rollbackFor 설정 없음)',o:['저장이 롤백된 뒤 예외가 전파된다','저장이 커밋되고 예외는 삼켜진다','저장이 커밋된 뒤 예외가 전파된다','저장이 롤백되고 예외는 삼켜진다'],a:2,e:'@Transactional은 기본적으로 RuntimeException과 Error에만 롤백하고, IOException 같은 체크 예외에는 커밋한다. 따라서 저장은 커밋되고 예외는 호출자에게 그대로 전파된다(③). 체크 예외에도 롤백하려면 rollbackFor = Exception.class처럼 지정해야 한다. 스프링이 예외를 삼키는 일은 없다.'},
{id:'d16',sec:'data',topic:'전파 속성',q:'주문 처리(@Transactional)가 실패해 롤백되더라도 "실패 이력" 저장만은 커밋되어야 한다. 별도 빈에 둔 이력 저장 메서드에 줄 전파 속성은?',o:['REQUIRED','REQUIRES_NEW','SUPPORTS','MANDATORY'],a:1,e:'REQUIRES_NEW는 진행 중인 트랜잭션을 잠시 보류하고 독립된 새 트랜잭션을 시작하므로, 바깥 트랜잭션이 롤백돼도 이미 커밋된 이력은 남는다(②). 기본값 REQUIRED는 기존 트랜잭션에 참여해 함께 롤백된다. SUPPORTS는 있으면 참여, MANDATORY는 없으면 예외다. 단, 프록시를 거쳐야 하므로 같은 클래스 내부 호출이면 적용되지 않는다.'},
{id:'d17',sec:'data',topic:'readOnly',q:'JPA(Hibernate) 환경에서 @Transactional(readOnly = true)의 효과로 옳은 것은?',o:['쓰기 쿼리를 실행하는 코드가 컴파일 시점에 오류로 걸러진다','트랜잭션을 아예 시작하지 않으므로 커넥션을 쓰지 않는다','격리 수준이 자동으로 SERIALIZABLE까지 올라가 적용된다','플러시 모드가 MANUAL이 되어 변경 감지 flush를 생략한다'],a:3,e:'readOnly = true면 스프링이 Hibernate 세션의 플러시 모드를 MANUAL로 바꿔 커밋 때 flush가 일어나지 않고, 스냅샷 비교 비용이 줄어든다(④). 엔티티를 수정해도 반영되지 않는 이유다. 또 드라이버·DB에 읽기 전용 힌트가 전달되어 읽기 전용 복제본으로 라우팅하는 데 쓰이기도 한다. 트랜잭션 자체는 시작되며 격리 수준은 바뀌지 않는다.'},
{id:'d18',sec:'data',topic:'낙관적·비관적 락',q:'충돌이 드문 게시글 수정 기능에서 DB 락을 잡지 않고 "나중 저장이 앞선 수정을 덮어쓰는" 갱신 손실을 막으려 한다. 가장 알맞은 방법은?',o:['SELECT ... FOR UPDATE 비관적 락','격리 수준을 SERIALIZABLE로 상향','@Version 필드를 둔 낙관적 락','synchronized 메서드로 직렬화'],a:2,e:'낙관적 락은 @Version 컬럼을 UPDATE의 where 조건에 넣어, 그사이 다른 트랜잭션이 수정했다면 갱신 건수가 0이 되어 OptimisticLockException(스프링에서는 ObjectOptimisticLockingFailureException)으로 알려 준다. DB 락을 잡지 않아 충돌이 드문 경우에 알맞다(③). ①②는 락·대기 비용이 크고, ④는 서버가 여러 대면 소용이 없다.'},

/* ===== 스프링 부트·테스트·설계 12 ===== */
{id:'b01',sec:'boot',topic:'@SpringBootApplication',q:'@SpringBootApplication이 합쳐 놓은 세 애너테이션은?',o:['@Configuration, @EnableWebMvc, @ComponentScan','@Configuration, @EnableAutoConfiguration, @EnableJpaRepositories','@SpringBootConfiguration, @EnableAutoConfiguration, @ComponentScan','@SpringBootConfiguration, @EnableWebMvc, @EnableTransactionManagement'],a:2,e:'@SpringBootApplication은 @SpringBootConfiguration(설정 클래스 표시), @EnableAutoConfiguration(클래스패스 기반 자동 설정), @ComponentScan(현재 패키지 이하 스캔)의 조합이다(③). @EnableWebMvc나 @EnableJpaRepositories 등은 포함되지 않으며, 해당 기능은 자동 설정이 조건에 따라 켜 준다.'},
{id:'b02',sec:'boot',topic:'조건부 빈',code:`// Spring Boot 자동 설정 내부
@Bean
@ConditionalOnMissingBean
public ObjectMapper objectMapper() { ... }

// 개발자가 작성한 설정
@Configuration
class MyConfig {
    @Bean
    public ObjectMapper myObjectMapper() { ... }
}`,q:'애플리케이션을 실행하면 ObjectMapper 빈은 어떻게 되는가?',o:['개발자가 등록한 빈만 쓰이고 자동 설정 빈은 생략된다','두 빈이 모두 등록되어 주입 시 충돌 예외가 발생한다','자동 설정의 빈이 우선해서 개발자 빈을 덮어쓴다','빈의 타입이 같으므로 기동 단계에서 항상 실패한다'],a:0,e:'@ConditionalOnMissingBean은 같은 타입의 빈이 아직 없을 때만 등록하라는 조건이다. 자동 설정은 사용자 설정보다 나중에 처리되므로, 개발자가 등록한 ObjectMapper가 있으면 자동 설정 쪽은 건너뛴다(①). "기본값을 제공하되 사용자가 정의하면 물러난다"는 자동 설정의 핵심 원리다.'},
{id:'b03',sec:'boot',topic:'스타터',q:'spring-boot-starter-web 같은 "스타터"에 대한 설명으로 옳은 것은?',o:['자동 설정 클래스의 실제 구현 코드가 들어 있는 모듈이다','실행 중에 필요한 라이브러리를 내려받는 런타임 도구다','톰캣 없이 서블릿을 실행하게 해 주는 경량 컨테이너다','라이브러리를 호환 버전으로 묶은 의존성 모음이다'],a:3,e:'스타터는 특정 기능에 필요한 라이브러리들을 서로 호환되는 버전으로 묶어 둔 의존성 묶음으로, 자체 코드는 거의 없다(④). starter-web 하나로 Spring MVC, Jackson, 내장 톰캣 등이 함께 들어온다. 자동 설정의 구현은 spring-boot-autoconfigure 모듈에 있다(①).'},
{id:'b04',sec:'boot',topic:'내장 톰캣',q:'spring-boot-starter-web만 추가한 프로젝트를 빌드해 java -jar app.jar로 실행하면?',o:['외부 톰캣에 war로 배포해야만 요청을 받을 수 있다','내장 톰캣이 기본 포트 8080으로 함께 기동된다','내장 네티가 기본 포트 8080으로 함께 기동된다','서버 없이 기동되어 main 메서드가 바로 종료된다'],a:1,e:'starter-web에는 spring-boot-starter-tomcat이 포함되어 있어, 실행 가능한 jar 안의 내장 톰캣이 애플리케이션과 함께 8080 포트로 뜬다(②). 별도 WAS 설치·배포가 필요 없다는 것이 스프링 부트의 큰 특징이다. 네티는 starter-webflux의 기본 서버다(③).'},
{id:'b05',sec:'boot',topic:'외부 설정 우선순위',code:`# application.yml
server:
  port: 8080

# application-dev.yml
server:
  port: 9090

$ java -jar app.jar --spring.profiles.active=dev --server.port=7070`,q:'애플리케이션이 사용하는 포트는?',o:['7070','8080','9090','기동 실패'],a:0,e:'외부 설정은 우선순위가 높은 쪽이 낮은 쪽을 덮어쓴다. 프로파일 전용 파일(application-dev.yml)이 공통 application.yml보다 우선하고, 명령행 인자는 설정 파일보다 우선한다. 따라서 7070이 쓰인다(①). 명령행 인자가 없었다면 9090이다.'},
{id:'b06',sec:'boot',topic:'@Value vs @ConfigurationProperties',q:'@Value와 @ConfigurationProperties를 비교한 설명으로 옳은 것은?',o:['@Value는 접두어 아래의 설정 전체를 객체 하나로 묶고 느슨한 바인딩도 지원한다','@ConfigurationProperties는 SpEL 표현식을 평가해 필드 하나에만 값을 넣는다','@Value로 주입한 값은 설정 파일이 바뀌면 재시작 없이 자동으로 다시 주입된다','@ConfigurationProperties는 접두어로 묶인 설정을 타입 안전한 객체로 바인딩한다'],a:3,e:'@ConfigurationProperties는 같은 접두어의 설정을 하나의 객체로 묶어 타입 변환·검증(@Validated)·느슨한 바인딩(my-prop ↔ myProp)을 지원한다(④). @Value는 값 하나씩 주입하며 SpEL을 쓸 수 있지만 느슨한 바인딩 지원은 제한적이다. ①②는 둘의 설명이 서로 바뀌었고, ③ 같은 자동 갱신은 일어나지 않는다.'},
{id:'b07',sec:'boot',topic:'액추에이터',q:'Spring Boot 3에서 spring-boot-starter-actuator만 추가하고 아무 설정도 하지 않았을 때, HTTP(/actuator/...)로 기본 노출되는 엔드포인트는?',o:['beans','health','env','metrics'],a:1,e:'액추에이터 엔드포인트는 대부분 활성화되어 있지만, 민감한 정보가 많아 웹(HTTP)으로는 기본적으로 health만 노출된다(②). 다른 엔드포인트는 management.endpoints.web.exposure.include에 명시해야 하며, 운영에서는 노출 범위를 최소화하고 인증을 걸어야 한다.'},
{id:'b08',sec:'boot',topic:'@WebMvcTest',q:'@WebMvcTest(OrderController.class) 테스트가 "OrderService 빈을 찾을 수 없다"며 실패한다. 원인과 해결로 옳은 것은?',o:['MockMvc가 서비스 호출을 막으므로 @AutoConfigureMockMvc를 제거한다','내장 톰캣이 뜨지 않아서이므로 webEnvironment를 RANDOM_PORT로 둔다','@Service는 로드 대상이 아니므로 목(mock) 빈으로 대체해 등록한다','컴포넌트 스캔이 꺼져 있으므로 컨트롤러에 @Component를 추가한다'],a:2,e:'@WebMvcTest는 웹 계층 슬라이스 테스트라 @Controller, @ControllerAdvice, 필터, 컨버터 등만 로드하고 @Service·@Repository는 로드하지 않는다. 컨트롤러가 의존하는 서비스는 @MockitoBean(Boot 3.4 미만은 @MockBean)으로 목을 등록해 준다(③). webEnvironment는 @SpringBootTest의 속성이다(②).'},
{id:'b09',sec:'boot',topic:'@DataJpaTest',q:'@DataJpaTest에 대한 설명으로 옳은 것은?',o:['테스트마다 트랜잭션이 걸리고 끝나면 기본으로 롤백된다','@Service와 @Controller 빈까지 모두 컨텍스트에 로드된다','MockMvc가 자동 구성되어 HTTP 요청을 흉내 낼 수 있다','테스트가 끝나면 변경 내용이 기본으로 커밋되어 남는다'],a:0,e:'@DataJpaTest는 엔티티·리포지토리·JPA 관련 설정만 로드하는 슬라이스 테스트이고, @Transactional이 포함되어 있어 각 테스트가 끝나면 롤백된다(①). 기본적으로 내장 DB로 데이터소스를 교체하려 하므로 실제 DB를 쓰려면 @AutoConfigureTestDatabase(replace = NONE)을 지정한다. ②는 @SpringBootTest, ③은 @WebMvcTest의 설명이다.'},
{id:'b10',sec:'boot',topic:'@SpringBootTest',q:'웹 애플리케이션에서 속성 없이 @SpringBootTest만 붙였을 때의 기본 동작은?',o:['웹 계층의 빈만 로드하고 서비스·리포지토리는 제외한다','전체 컨텍스트를 로드하고 임의 포트로 실제 서버를 띄운다','전체 컨텍스트를 로드하되 실제 서버는 띄우지 않는다','JPA 관련 빈만 로드하고 내장 DB로 자동 교체한다'],a:2,e:'@SpringBootTest는 전체 애플리케이션 컨텍스트를 로드하는 통합 테스트이고, webEnvironment의 기본값은 MOCK이라 실제 서버 대신 모의 서블릿 환경을 만든다(③). 실제 포트로 서버를 띄우려면 RANDOM_PORT나 DEFINED_PORT를 지정해야 한다(②). ①은 @WebMvcTest, ④는 @DataJpaTest다.'},
{id:'b11',sec:'boot',topic:'스프링과 디자인 패턴',q:'주문 서비스가 ApplicationEventPublisher로 OrderCompletedEvent를 발행하고, 알림·포인트 적립 빈이 @EventListener로 이를 받아 처리한다. 이 구조가 따르는 디자인 패턴은?',o:['어댑터 패턴','옵저버 패턴','템플릿 메서드 패턴','싱글톤 패턴'],a:1,e:'발행자가 상태 변화를 알리면 등록된 구독자들이 각자 반응하는 구조로 옵저버 패턴이다(②). 주문 서비스는 누가 듣는지 몰라도 되어 결합도가 낮아진다. 스프링에서 어댑터 패턴은 HandlerAdapter, 템플릿 메서드(템플릿 콜백)는 JdbcTemplate, 싱글톤은 빈의 기본 스코프에서 볼 수 있다.'},
{id:'b12',sec:'boot',topic:'SOLID와 스프링',q:'OrderService는 DiscountPolicy 인터페이스에만 의존하고 구현체는 스프링이 주입한다. 새 할인 정책을 추가해도 OrderService 코드는 바뀌지 않는다. 이 설계가 가장 직접적으로 지키는 두 원칙은?',o:['SRP와 ISP','LSP와 ISP','SRP와 LSP','OCP와 DIP'],a:3,e:'구체 클래스가 아닌 추상화(인터페이스)에 의존하는 것이 DIP, 기존 코드를 고치지 않고 새 구현을 추가해 기능을 확장하는 것이 OCP다(④). 다형성만으로는 "누가 구현체를 고르는가" 문제가 남아 OCP·DIP가 깨지는데, 스프링의 DI 컨테이너가 그 선택을 대신해 주어 두 원칙을 지킬 수 있게 한다.'},
];
