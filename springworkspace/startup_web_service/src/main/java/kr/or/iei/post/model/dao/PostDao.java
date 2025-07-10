package kr.or.iei.post.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.or.iei.member.model.dto.Post;
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
} 