package kr.or.iei.member.model.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.or.iei.common.service.EmailService;
import kr.or.iei.common.util.JwtUtils;
import kr.or.iei.member.model.dao.MemberDao;
import kr.or.iei.member.model.dto.LoginMember;
import kr.or.iei.member.model.dto.Market;
import kr.or.iei.member.model.dto.Member;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.Report;

@Service
public class MemberService {
	
	@Autowired
	private MemberDao dao;
	
	@Autowired
	private BCryptPasswordEncoder encoder;
	
	@Autowired
	private JwtUtils jwtUtils;
	
	@Autowired
	private EmailService emailService;

	// 아이디 중복 체크
	public int chkUserId(String userId) {
		return dao.chkUserId(userId);
	}
	
	// 회원가입
	@Transactional
	public int insertMember(Member member) {
		// 비밀번호 암호화
		String encodePw = encoder.encode(member.getUserPw());
		member.setUserPw(encodePw);
		// 기본 회원 레벨 설정 (4: 일반회원)
		member.setUserLevel(4);
		return dao.insertMember(member);
	}

	// 로그인
	public LoginMember memberLogin(Member member) {
		Member chkMember = dao.memberLogin(member.getUserId());
		
		// 아이디가 존재하지 않는 경우
		if(chkMember == null) {
			return null;
		}
		
		// 계정 제재 확인
		if(chkMember.getBanUntil() != null && chkMember.getBanUntil().after(new Date())) {
			return null; // 제재 중인 계정
		}
		
		// 비밀번호 확인
		if(encoder.matches(member.getUserPw(), chkMember.getUserPw())) {
			// 토큰 생성
			String accessToken = jwtUtils.createAccessToken(chkMember.getUserId(), chkMember.getUserLevel());
			String refreshToken = jwtUtils.createRefreshToken(chkMember.getUserId(), chkMember.getUserLevel());
			
			// 비밀번호 제거
			chkMember.setUserPw(null);
			
			LoginMember loginMember = new LoginMember(chkMember, accessToken, refreshToken);
			return loginMember;
		} else {
			return null;
		}
	}
	
	// 회원 정보 조회
	public Member selectOneMember(String userId) {
		Member member = dao.selectOneMember(userId);
		if(member != null) {
			member.setUserPw(null); // 비밀번호 제거
		}
		return member;
	}
	
	// 회원 정보 수정
	@Transactional
	public int updateMember(Member member) {
		return dao.updateMember(member);
	}
	
	// 회원 탈퇴
	@Transactional
	public int deleteMember(String userId) {
		return dao.deleteMember(userId);
	}
	
	// 비밀번호 확인
	public boolean checkMemberPw(Member member) {
		Member m = dao.selectOneMember(member.getUserId());
		return encoder.matches(member.getUserPw(), m.getUserPw());
	}
	
	// 비밀번호 변경
	@Transactional
	public int updateMemberPw(Member member) {
		String encodePw = encoder.encode(member.getUserPw());
		member.setUserPw(encodePw);
		return dao.updateMemberPw(member);
	}
	
	// 아이디 찾기 (이메일로)
	public String findUserId(String userEmail) {
		Member member = dao.findMemberByEmail(userEmail);
		if(member != null) {
			try {
				// 이메일 발송
				emailService.sendUserId(userEmail, member.getUserId());
			} catch (Exception e) {
				// 이메일 발송 실패 시에도 아이디는 반환
				System.out.println("이메일 발송 실패: " + e.getMessage());
			}
			return member.getUserId();
		}
		return null;
	}
	
	// 비밀번호 찾기 (임시 비밀번호 발급)
	@Transactional
	public String findUserPw(String userId, String userEmail) {
		Member member = dao.findMemberById(userId);
		if(member != null && member.getUserEmail().equals(userEmail)) {
			// 임시 비밀번호 생성
			String tempPw = UUID.randomUUID().toString().substring(0, 8);
			
			// 임시 비밀번호 암호화 후 업데이트
			member.setUserPw(encoder.encode(tempPw));
			dao.updateMemberPw(member);
			
			try {
				// 이메일 발송
				emailService.sendTemporaryPassword(userEmail, userId, tempPw);
			} catch (Exception e) {
				// 이메일 발송 실패 시에도 임시 비밀번호는 반환
				System.out.println("이메일 발송 실패: " + e.getMessage());
			}
			
			return tempPw; // 평문 임시 비밀번호 반환 (메일 전송용)
		}
		return null;
	}
	
	// 내가 쓴 게시글 조회
	public List<Post> selectMyPosts(String userId) {
		return dao.selectMyPosts(userId);
	}
	
	// 내가 쓴 마켓글 조회
	public List<Market> selectMyMarkets(String userId) {
		return dao.selectMyMarkets(userId);
	}
	
	// 토큰 갱신
	public String refreshToken(Member member) {
		String accessToken = jwtUtils.createAccessToken(member.getUserId(), member.getUserLevel());
		return accessToken;
	}
	
	// === 관리자 기능 ===
	
	// 모든 신고 조회
	public List<Report> selectAllReports() {
		return dao.selectAllReports();
	}
	
	// 신고 처리
	@Transactional
	public int processReport(Report report, String action) {
		// 신고 상태 업데이트
		int result = dao.updateReportStatus(report);
		
		if(result > 0 && "approve".equals(action)) {
			// 신고 승인 시 해당 회원의 신고 횟수 증가
			dao.increaseReportCount(report.getReporterId());
			
			// 신고 횟수에 따른 제재 처리
			Member reportedMember = dao.selectOneMember(report.getReporterId());
			if(reportedMember.getReportCount() >= 3) {
				// 3회 이상 신고 시 7일 제재
				Calendar cal = Calendar.getInstance();
				cal.add(Calendar.DAY_OF_MONTH, 7);
				reportedMember.setBanUntil(cal.getTime());
				dao.banMember(reportedMember);
			}
		}
		
		return result;
	}
}
