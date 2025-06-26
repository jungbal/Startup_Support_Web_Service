package kr.or.iei.member.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.common.dto.ResponseDTO;
import kr.or.iei.member.model.dto.LoginMember;
import kr.or.iei.member.model.dto.Market;
import kr.or.iei.member.model.dto.Member;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.Report;
import kr.or.iei.member.model.service.MemberService;

/**
 * 회원 관리 컨트롤러 클래스
 * - 회원 관련 모든 API 엔드포인트를 처리
 * - 클라이언트(웹/앱)에서 보내는 HTTP 요청을 받아서 처리
 * - 회원가입, 로그인, 회원정보 관리 등의 기능 제공
 */
@RestController  // 이 클래스가 REST API 컨트롤러임을 Spring에게 알림
@CrossOrigin("*")  // 모든 도메인에서의 접근 허용 (CORS 설정)
@RequestMapping("/member")  // 모든 API의 기본 경로를 /member로 설정
@Tag(name="MEMBER", description = "회원관리 API")  // Swagger 문서에서 표시될 태그 정보
public class MemberController {
	
	/**
	 * 회원 서비스 객체
	 * - 실제 비즈니스 로직을 처리하는 서비스 클래스
	 * - Spring이 자동으로 MemberService 객체를 주입
	 */
	@Autowired  // Spring이 자동으로 MemberService 객체를 주입
	private MemberService service;
	
	
	// 아이디 중복 체크
	@GetMapping("/{userId}/chkId")
	@NoTokenCheck
	@Operation(summary = "아이디 중복 체크", description = "회원가입 시 아이디 중복을 확인합니다")
	public ResponseEntity<ResponseDTO> chkUserId(
			@Parameter(description = "확인할 사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "아이디 중복 체크 중 오류가 발생했습니다.", false, "error");
		
		try {
			int count = service.chkUserId(userId);
			res = new ResponseDTO(HttpStatus.OK, "", count, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 이메일 중복 체크
	@GetMapping("/email/{userEmail}/chkEmail")
	@NoTokenCheck
	@Operation(summary = "이메일 중복 체크", description = "회원가입 시 이메일 중복을 확인합니다")
	public ResponseEntity<ResponseDTO> chkUserEmail(
			@Parameter(description = "확인할 사용자 이메일", required = true) @PathVariable String userEmail) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "이메일 중복 체크 중 오류가 발생했습니다.", false, "error");
		
		try {
			int count = service.chkUserEmail(userEmail);
			res = new ResponseDTO(HttpStatus.OK, "", count, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 회원가입
	@PostMapping
	@NoTokenCheck
	@Operation(summary = "회원가입", description = "새로운 회원을 등록합니다")
	public ResponseEntity<ResponseDTO> insertMember(
			@Parameter(description = "가입할 회원 정보", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "회원가입 중 오류가 발생했습니다.", false, "error");
		
		try {
			int result = service.insertMember(member);
			
			if(result > 0) {
				res = new ResponseDTO(HttpStatus.OK, "회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.", true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "회원가입 중 오류가 발생했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 로그인
	@PostMapping("/login")
	@NoTokenCheck
	@Operation(summary = "로그인", description = "회원 로그인 및 JWT 토큰을 발급합니다")
	public ResponseEntity<ResponseDTO> memberLogin(
			@Parameter(description = "로그인 정보 (아이디, 비밀번호)", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "로그인 중 오류가 발생했습니다.", null, "error");
		
		try {
			LoginMember loginMember = service.memberLogin(member);
			
			if(loginMember == null) {
				res = new ResponseDTO(HttpStatus.OK, "아이디 및 비밀번호를 확인하세요.", null, "warning");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "로그인 성공", loginMember, "success");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 회원 정보 조회
	@GetMapping("/{userId}")
	@Operation(summary = "회원 정보 조회", description = "특정 회원의 정보를 조회합니다")
	public ResponseEntity<ResponseDTO> selectOneMember(
			@Parameter(description = "조회할 사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "회원 정보 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			Member member = service.selectOneMember(userId);
			res = new ResponseDTO(HttpStatus.OK, "", member, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 회원 정보 수정
	@PatchMapping
	@Operation(summary = "회원 정보 수정", description = "회원 정보를 수정합니다 (이름, 전화번호, 이메일, 주소)")
	public ResponseEntity<ResponseDTO> updateMember(
			@Parameter(description = "수정할 회원 정보", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "수정 중 오류가 발생했습니다.", false, "error");
		
		try {
			int result = service.updateMember(member);
			
			if(result > 0) {
				res = new ResponseDTO(HttpStatus.OK, "회원 정보 수정이 완료되었습니다.", true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "수정 중 오류가 발생했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 회원 탈퇴
	@DeleteMapping("/{userId}")
	@Operation(summary = "회원 탈퇴", description = "회원을 탈퇴시킵니다")
	public ResponseEntity<ResponseDTO> deleteMember(
			@Parameter(description = "탈퇴할 사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "삭제 중 오류가 발생했습니다.", false, "error");
		
		try {
			int result = service.deleteMember(userId);
			
			if(result > 0) {
				res = new ResponseDTO(HttpStatus.OK, "회원 탈퇴가 완료되었습니다.", true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "탈퇴 중 오류가 발생했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 비밀번호 확인
	@PostMapping("/checkPw")
	@Operation(summary = "비밀번호 확인", description = "현재 비밀번호를 확인합니다")
	public ResponseEntity<ResponseDTO> checkPw(
			@Parameter(description = "확인할 비밀번호 정보", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "비밀번호 확인 중 오류가 발생했습니다.", false, "error");
		
		try {
			boolean result = service.checkMemberPw(member);
			res = new ResponseDTO(HttpStatus.OK, "", result, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 비밀번호 변경
	@PatchMapping("/memberPw")
	@Operation(summary = "비밀번호 변경", description = "회원의 비밀번호를 변경합니다")
	public ResponseEntity<ResponseDTO> updateMemberPw(
			@Parameter(description = "새 비밀번호 정보", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "비밀번호 변경 중 오류가 발생했습니다.", false, "error");
		
		try {
			int result = service.updateMemberPw(member);
			
			if(result > 0) {
				res = new ResponseDTO(HttpStatus.OK, "비밀번호가 변경되었습니다.", true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "비밀번호 변경 중 오류가 발생했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 아이디 찾기
	@PostMapping("/findId")
	@NoTokenCheck
	@Operation(summary = "아이디 찾기", description = "이메일로 아이디를 찾습니다")
	public ResponseEntity<ResponseDTO> findUserId(
			@Parameter(description = "가입한 이메일 주소", required = true) @RequestParam String userEmail) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "아이디 찾기 중 오류가 발생했습니다.", null, "error");
		
		try {
			String result = service.findUserId(userEmail);
			
			if(result != null) {
				res = new ResponseDTO(HttpStatus.OK, result, true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "해당 이메일로 가입된 회원이 없거나 이메일 발송에 실패했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 비밀번호 찾기 (임시 비밀번호 발급)
	@PostMapping("/findPw")
	@NoTokenCheck
	@Operation(summary = "비밀번호 찾기", description = "아이디와 이메일로 임시 비밀번호를 발급합니다")
	public ResponseEntity<ResponseDTO> findUserPw(
			@Parameter(description = "사용자 아이디", required = true) @RequestParam String userId, 
			@Parameter(description = "가입한 이메일 주소", required = true) @RequestParam String userEmail) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "비밀번호 찾기 중 오류가 발생했습니다.", null, "error");
		
		try {
			String result = service.findUserPw(userId, userEmail);
			
			if(result != null) {
				res = new ResponseDTO(HttpStatus.OK, result, true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "아이디 또는 이메일을 확인해주세요.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 내가 쓴 게시글 조회
	@GetMapping("/{userId}/posts")
	@Operation(summary = "내가 쓴 게시글 조회", description = "특정 회원이 작성한 게시글 목록을 조회합니다")
	public ResponseEntity<ResponseDTO> selectMyPosts(
			@Parameter(description = "사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			List<Post> posts = service.selectMyPosts(userId);
			res = new ResponseDTO(HttpStatus.OK, "", posts, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 내가 쓴 마켓글 조회
	@GetMapping("/{userId}/markets")
	@Operation(summary = "내가 쓴 마켓글 조회", description = "특정 회원이 작성한 마켓글(판매글) 목록을 조회합니다")
	public ResponseEntity<ResponseDTO> selectMyMarkets(
			@Parameter(description = "사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "마켓글 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			List<Market> markets = service.selectMyMarkets(userId);
			res = new ResponseDTO(HttpStatus.OK, "", markets, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 토큰 갱신
	@PostMapping("/refresh")
	@NoTokenCheck
	@Operation(summary = "토큰 갱신", description = "Access Token을 갱신합니다")
	public ResponseEntity<ResponseDTO> refreshToken(
			@Parameter(description = "토큰 갱신용 회원 정보", required = true) @RequestBody Member member) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "토큰 갱신 중 오류가 발생했습니다.", null, "error");
		
		try {
			String accessToken = service.refreshToken(member);
			res = new ResponseDTO(HttpStatus.OK, "", accessToken, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// === 관리자 기능 ===
	
	// 모든 회원 조회 (관리자용)
	@GetMapping("/admin/members")
	@Operation(summary = "회원 목록 조회", description = "모든 회원 목록을 조회합니다 (관리자 전용)")
	public ResponseEntity<ResponseDTO> selectAllMembers() {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "회원 목록 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			List<Member> members = service.selectAllMembers();
			res = new ResponseDTO(HttpStatus.OK, "", members, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 내가 쓴 공지사항 조회 (관리자용)
	@GetMapping("/{userId}/notices")
	@Operation(summary = "내가 쓴 공지사항 조회", description = "특정 관리자가 작성한 공지사항 목록을 조회합니다")
	public ResponseEntity<ResponseDTO> selectMyNotices(
			@Parameter(description = "사용자 아이디", required = true) @PathVariable String userId) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "공지사항 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			List<Post> notices = service.selectMyNotices(userId);
			res = new ResponseDTO(HttpStatus.OK, "", notices, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 모든 신고 조회 (관리자용)
	@GetMapping("/admin/reports")
	@Operation(summary = "신고 목록 조회", description = "모든 신고 목록을 조회합니다 (관리자 전용)")
	public ResponseEntity<ResponseDTO> selectAllReports() {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "신고 조회 중 오류가 발생했습니다.", null, "error");
		
		try {
			List<Report> reports = service.selectAllReports();
			res = new ResponseDTO(HttpStatus.OK, "", reports, "success");
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	// 신고 처리 (관리자용)
	@PatchMapping("/admin/reports")
	@Operation(summary = "신고 처리", description = "신고를 승인 또는 거절 처리합니다 (관리자 전용)")
	public ResponseEntity<ResponseDTO> processReport(
			@Parameter(description = "처리할 신고 정보", required = true) @RequestBody Report report, 
			@Parameter(description = "처리 액션 (approve/reject)", required = true) @RequestParam String action) {
		ResponseDTO res = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, "신고 처리 중 오류가 발생했습니다.", false, "error");
		
		try {
			int result = service.processReport(report, action);
			
			if(result > 0) {
				res = new ResponseDTO(HttpStatus.OK, "신고 처리가 완료되었습니다.", true, "success");
			} else {
				res = new ResponseDTO(HttpStatus.OK, "신고 처리 중 오류가 발생했습니다.", false, "warning");
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
}
