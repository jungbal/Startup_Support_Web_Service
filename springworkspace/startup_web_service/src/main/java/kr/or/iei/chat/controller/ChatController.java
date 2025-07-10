package kr.or.iei.chat.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.or.iei.chat.model.dto.Chatmessage;
import kr.or.iei.chat.model.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * STOMP WebSocket 메시지를 처리하는 컨트롤러
 * 클라이언트의 메시지 발행(Publish)을 받아 처리하고, 구독자들에게 메시지를 전송합니다.
 */
@Slf4j // Lombok을 사용하여 log 객체 자동 생성
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성 (의존성 주입용) //이거 쓰면 @Autowired 하나하나 선언 안해도 됨
@Controller // Spring MVC 컨트롤러임을 명시 (WebSocket 메시징에도 사용) //restcontroller못씀
@RequestMapping("/chat")
public class ChatController {

    // SimpMessageSendingOperations: STOMP 메시지 브로커를 통해 메시지를 전송하는 데 사용됩니다.
    // 특정 구독 경로로 메시지를 보낼 수 있습니다.
    private final SimpMessageSendingOperations messagingTemplate;
    
    // ChatService: 채팅 관련 비즈니스 로직을 처리하는 서비스 계층
    private final ChatService service;

    /**
     * 클라이언트가 "/pub/chat/message" 경로로 메시지를 발행(Publish)할 때 호출됩니다.
     * @param message 클라이언트로부터 전송된 ChatMessage 객체 (JSON 형태로 전송됨)
     */
    @MessageMapping("/message") // 클라이언트가 "/pub/chat/message"로 메시지를 보낼 때 매핑
    public Chatmessage chatMessage(Chatmessage message) {
        log.info("수신된 채팅 메시지: {}", message); // 수신된 메시지 로그 출력

        // 1. 메시지 상태 설정 (예: 초기에는 'send' 상태)
        // message.setMessageState("send"); // DB 트리거에서 send_at과 message_state를 처리하므로 여기서는 필수는 아님

        // 2. 메시지를 데이터베이스에 저장
        // 이 로직은 ChatService에서 처리합니다.
        service.saveChatMessage(message);

        // 3. 메시지를 해당 채팅방의 모든 구독자에게 전송
        // "/sub/chat/room/{chatId}" 경로를 구독하고 있는 클라이언트들에게 메시지를 보냅니다.
        // 클라이언트들은 이 메시지를 받아 UI를 업데이트합니다.
        messagingTemplate.convertAndSend("/sub/chat/room/" + message.getChatId(), message);
        log.info("메시지 전송 완료: 채팅방 ID = {}, 내용 = {}", message.getChatId(), message.getMessageContent());
        
        System.out.println("Received message: " + message);
        return message;
    }

    // TODO: 채팅방 생성/조회 관련 REST API (일반 HTTP 요청)도 필요할 수 있습니다.
    // 예를 들어, @GetMapping("/chat/rooms/{userId}") 또는 @PostMapping("/chat/room/create") 
    // 이는 @RestController를 사용하는 별도의 컨트롤러에서 할 수도 있다.
    
    
    // 채팅 리스트 반환
    @CrossOrigin("*")  //HTTP 요청(get,post)에 대한 CORS 설정 //모든 도메인에서의 접근 허용
    @GetMapping("/{id}")
    public ResponseEntity<List<Chatmessage>> getChatMessages(@PathVariable String id){
    	//임시로 리스트 형식으로 구현, 실제론 DB 접근 필요
        Chatmessage test = new Chatmessage(1,1, "testId1", "testId2","20250709","send");
        return ResponseEntity.ok().body(List.of(test));
    }
}
