package kr.or.iei.chat.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Chatroom {
	private int chatId;			//채팅방 고유 번호
	private String chatUser1;	//채팅하고있는 유저ID 1
	private String chatUser2;	//채팅하고있는 유저ID 2
	private String lastMessage;	//마지막 메시지 보낸 시간
}
