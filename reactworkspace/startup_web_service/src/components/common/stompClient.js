
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// STOMP 클라이언트 인스턴스를 저장할 변수
let stompClient = null;

// 백엔드 포트번호 + WebSocket 엔드포인트 URL
const WEBSOCKET_URL =import.meta.env.VITE_BACK_SERVER + '/ws-stomp';

/**
 * STOMP WebSocket 서버에 연결
 * @param {Function} onConnected - 연결 성공 시 호출될 콜백 함수
 * @param {Function} onError - 연결 실패 시 호출될 콜백 함수
 */
export const connectStomp = function(onConnected, onError) { 
    // 1. 이미 연결되어 있는지 확인
    if (stompClient && stompClient.connected) {
        // stompClient 변수에 클라이언트 객체가 있고, 그 객체가 이미 연결된 상태라면
        console.log("STOMP client already connected.");
        if (onConnected) onConnected(); // 연결 성공 콜백 함수가 있으면 즉시 호출
        return;
    }

    // 2. SockJS를 사용하여 WebSocket 연결 객체 생성 (폴백 지원)
    // SockJS는 웹소켓이 지원되지 않는 환경에서 HTTP 폴링 등의 대안(폴백)을 사용하여 통신을 가능하게 해줌
    const socket = new SockJS(WEBSOCKET_URL);

    // 3. SockJS 소켓 위에 STOMP 클라이언트 객체 생성
    // Stomp.over()는 SockJS 소켓 위에 STOMP 프로토콜을 사용할 수 있는 STOMP 클라이언트 객체 생성
    // 이 stompClient 객체를 통해 실제 STOMP 메시지(구독, 발행)를 주고받을 수 있게 됨
    stompClient = Stomp.over(socket);

    // 4. STOMP 서버에 연결 시도
    stompClient.connect(
        {}, // 첫 번째 인자 : 헤더 (인증 토큰 등 필요 시 여기에 추가)
        function(frame) { // 두 번째 인자: 연결 성공 시 호출될 콜백 함수 (성공 핸들러)
            console.log('STOMP Connected: ', frame);
            if (onConnected) {
                onConnected();
            }
        },
        function(error) {// 세 번째 인자: 연결 실패 시 호출될 콜백 함수 (에러 핸들러)
            console.error('STOMP Connection error: ', error);
            if (onError) {
                onError(error);
            }
        }
    );
};

/**
 * STOMP WebSocket 연결 해제.
 */
export const disconnectStomp = function() {
    // stompClient 객체가 존재하는지 확인 (연결된 적이 있는지)
    if (stompClient) {
        //STOMP 연결 해제
        stompClient.disconnect(function() {
            console.log("STOMP Disconnected");
            stompClient = null;
        });
    }
};

/**
 * 특정 경로를 구독하여 메시지를 수신합니다.
 * @param {string} destination - 구독할 경로 (예: `/sub/chat/room/123`)
 * @param {Function} onMessageReceived - 메시지 수신 시 호출될 콜백 함수 (인자로 메시지 본문 전달)
 * @returns {Object} 구독 객체 (나중에 구독 해제 시 사용)
 */
export const subscribeToDestination = function(destination, onMessageReceived) {
    // 현재 STOMP 클라이언트가 연결된 상태인지 확인
    if (stompClient && stompClient.connected) {
        // subscribe 메서드는 구독 객체를 반환하며, 이 객체로 나중에 unsubscribe할 수 있음
        // 첫 번째 인자 : 구독할 경로
        // 두 번째 인자 message 함수 : 해당 목적지로 메시지가 도착했을 때 호출될 콜백 함수 (메시지 수신 핸들러)
        return stompClient.subscribe(destination, function(message) {
            // 메시지 본문은 JSON 문자열이므로 파싱후 'onMessageReceived' 콜백 함수에 전달
            onMessageReceived(JSON.parse(message.body));
        });
    } else {
        console.warn("STOMP client not connected. Cannot subscribe.");
        return null;
    }
};

/**
 * 특정 경로로 메시지를 발행(전송)
 * @param {string} destination - 메시지를 보낼 경로 (예: `/pub/chat/message`)
 * @param {Object} messageBody - 전송할 메시지 본문 객체 (JSON으로 변환됨)
 */
export const publishMessage = function(destination, messageBody) {
    //현재 STOMP 클라이언트가 연결된 상태인지 확인
    if (stompClient && stompClient.connected) {
        //STOMP 클라이언트의 send 메서드 호출
        //첫 번째 인자 : 메시지를 보낼 경로
        //두 번째 인자: 헤더. 추가적인 정보(예: 인증 토큰, 메시지 타입)를 보낼 수 있음
        //세 번째 인자: 메시지 본문. JavaScript 객체를 JSON 문자열로 변환하여 보냄
        stompClient.send(destination, {}, JSON.stringify(messageBody));
    } else {
        console.warn("STOMP client not connected. Cannot send message.");
    }
};