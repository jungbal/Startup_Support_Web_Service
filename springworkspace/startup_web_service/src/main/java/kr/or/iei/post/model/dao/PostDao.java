package kr.or.iei.post.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.PostFile;
import kr.or.iei.member.model.dto.Report;
import kr.or.iei.common.dto.PageInfo;

@Mapper
public interface PostDao {
    // 게시글 목록 조회 (페이징)
    List<Post> selectPostList(@Param("param1") PageInfo pi, @Param("param2") String postType);
    
    // 전체 게시글 수 조회
    int selectPostCount(@Param("postType") String postType);
    
    // 게시글 상세 조회
    Post selectOnePost(@Param("postNo") int postNo);
    
    // 조회수 증가
    int updateReadCount(@Param("postNo") int postNo);
    
    // 게시글 등록
    int insertPost(Post post);
    
    // 게시글 수정
    int updatePost(Post post);
    
    // 게시글 삭제
    int deletePost(@Param("postNo") int postNo);
    
    // 게시글 상태 변경 (공개/비공개)
    int updatePostStatus(@Param("param1") int postNo, @Param("param2") String postStatus);
    
    // 게시글 첨부파일 등록
    int insertPostFile(PostFile postFile);
    
    // 게시글 첨부파일 목록 조회
    List<PostFile> selectPostFileList(@Param("postNo") int postNo);
    
    // 게시글 첨부파일 삭제
    int deletePostFile(@Param("fileNo") int fileNo);
    
    // 첨부파일 단건 조회
    PostFile selectPostFile(@Param("fileNo") int fileNo);
    
    // 신고 등록
    int insertReport(Report report);
    
    // 중복 신고 확인 (같은 사용자가 같은 게시글을 이미 신고했는지 확인)
    int checkDuplicateReport(@Param("reporterId") String reporterId, @Param("postType") String postType, @Param("postId") int postId);
} 