package kr.or.iei.post.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.common.util.PageUtil;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.post.model.dao.PostDao;

@Service
public class PostService {
    
    @Autowired
    private PostDao postDao;
    
    @Autowired
    private PageUtil pageUtil;
    
    // 게시글 목록 조회
    public Map<String, Object> selectPostList(int reqPage, String postType) {
        int numPerPage = 10; // 한 페이지당 게시글 수
        int pageNaviSize = 5; // 페이지 네비게이션 크기
        
        int totalCount = postDao.selectPostCount(postType);
        
        PageInfo pi = pageUtil.getPageInfo(reqPage, numPerPage, pageNaviSize, totalCount);
        
        List<Post> list = postDao.selectPostList(pi, postType);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("pi", pi);
        result.put("totalCount", totalCount); // 전체 게시글 수 추가
        
        return result;
    }
    
    // 게시글 상세 조회
    @Transactional
    public Post selectOnePost(int postNo, boolean isView) {
        // 조회수 증가 (상세보기일 때만)
        if(isView) {
            postDao.updateReadCount(postNo);
        }
        
        return postDao.selectOnePost(postNo);
    }
    
    // 게시글 등록
    @Transactional
    public int insertPost(Post post) {
        return postDao.insertPost(post);
    }
    
    // 게시글 수정
    @Transactional
    public int updatePost(Post post) {
        return postDao.updatePost(post);
    }
    
    // 게시글 삭제
    @Transactional
    public int deletePost(int postNo, String userId) {
        // 작성자 확인
        Post post = postDao.selectOnePost(postNo);
        if(post != null && post.getUserId().equals(userId)) {
            return postDao.deletePost(postNo);
        }
        return 0;
    }
    
    // 게시글 상태 변경
    @Transactional
    public int updatePostStatus(int postNo, String postStatus) {
        return postDao.updatePostStatus(postNo, postStatus);
    }
} 