package kr.or.iei.post.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.post.model.service.PostService;
import kr.or.iei.common.util.JwtUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/post")
@Tag(name = "POST", description = "커뮤니티 게시판 API")
@CrossOrigin("*")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    // 게시글 목록 조회 (비회원도 가능)
    @GetMapping("/list/{postType}/{reqPage}")
    @NoTokenCheck
    @Operation(summary = "게시글 목록 조회", description = "게시판 타입별 게시글 목록을 조회합니다")
    public ResponseEntity<Map<String, Object>> getPostList(
            @PathVariable String postType,
            @PathVariable int reqPage) {
        
        Map<String, Object> result = postService.selectPostList(reqPage, postType);
        return ResponseEntity.ok(result);
    }
    
    // 게시글 상세 조회 (비회원도 가능)
    @GetMapping("/view/{postNo}")
    @NoTokenCheck
    @Operation(summary = "게시글 상세 조회", description = "게시글 상세 정보를 조회합니다")
    public ResponseEntity<Post> getPost(@PathVariable int postNo) {
        Post post = postService.selectOnePost(postNo, true);
        if(post != null) {
            return ResponseEntity.ok(post);
        }
        return ResponseEntity.notFound().build();
    }
    
    // 게시글 등록 (회원만 가능)
    @PostMapping
    @Operation(summary = "게시글 등록", description = "새 게시글을 등록합니다")
    public ResponseEntity<Integer> insertPost(
            @RequestBody Post post,
            @RequestHeader("Authorization") String token) {
        
        // 토큰에서 사용자 ID 추출
        String userId = jwtUtils.getMemberIdFromToken(token);
        post.setUserId(userId);
        
        // 공지사항은 슈퍼관리자만 작성 가능
        if("notice".equals(post.getPostType())) {
            int userLevel = jwtUtils.getMemberLevelFromToken(token);
            if(userLevel != 1) {
                return ResponseEntity.status(403).body(0);
            }
        }
        
        // 기본 상태값 설정
        post.setPostStatus("public");
        
        int result = postService.insertPost(post);
        return ResponseEntity.ok(result);
    }
    
    // 게시글 수정 (작성자만 가능)
    @PatchMapping("/{postNo}")
    @Operation(summary = "게시글 수정", description = "게시글을 수정합니다")
    public ResponseEntity<Integer> updatePost(
            @PathVariable int postNo,
            @RequestBody Post post,
            @RequestHeader("Authorization") String token) {
        
        String userId = jwtUtils.getMemberIdFromToken(token);
        
        // 작성자 확인
        Post originalPost = postService.selectOnePost(postNo, false);
        if(originalPost == null || !originalPost.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(0);
        }
        
        post.setPostNo(postNo);
        post.setUserId(userId);
        
        int result = postService.updatePost(post);
        return ResponseEntity.ok(result);
    }
    
    // 게시글 삭제 (작성자만 가능)
    @DeleteMapping("/{postNo}")
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다")
    public ResponseEntity<Integer> deletePost(
            @PathVariable int postNo,
            @RequestHeader("Authorization") String token) {
        
        String userId = jwtUtils.getMemberIdFromToken(token);
        
        int result = postService.deletePost(postNo, userId);
        return ResponseEntity.ok(result);
    }
} 