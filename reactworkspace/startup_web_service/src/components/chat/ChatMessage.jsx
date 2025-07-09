import React from 'react';

/**
 * 개별 채팅 메시지를 표시하는 컴포넌트입니다.
 * 메시지 발신자와 수신자에 따라 스타일을 다르게 적용합니다.
 * @param {Object} message - 표시할 메시지 객체
 * @param {string} currentUserId - 현재 로그인한 사용자의 ID
 */
export default function ChatMessage({ message, currentUserId }) {
    // 메시지를 보낸 사람이 현재 로그인한 사용자인지 확인
    const isMyMessage = message.userId === currentUserId;

    // 메시지 전송 시간을 HH:MM 형식으로 포맷
    // 백엔드에서 전달되는 message.timestamp가 Date 객체 또는 ISO 문자열이라고 가정합니다.
    const messageTime = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div style={isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer}>
            {!isMyMessage && ( // 내 메시지가 아닐 경우에만 발신자 ID 표시
                <div style={styles.senderId}>{message.userId}</div>
            )}
            <div style={isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble}>
                <p style={styles.messageContent}>{message.messageContent}</p>
                <span style={styles.messageTime}>{messageTime}</span>
            </div>
        </div>
    );
}

// 컴포넌트 스타일 (CSS in JS)
const styles = {
    // 메시지 컨테이너 (정렬을 위해 flexbox 사용)
    myMessageContainer: {
        display: 'flex',
        justifyContent: 'flex-end', // 내 메시지는 오른쪽 정렬
        marginBottom: '10px',
    },
    otherMessageContainer: {
        display: 'flex',
        justifyContent: 'flex-start', // 상대방 메시지는 왼쪽 정렬
        marginBottom: '10px',
    },

    // 발신자 ID (상대방 메시지에만 표시)
    senderId: {
        fontSize: '0.8em',
        color: '#777',
        alignSelf: 'flex-end', // 메시지 버블 아래에 정렬
        marginRight: '5px',
    },

    // 메시지 버블 공통 스타일
    messageBubble: {
        maxWidth: '70%', // 메시지 버블의 최대 너비
        padding: '10px 15px',
        borderRadius: '18px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
    },


    // 메시지 내용 스타일
    messageContent: {
        margin: 0,
        fontSize: '0.95em',
        wordBreak: 'break-word', // 긴 단어 줄 바꿈
    },

    // 메시지 시간 스타일
    messageTime: {
        fontSize: '0.7em',
        color: '#888',
        alignSelf: 'flex-end', // 메시지 버블 내에서 오른쪽 하단 정렬
        marginTop: '5px',
    },
};

