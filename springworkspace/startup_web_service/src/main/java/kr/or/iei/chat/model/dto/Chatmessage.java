package kr.or.iei.chat.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Chatmessage {
	private int messageId;			//메시지 고유번호
	private int chatId;				//채팅방 고유번호
	private String userId;			//메시지 보낸 유저 ID
	private String messageContent;	//메시지 내용
	private String sendAt;			//전송 시간
	private String messageState;	//메세지 상태 (send/read)
}
