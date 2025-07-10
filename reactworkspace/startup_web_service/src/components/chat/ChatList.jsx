import React, { useState, useEffect } from 'react';
import createInstance from '../../api/Interceptor';

// 백엔드 REST API 기본 URL
//const BACKEND_API_BASE_URL = 'http://localhost:9999/chat';

export default function ChatList({currentUserId, onSelectChatRoom}){

    const axiosInstance=createInstance();
    const serverUrl = import.meta.env.VITE_BACK_SERVER;

    // 채팅방 목록을 저장할 상태 변수
    const [chatRooms, setChatRooms] = useState([]);
    // 데이터 로딩 중임을 나타내는 상태 변수
    const [loading, setLoading] = useState(true);
    // 에러 발생 시 메시지를 저장할 상태 변수
    const [error, setError] = useState(null);

    // 컴포넌트가 마운트되거나 currentUserId가 변경될 때 채팅방 목록을 불러옵니다.
    useEffect(function() { 
        /**
         * 백엔드에서 채팅방 목록을 비동기로 불러오는 함수
         */
        async function fetchChatRooms() { 
            setLoading(true); // 로딩 시작
            setError(null); // 에러 초기화

            try {
                // 사용자 ID로 채팅방 목록 조회 ex) GET /chat/rooms?userId=user1
                // axios.get(url, config)는 GET 요청을 보내기 위한 메소드
                // url : API의 URL
                // config(선택 사항임) : 요청의 설정(옵션)을 포함하는 객체. 헤더나 파라미터 등 설정
                const response = await axiosInstance.get(`${serverUrl}/chat/rooms`, {
                    params: { userId: currentUserId } //쿼리 파라미터 ?userId=user1 추가
                });
                console.log(response.data);
                setChatRooms(response.data); // 불러온 데이터를 상태에 저장
            } catch (err) {
                console.error("채팅방 목록 불러오기 실패:", err);
                setError("채팅방 목록을 불러오지 못했습니다. 서버 상태를 확인해주세요.");
            } finally {
                setLoading(false); // 로딩 종료
            }
        }

        // currentUserId가 유효할 때만 함수를 실행합니다.
        if (currentUserId) {
            fetchChatRooms();
        }

    }, [currentUserId]); // currentUserId가 변경될 때마다 이 이펙트를 다시 실행

    // 로딩 중일 때 표시할 UI
    if (loading) {
        return (
            <div style={styles.listContainer}>
                <h2 style={styles.listHeader}>내 채팅</h2>
                <div style={styles.statusMessage}>채팅방 목록을 불러오는 중...</div>
            </div>
        );
    }

    // 에러가 발생했을 때 표시할 UI
    if (error) {
        return (
            <div>
                <h2 style={styles.listHeader}>내 채팅</h2>
                <div style={styles.statusMessage}>
                    <p style={{ color: 'red' }}>{error}</p>
                </div>
            </div>
        );
    }

    // 실제 채팅방 목록을 렌더링하는 부분
    return (
        <div style={styles.listContainer}>
            <h2 style={styles.listHeader}>내 채팅</h2>
            {chatRooms.length === 0 ? (
                <div style={styles.statusMessage}>아직 참여 중인 채팅방이 없습니다.</div>
            ) : (
                <ul style={styles.roomList}>
                    {chatRooms.map(function(room) { 
                        // 대화 상대방 ID 결정
                        const partnerId = room.chatUser1 === currentUserId ? room.chatUser2 : room.chatUser1;

                        // 마지막 메시지 내용 처리 (최대 50자 제한)
                        const displayLastMessage = room.lastMessageContent
                            ? (room.lastMessageContent.length > 50
                                ? room.lastMessageContent.substring(0, 47) + '...'
                                : room.lastMessageContent)
                            : '새로운 메시지가 없습니다.';

                        // 마지막 메시지 전송 시간 포맷 (HH:MM)
                        const displayTime = room.lastMessage
                            ? new Date(room.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''; // 메시지가 없으면 시간도 표시 안함

                        return (
                            <li key={room.chatId} style={styles.roomItem} onClick={function() { onSelectChatRoom(room); }}>
                                <div style={styles.roomInfo}>
                                    <div style={styles.roomPartnerName}>{partnerId}</div>
                                    <div style={styles.roomLastMessageTime}>{displayTime}</div>
                                </div>
                                <div style={styles.roomLastMessageContent}>{displayLastMessage}</div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

const styles = {
    listContainer: {
        width: '350px',
        borderRight: '1px solid #ddd',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    listHeader: {
        padding: '15px',
        margin: 0,
        fontSize: '1.5em',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f5f5f5',
        color: '#333'
    },
    statusMessage: {
        textAlign: 'center',
        padding: '20px',
        color: '#666'
    },
    roomList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        flexGrow: 1,
        overflowY: 'auto'
    },
    roomItem: {
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
    },
    roomInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
    },
    roomPartnerName: {
        fontWeight: 'bold',
        fontSize: '1.1em',
        color: '#333'
    },
    roomLastMessageTime: {
        fontSize: '0.8em',
        color: '#888'
    },
    roomLastMessageContent: {
        fontSize: '0.9em',
        color: '#666',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};