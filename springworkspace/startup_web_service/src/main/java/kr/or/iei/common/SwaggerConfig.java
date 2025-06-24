package kr.or.iei.common;

import java.util.HashSet;
import java.util.Set;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

/**
 * Swagger API 문서 설정 클래스
 * - API 문서 자동 생성 설정
 * - Swagger UI에서 API를 테스트할 수 있도록 설정
 */
@Configuration  // 이 클래스가 설정 클래스임을 Spring에게 알림
public class SwaggerConfig {

//    @Bean
//    public OpenAPI openAPI() {
//        Info info = new Info()
//                .title("스타트업 지원 웹 서비스 API")
//                .description("창업 지원 웹 서비스 회원 관리 REST API 문서")
//                .version("v1.0.0")
//                .contact(new Contact()
//                        .name("개발팀")
//                        .email("support@startup.com")
//                );
//
//        // JWT를 위한 SecurityScheme 설정
//        String jwtSchemeName = "bearerAuth";
//        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
//        Components components = new Components()
//                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
//                        .name(jwtSchemeName)
//                        .type(SecurityScheme.Type.HTTP)
//                        .scheme("bearer")
//                        .bearerFormat("JWT"));
//
//        return new OpenAPI()
//                .info(info)
//                .addSecurityItem(securityRequirement)
//                .components(components);
//    }
    
    /**
     * Swagger API 정보 설정
     * - API 문서의 제목, 설명 등을 설정
     * @return API 정보 객체
     */
    private ApiInfo swaggerInfo() {
        // API 문서의 제목과 설명을 설정
        return new ApiInfoBuilder()
                .title("스타트업 지원 웹 서비스 API")  // API 문서 제목
                .description("스타트업 지원 웹 서비스 회원 관리 기능 CRUD 문서")  // API 문서 설명
                .build();  // API 정보 객체 생성
    }
    
    /**
     * API 테스트 시 허용할 요청 형식 설정
     * - Swagger UI에서 API를 테스트할 때 어떤 형식의 데이터를 보낼 수 있는지 설정
     * @return 허용할 요청 형식들의 집합
     */
    private Set<String> getConsumeContentType(){
        Set<String> consumes = new HashSet<String>();  // 허용할 요청 형식들을 저장할 집합
        
        // Swagger UI에서 테스트 요청 시 허용할 데이터 형식들
        consumes.add("application/json; charset=utf-8");  // JSON 형식 허용
        consumes.add("application/x-www-form-urlencoded");  // 폼 데이터 형식 허용
        
        return consumes;  // 설정된 요청 형식들 반환
    }
    
    /**
     * API 테스트 시 응답 형식 설정
     * - Swagger UI에서 API 응답을 어떤 형식으로 받을 수 있는지 설정
     * @return 허용할 응답 형식들의 집합
     */
    private Set<String> getProduceContentType(){
        Set<String> produces = new HashSet<String>();  // 허용할 응답 형식들을 저장할 집합
        
        // Swagger UI에서 테스트 응답 시 허용할 데이터 형식들
        produces.add("application/json; charset=utf-8");  // JSON 형식 허용
        produces.add("plain/text; charset=utf-8");  // 텍스트 형식 허용
        
        return produces;  // 설정된 응답 형식들 반환
    }
    
    /**
     * Swagger API 문서 객체 생성
     * - API 문서의 전체 설정을 담당
     * - 어떤 API들을 문서에 포함시킬지, 어떤 형식으로 테스트할지 설정
     * @return Swagger 문서 객체
     */
    @Bean  // 이 메소드가 Spring Bean으로 등록됨을 의미
    public Docket swaggerApi() {
        return new Docket(DocumentationType.SWAGGER_2)  // Swagger 2.0 버전 사용
                .consumes(getConsumeContentType())  // 요청 형식 설정
                .produces(getProduceContentType())  // 응답 형식 설정
                .apiInfo(swaggerInfo()).select()  // API 정보 설정 후 API 선택 시작
                .apis(RequestHandlerSelectors.basePackage("kr.or.iei"))  // 문서로 만들 API들이 존재하는 패키지 지정
                .paths(PathSelectors.any())  // 모든 URL 패턴을 문서에 포함
                .build()  // 최종적으로 Swagger 문서 객체 생성
                .useDefaultResponseMessages(false);  // Swagger 기본 응답 메시지 비활성화 (커스텀 응답 사용)
    }
} 