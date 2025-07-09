package kr.or.iei.chat.model.service;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.or.iei.chat.model.dao.ChatDao;
import kr.or.iei.chat.model.dto.Chatmessage;
import kr.or.iei.chat.model.dto.Chatroom;

@Service
public class ChatService {
	
	@Autowired
	private ChatDao dao;
	
	/*
	 * 새로운 채팅 메시지를 데이터베이스에 저장
	 * @param message 저장할 ChatMessage 객체
	 * @return 저장 성공 여부 (1: 성공, 0: 실패)
    */
	@Transactional
	public int saveChatMessage(Chatmessage message) {
		// message_id는 DB 트리거에서 자동 생성되므로, 여기서는 content, senderId, chatId 등만 넘겨줍니다.
		int result = dao.insertChatMessage(message);
        // DB 트리거가 last_message를 갱신하므로, 별도의 UPDATE 로직은 필요 없을 수 있습니다.
        // 만약 트리거가 없다면 여기서 chatDao.updateChatRoomLastMessage(message.getChatId(), message.getSendAt()); 등을 호출해야 합니다.
        return result;
		
	}
	
	/*
	 * 특정 채팅방의 모든 메시지를 불러옵니다.
	 * @param chatId 메시지를 불러올 채팅방 ID
	 * @return 해당 채팅방의 메시지 목록
	 */
    public ArrayList<Chatmessage> getChatMessagesByRoomId(int chatId) {
        return dao.selectChatMessagesByRoomId(chatId);
    }
    
    /*
     * 두 사용자 간의 채팅방을 조회하거나, 없으면 새로 생성합니다.
     * @param user1Id 사용자 1 ID
     * @param user2Id 사용자 2 ID
     * @return 조회되거나 생성된 ChatRoom 객체
     */
    @Transactional
    public Chatroom getOrCreateChatRoom(String user1Id, String user2Id) {
        // 1. 기존 채팅방 조회 (user1, user2 순서에 상관없이 조회)
        Chatroom chatRoom = dao.selectChatRoomByUsers(user1Id, user2Id);
        if (chatRoom == null) {
            chatRoom = dao.selectChatRoomByUsers(user2Id, user1Id); // 순서 바꿔서 다시 조회
        }

        // 2. 채팅방이 없으면 새로 생성
        if (chatRoom == null) {
            chatRoom = new Chatroom();
            chatRoom.setChatUser1(user1Id);
            chatRoom.setChatUser2(user2Id);
            // lastMessage는 메시지 전송 시 트리거로 갱신되므로 초기값은 null 또는 현재 시간
            dao.insertChatRoom(chatRoom); // chat_id는 트리거로 자동 생성 후 DTO에 다시 설정될 수 있음
        }
        return chatRoom;
    }

    /*
     * 특정 사용자가 참여하고 있는 모든 채팅방 목록을 조회합니다.
     * @param userId 채팅방을 조회할 사용자 ID
     * @return 해당 사용자의 채팅방 목록
     */
    public ArrayList<Chatroom> getChatRoomsByUserId(String userId) {
        return dao.selectChatRoomsByUserId(userId);
    }

    // TODO: 메시지 읽음 처리, 채팅방 나가기 등 추가적인 비즈니스 로직 구현
    
    
    

}
