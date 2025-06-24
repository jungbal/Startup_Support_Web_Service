package kr.or.iei.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 이메일 발송 서비스 클래스
 * - 회원가입, 비밀번호 찾기 등에서 이메일을 발송하는 기능
 * - Gmail SMTP를 사용하여 이메일 발송
 */
@Service  // 이 클래스가 서비스 클래스임을 Spring에게 알림
public class EmailService {
	
	@Autowired  // Spring이 자동으로 JavaMailSender 객체를 주입
	private JavaMailSender mailSender;  // 이메일 발송을 담당하는 객체
	
	/**
	 * 임시 비밀번호 발송 메소드
	 * - 비밀번호 찾기 시 임시 비밀번호를 이메일로 발송
	 * @param toEmail 받는 사람 이메일 주소
	 * @param userId 사용자 아이디
	 * @param tempPassword 임시 비밀번호
	 */
	public void sendTemporaryPassword(String toEmail, String userId, String tempPassword) {
		// 이메일 메시지 객체 생성
		SimpleMailMessage message = new SimpleMailMessage();
		
		// 이메일 설정
		message.setTo(toEmail);  // 받는 사람 이메일 주소 설정
		message.setSubject("[스타트업 지원 웹 서비스] 임시 비밀번호 발급");  // 이메일 제목 설정
		
		// 이메일 내용 설정 (여러 줄로 구성)
		message.setText(
			"안녕하세요, 스타트업 지원 웹 서비스입니다.\n\n" +  // 인사말
			"요청하신 임시 비밀번호가 발급되었습니다.\n\n" +  // 안내 문구
			"아이디: " + userId + "\n" +  // 사용자 아이디 표시
			"임시 비밀번호: " + tempPassword + "\n\n" +  // 임시 비밀번호 표시
			"보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.\n\n" +  // 보안 안내
			"감사합니다."  // 마무리 인사
		);
		
		// 이메일 발송
		mailSender.send(message);
	}
	
	/**
	 * 아이디 찾기 결과 발송 메소드
	 * - 아이디 찾기 시 찾은 아이디를 이메일로 발송
	 * @param toEmail 받는 사람 이메일 주소
	 * @param userId 찾은 사용자 아이디
	 */
	public void sendUserId(String toEmail, String userId) {
		// 이메일 메시지 객체 생성
		SimpleMailMessage message = new SimpleMailMessage();
		
		// 이메일 설정
		message.setTo(toEmail);  // 받는 사람 이메일 주소 설정
		message.setSubject("[스타트업 지원 웹 서비스] 아이디 찾기 결과");  // 이메일 제목 설정
		
		// 이메일 내용 설정
		message.setText(
			"안녕하세요, 스타트업 지원 웹 서비스입니다.\n\n" +  // 인사말
			"요청하신 아이디 찾기 결과입니다.\n\n" +  // 안내 문구
			"아이디: " + userId + "\n\n" +  // 찾은 아이디 표시
			"감사합니다."  // 마무리 인사
		);
		
		// 이메일 발송
		mailSender.send(message);
	}
} 