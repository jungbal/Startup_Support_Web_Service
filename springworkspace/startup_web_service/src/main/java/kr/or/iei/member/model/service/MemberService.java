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
	
	// 이메일 중복 체크
	public int chkUserEmail(String userEmail) {
		return dao.chkUserEmail(userEmail);
	}
	
	// 회원가입
	@Transactional
	public int insertMember(Member member) {
		// 비밀번호 암호화
		String encodePw = encoder.encode(member.getUserPw());
		member.setUserPw(encodePw);
		// DB에서 user_level DEFAULT 4로 설정되어 있으므로 별도 설정 불필요
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
				return "이메일로 아이디를 발송했습니다"; // 실제 아이디 대신 안내 메시지 반환
			} catch (Exception e) {
				// 이메일 발송 실패 시에도 아이디는 반환하지 않음
				System.out.println("이메일 발송 실패: " + e.getMessage());
				return null; // 이메일 발송 실패 시 null 반환
			}
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
				return "이메일로 임시 비밀번호를 발송했습니다"; // 실제 비밀번호 대신 안내 메시지 반환
			} catch (Exception e) {
				// 이메일 발송 실패 시 원래 비밀번호로 롤백해야 하지만, 간단히 에러 반환
				System.out.println("이메일 발송 실패: " + e.getMessage());
				return null; // 이메일 발송 실패 시 null 반환
			}
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
	
	// 모든 회원 조회 (관리자용)
	public List<Member> selectAllMembers() {
		List<Member> members = dao.selectAllMembers();
		// 비밀번호 제거
		for(Member member : members) {
			member.setUserPw(null);
		}
		return members;
	}
	
	// 내가 쓴 공지사항 조회 (관리자용)
	public List<Post> selectMyNotices(String userId) {
		return dao.selectMyNotices(userId);
	}
	
	// 모든 신고 조회
	public List<Report> selectAllReports() {
		return dao.selectAllReports();
	}
	
	// 신고 처리
	@Transactional
	public int processReport(Report report, String action) {
		// action에 따라 report_status 설정
		// wait: 대기 상태 유지
		// rejected: 신고 반려 (DB 트리거가 게시글의 신고 카운트 1 감소)
		// approved: 신고 승인 (신고 횟수 유지, 작성자 누적 신고 횟수 증가)
		// deleted: 게시글/마켓글 직접 삭제
		
		int result = 0;
		
		if ("wait".equals(action)) {
			// 대기 상태로 유지 (아무 처리 안함)
			return 1;
		} else if ("rejected".equals(action)) {
			// 신고 반려 처리 (DB 트리거가 자동으로 게시글의 신고 카운트를 1 감소시킴)
			report.setReportStatus("rejected");
			result = dao.updateReportStatus(report);
		} else if ("approved".equals(action)) {
			// 신고 승인 처리 (게시글 신고 횟수는 유지, 작성자 누적 신고 횟수만 증가)
			report.setReportStatus("approved");
			result = dao.updateReportStatus(report);
			
			if (result > 0) {
				// 신고된 게시글의 작성자 ID를 조회
				String reportedUserId = getPostWriterId(report.getPostType(), report.getPostId());
				
				// 신고가 승인되었으므로 작성자의 누적 신고 횟수 증가
				if (reportedUserId != null) {
					// 작성자의 신고 누적 횟수 증가
					dao.increaseReportCount(reportedUserId);
					
					// 업데이트된 회원 정보 조회
					Member reportedMember = dao.selectOneMember(reportedUserId);
					
					// 신고 누적 6회 이상 시 7일 제재
					if (reportedMember != null && reportedMember.getReportCount() >= 6) {
						// 이미 제재 중이 아닌 경우에만 새로운 제재 적용
						if (reportedMember.getBanUntil() == null || reportedMember.getBanUntil().before(new Date())) {
							Calendar cal = Calendar.getInstance();
							cal.add(Calendar.DAY_OF_MONTH, 7);
							reportedMember.setBanUntil(cal.getTime());
							dao.banMember(reportedMember);
						}
					}
				}
			}
		} else if ("deleted".equals(action)) {
			// 게시글/마켓글 직접 삭제 처리
			report.setReportStatus("deleted");
			result = dao.updateReportStatus(report);
			
			if (result > 0) {
				// 먼저 게시글 작성자 ID를 조회 (삭제 전에 조회해야 함)
				String reportedUserId = getPostWriterId(report.getPostType(), report.getPostId());
				
				// 게시글 타입에 따라 삭제 처리
				if ("post".equals(report.getPostType())) {
					// 게시글 삭제
					dao.deletePost(report.getPostId());
				} else if ("market".equals(report.getPostType())) {
					// 마켓글 삭제
					dao.deleteMarket(report.getPostId());
				}
				
				// 게시글이 삭제되었으므로 작성자의 누적 신고 횟수 증가
				if (reportedUserId != null) {
					// 작성자의 신고 누적 횟수 증가
					dao.increaseReportCount(reportedUserId);
					
					// 업데이트된 회원 정보 조회
					Member reportedMember = dao.selectOneMember(reportedUserId);
					
					// 신고 누적 6회 이상 시 7일 제재
					if (reportedMember != null && reportedMember.getReportCount() >= 6) {
						// 이미 제재 중이 아닌 경우에만 새로운 제재 적용
						if (reportedMember.getBanUntil() == null || reportedMember.getBanUntil().before(new Date())) {
							Calendar cal = Calendar.getInstance();
							cal.add(Calendar.DAY_OF_MONTH, 7);
							reportedMember.setBanUntil(cal.getTime());
							dao.banMember(reportedMember);
						}
					}
				}
			}
		}
		
		return result;
	}
	
	// 게시글/마켓글 작성자 ID 조회
	private String getPostWriterId(String postType, int postId) {
		if ("post".equals(postType)) {
			Post post = dao.selectOnePost(postId);
			return post != null ? post.getUserId() : null;
		} else if ("market".equals(postType)) {
			Market market = dao.selectOneMarket(postId);
			return market != null ? market.getUserId() : null;
		}
		return null;
	}
	
	// 회원 등급 수정 (관리자용)
	@Transactional
	public int updateUserLevel(Member member) {
		return dao.updateUserLevel(member);
	}
	
	// 자동등업 체크 (게시글 2개 + 댓글 2개 작성 시 등급 4 → 3으로 승급)
	@Transactional
	public void checkAutoLevelUp(String userId) {
		// 현재 회원 정보 조회
		Member member = dao.selectOneMember(userId);
		
		// 등급 4인 회원만 자동등업 대상
		if (member != null && member.getUserLevel() == 4) {
			// 사용자의 게시글 수와 댓글 수 조회
			int postCount = dao.countUserPosts(userId);
			int commentCount = dao.countUserComments(userId);
			
			// 게시글 2개 이상 && 댓글 2개 이상 작성 시 등급 3으로 승급
			if (postCount >= 2 && commentCount >= 2) {
				member.setUserLevel(3);
				dao.updateUserLevel(member);
				System.out.println("자동등업 완료: " + userId + " (등급 4 → 3)");
			}
		}
	}
	
	// 사용자 게시글 수 조회
	public int countUserPosts(String userId) {
		return dao.countUserPosts(userId);
	}
	
	// 사용자 댓글 수 조회
	public int countUserComments(String userId) {
		return dao.countUserComments(userId);
	}
}
