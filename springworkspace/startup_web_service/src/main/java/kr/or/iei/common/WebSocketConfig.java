package kr.or.iei.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration //이 클래스가 Spring 설정 클래스임을 명시 //이 어노테이션이 작성된 클래스는 Ioc 컨테이너가 초기화될 때 실행
@EnableWebSocketMessageBroker // WebSocket 메시지 브로커 기능을 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
	
	/**
    * 메시지 브로커를 구성합니다.
    * 클라이언트가 메시지를 발행하고 구독하는 방법을 정의합니다.
    * @param config MessageBrokerRegistry 객체
    */
	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// "/sub"으로 시작하는 경로로 들어오는 메시지를 구독(Subscribe)하도록 Simple In-memory 브로커를 활성화
		// 구독(Subscribe) : 특정 주제(Topic)나 목적지(Destination)로 전송되는 메시지를 받겠다고 등록하는 행위)
        // 클라이언트는 이 경로로 메시지를 받기 위해 구독 (예: /sub/chat/room/123)
		config.enableSimpleBroker("/sub");

        // "/pub"으로 시작하는 메시지는 "@MessageMapping" 어노테이션이 달린 컨트롤러 메서드로 라우팅됩니다.
        // 클라이언트는 이 경로로 메시지를 발행(Publish)합니다. (예: /pub/chat/message)
        config.setApplicationDestinationPrefixes("/pub");
	}
	
	/**
     * STOMP WebSocket 엔드포인트를 등록합니다.
     * 클라이언트가 WebSocket 연결을 시작할 때 사용하는 URL을 정의합니다.
     * @param registry StompEndpointRegistry 객체
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // "/ws-stomp" 엔드포인트를 등록합니다.
    	// 엔드포인트 : 클라이언트가 서버와 통신을 시작하기 위해 접속하는 특정 네트워크 주소(URL)입니다.
        // 클라이언트는 이 경로를 통해 WebSocket 연결을 시도합니다. (예: ws://localhost:8080/ws-stomp)
        registry.addEndpoint("/ws-stomp")
                // SockJS를 활성화하여 WebSocket을 지원하지 않는 브라우저에서도 폴백 옵션(HTTP 폴링 등)을 제공합니다.
                .withSockJS(); 
        
        // (선택 사항) 개발 환경에서만 CORS 허용:
        // .setAllowedOriginPatterns("*"); // 모든 Origin 허용. 실제 서비스에서는 특정 도메인만 허용
        // SecurityConfig에서 CORS를 이미 다루고 있으므로 여기서는 불필요할 수 있습니다.
        // 하지만 SockJS 연결에 문제가 발생한다면 여기에 추가적으로 allowedOriginPatterns를 지정해볼 수 있습니다.
    }
	
	
	
}
