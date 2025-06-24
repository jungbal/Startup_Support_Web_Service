package kr.or.iei.common;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import kr.or.iei.common.filter.EncodingFilter;

import jakarta.servlet.Filter;

@Configuration //이 어노테이션이 작성된 클래스는 Ioc 컨테이너가 초기화될 때 실행
public class WebConfig implements WebMvcConfigurer { //이 클래스는 Spring MVC 관련 설정을 커스터마이징 할 때 작성
	
	//필터 등록
	@Bean
	public FilterRegistrationBean<Filter> endodingFilter(){
		FilterRegistrationBean<Filter> filterReg=new FilterRegistrationBean<>();
		filterReg.setFilter(new EncodingFilter());//등록할 필터 클래스 객체 
		filterReg.setOrder(1);					  //필터 동작 순서(숫자가 낮을수록 우선순위가 높다)
		filterReg.addUrlPatterns("/*");			  //필터를 적용할 url패턴(인코딩은 모든 요청에 대해 처리)	
		return filterReg;
	}
	
	//패스워드 암호화 객체 등록
	@Bean
	public BCryptPasswordEncoder bcrypt() {
		return new BCryptPasswordEncoder();
	}
	
	//CORS 설정
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
			.allowedOrigins("*")
			.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
			.allowedHeaders("*")
			.allowCredentials(false);
	}
}
