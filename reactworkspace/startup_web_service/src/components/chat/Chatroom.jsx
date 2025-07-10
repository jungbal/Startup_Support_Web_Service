import React, { useState, useEffect, useRef } from 'react';
//import ChatMessage from './ChatMessage';
import { connectStomp, disconnectStomp, subscribeToDestination, publishMessage } from '../common/stompClient.js';
import createInstance from '../../api/Interceptor.js';

// 환경변수 파일에 저장된 서버 URL 읽어오기
const serverUrl = import.meta.env.VITE_BACK_SERVER;

// axios 인스턴스 생성 (컴포넌트 외부에서 한 번만 생성하여 재사용)
const axiosInstance = createInstance();

/**
 * 특정 채팅방의 메시지를 보여주고, 메시지 전송 기능을 제공하는 핵심 컴포넌트입니다.
 * @param {Object} currentChatRoom - 현재 선택된 채팅방 정보 객체
 * @param {string} currentUserId - 현재 로그인한 사용자의 ID
 * @param {Function} onBackToList - 채팅방 목록으로 돌아갈 때 호출될 콜백 함수
 */
export default function Chatroom({ currentChatRoom, currentUserId, onBackToList }) {
    const [messages, setMessages] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const messagesEndRef = useRef(null); // 메시지 스크롤을 위한 ref

    // 채팅방 입장/변경 시 초기 데이터 로딩 및 WebSocket 연결/구독
    useEffect(function() { // 일반 함수 사용
        if (!currentChatRoom || !currentChatRoom.chatId) return;

        /**
         * 이전 메시지 내역을 백엔드에서 불러오는 함수
         */
        async function loadChatHistory() { // 일반 함수 사용
            try {
                // axios 대신 axiosInstance 사용
                const response = await axiosInstance.get(`${serverUrl}/chat/room/${currentChatRoom.chatId}/messages`); // serverUrl 사용
                setMessages(response.data);
            } catch (error) {
                console.error("이전 메시지 불러오기 실패:", error);
                // 에러 처리 로직 (axiosInstance 인터셉터에서 이미 처리될 수 있음)
            }
        }

        // WebSocket 연결 및 구독
        connectStomp(
            function() { // 연결 성공 콜백 (일반 함수 사용)
                console.log(`STOMP Connected for room: ${currentChatRoom.chatId}`);
                subscribeToDestination(`/sub/chat/room/${currentChatRoom.chatId}`, function(message) { // 메시지 수신 콜백 (일반 함수 사용)
                    console.log("새 메시지 수신:", message);
                    setMessages(function(prevMessages) { return [...prevMessages, message]; });
                });
            },
            function(error) { // 연결 실패 콜백 (일반 함수 사용)
                console.error("WebSocket 연결 실패:", error);
            }
        );

        loadChatHistory(); // 채팅방 입장 시 이전 메시지 로드

        // 컴포넌트 언마운트 시 또는 채팅방 변경 시 WebSocket 연결 해제
        return function() { // 일반 함수 사용
            disconnectStomp();
            console.log(`STOMP Disconnected from room: ${currentChatRoom.chatId}`);
        };
    }, [currentChatRoom, currentUserId]); // currentChatRoom 또는 currentUserId 변경 시 재실행

    // 메시지가 추가될 때마다 스크롤을 가장 아래로 이동
    useEffect(function() { // 일반 함수 사용
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleSendMessage() { // 일반 함수 사용
        if (newMessageContent.trim() === '') return;

        const messageToSend = {
            chatId: currentChatRoom.chatId,
            userId: currentUserId,
            messageContent: newMessageContent.trim(),
        };

        publishMessage('/pub/chat/message', messageToSend);
        setNewMessageContent('');
    }

    if (!currentChatRoom) {
        return (
            <div style={styles.roomContainer}>
                <h3>채팅방을 선택해주세요.</h3>
            </div>
        );
    }

    return (
        <div style={styles.roomContainer}>
            <div style={styles.roomHeader}>
                <button onClick={onBackToList} style={styles.backButton}>&larr; 뒤로</button>
                <h3 style={styles.roomTitle}>
                    {currentChatRoom.chatUser1 === currentUserId ? currentChatRoom.chatUser2 : currentChatRoom.chatUser1}
                </h3>
            </div>
            <div style={styles.messagesContainer}>
                {messages.map(function(msg, index) { // 일반 함수 사용
                    /*
                    return <ChatMessage key={index} message={msg} currentUserId={currentUserId} />;
                    */
                })}
                <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessageContent}
                    onChange={function(e) { setNewMessageContent(e.target.value); }} // 일반 함수 사용
                    onKeyPress={function(e) { // 일반 함수 사용
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                    placeholder="메시지 입력..."
                    style={styles.messageInput}
                />
                <button onClick={handleSendMessage} style={styles.sendButton}>전송</button>
            </div>
        </div>
    );
}



const styles = {
    roomContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #ddd',
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    roomHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    backButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5em',
        cursor: 'pointer',
        marginRight: '15px',
        color: '#555'
    },
    roomTitle: {
        margin: 0,
        fontSize: '1.2em',
        color: '#333'
    },
    messagesContainer: {
        flexGrow: 1,
        padding: '15px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    inputContainer: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #eee',
        backgroundColor: '#fff',
    },
    messageInput: {
        flexGrow: 1,
        padding: '10px 15px',
        border: '1px solid #ddd',
        borderRadius: '20px',
        outline: 'none',
        fontSize: '1em'
    },
    sendButton: {
        marginLeft: '10px',
        padding: '10px 20px',
        backgroundColor: '#ff8c00',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease'
    },
    sendButtonHover: {
        backgroundColor: '#e67e22',
    }
};

