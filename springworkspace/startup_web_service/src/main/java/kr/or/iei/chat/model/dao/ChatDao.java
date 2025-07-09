package kr.or.iei.chat.model.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.chat.model.dto.Chatmessage;
import kr.or.iei.chat.model.dto.Chatroom;

@Mapper
public interface ChatDao {

	int insertChatMessage(Chatmessage message);

	ArrayList<Chatmessage> selectChatMessagesByRoomId(int chatId);

	Chatroom selectChatRoomByUsers(String user1Id, String user2Id);

	int insertChatRoom(Chatroom chatRoom);

	ArrayList<Chatroom> selectChatRoomsByUserId(String userId);


}
