package kr.or.iei.member.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.member.model.dto.Market;
import kr.or.iei.member.model.dto.Member;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.Report;

@Mapper
public interface MemberDao {
	
	// 회원 관련 메서드
	int chkUserId(String userId);
	int chkUserEmail(String userEmail);
	int insertMember(Member member);
	Member memberLogin(String userId);
	Member selectOneMember(String userId);
	int updateMember(Member member);
	int deleteMember(String userId);
	int updateMemberPw(Member member);
	Member findMemberByEmail(String userEmail);
	List<Member> findAllMembersByEmail(String userEmail);
	Member findMemberById(String userId);
	
	// 내가 쓴 게시물 조회
	List<Post> selectMyPosts(String userId);
	List<Market> selectMyMarkets(String userId);
	
	// 관리자 기능 - 신고 관리
	List<Report> selectAllReports();
	int updateReportStatus(Report report);
	int increaseReportCount(String userId);
	int banMember(Member member);
	
	// 관리자 기능 - 회원 관리
	List<Member> selectAllMembers();
	List<Post> selectMyNotices(String userId);
	
	// 회원 등급 수정
	int updateUserLevel(Member member);
	
	// 자동등업을 위한 게시글/댓글 수 조회
	int countUserPosts(String userId);
	int countUserComments(String userId);
	
	// 게시글 삭제
	int deletePost(int postNo);
	
	// 마켓글 삭제
	int deleteMarket(int marketNo);
	
	// 게시글 단건 조회
	Post selectOnePost(int postNo);
	
	// 마켓글 단건 조회
	Market selectOneMarket(int marketNo);
}
