
import React, { useState } from 'react';
// import axios from 'axios'; // axios 대신 createInstance 임포트
import ChatList from './ChatList';
import Chatroom from './Chatroom';
import createInstance from '../../api/Interceptor';

const serverUrl = import.meta.env.VITE_BACK_SERVER;
const axiosInstance = createInstance();

export default function ChatPage() {
    // 실제 로그인된 사용자 ID
    const {loginMember}=useAuthStore();
    const userId=loginMember.userId;
    console.log(userId);
    const [currentUserId, setCurrentUserId] = useState(userId);

    // 현재 선택된 채팅방 정보를 저장할 상태
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);

    // 다른 사용자와 1대1 채팅을 시작하거나 기존 채팅방을 여는 함수
    async function handleOpenOrCreateChatRoom(targetUserId) { // 일반 함수 사용
        if (!currentUserId || !targetUserId) {
            alert('사용자 ID가 필요합니다.'); // 실제로는 Swal.fire 사용 권장
            return;
        }

        try {
            const response = await axiosInstance.post(`${serverUrl}/chat/room/findOrCreate`, null, { // serverUrl 사용
                params: {
                    user1Id: currentUserId,
                    user2Id: targetUserId
                }
            });
            setSelectedChatRoom(response.data); // 선택된 채팅방 업데이트
            console.log("채팅방 선택/생성:", response.data);
        } catch (error) {
            console.error("채팅방 조회/생성 실패:", error);
            // 에러 처리 로직 (axiosInstance 인터셉터에서 이미 처리될 수 있음)
            // alert("채팅방을 열 수 없습니다."); // 인터셉터에서 Swal.fire 사용 시 중복될 수 있음
        }
    }

    // ChatList에서 채팅방을 클릭했을 때 호출될 함수
    function handleSelectChatRoom(room) { // 일반 함수 사용
        setSelectedChatRoom(room);
    }

    // ChatRoom에서 "뒤로" 버튼을 눌렀을 때 호출될 함수
    function handleBackToList() { // 일반 함수 사용
        setSelectedChatRoom(null);
    }

    return (
        <div style={appStyles.container}>
            {/* 임시 사용자 전환 및 채팅방 열기 버튼 (테스트용) */}
            <div style={appStyles.tempButtons}>
                <button onClick={function() { setCurrentUserId('user1'); }}>User1로 설정</button>
                <button onClick={function() { setCurrentUserId('user2'); }}>User2로 설정</button>
                <button onClick={function() { setCurrentUserId('user3'); }}>User3로 설정</button>
                <button onClick={function() { handleOpenOrCreateChatRoom('user2'); }}>User1이 User2와 채팅 시작</button>
                <button onClick={function() { handleOpenOrCreateChatRoom('user1'); }}>User2가 User1와 채팅 시작</button>
                <p>현재 로그인 사용자: <strong>{currentUserId}</strong></p>
            </div>

            <div style={appStyles.chatLayout}>
                {/* 왼쪽 영역: 채팅방 목록 */}
                <ChatList currentUserId={currentUserId} onSelectChatRoom={handleSelectChatRoom} />

                {/* 오른쪽 영역: 선택된 채팅방 또는 안내 메시지 */}
                {/* 
                <Chatroom
                    currentChatRoom={selectedChatRoom}
                    currentUserId={currentUserId}
                    onBackToList={handleBackToList}
                />
                */}
            </div>
        </div>
    );
}

const appStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
        boxSizing: 'border-box',
    },
    tempButtons: {
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexWrap: 'wrap'
    },
    chatLayout: {
        display: 'flex',
        height: 'calc(100% - 70px)',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }
};

