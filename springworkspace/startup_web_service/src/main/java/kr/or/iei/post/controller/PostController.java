package kr.or.iei.post.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.PostFile;
import kr.or.iei.member.model.dto.Report;
import kr.or.iei.post.model.service.PostService;
import kr.or.iei.common.util.JwtUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/post")
@Tag(name = "POST", description = "커뮤니티 게시판 API")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    // 테스트 엔드포인트 (서버 연결 확인용)
    @GetMapping("/test")
    @NoTokenCheck
    @Operation(summary = "서버 연결 테스트", description = "백엔드 서버가 정상 작동하는지 확인합니다")
    public ResponseEntity<String> testConnection() {
        System.out.println("=== 테스트 엔드포인트 호출됨 ===");
        return ResponseEntity.ok("백엔드 서버가 정상 작동 중입니다!");
    }
    
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
            @RequestParam("postTitle") String postTitle,
            @RequestParam("postContent") String postContent,
            @RequestParam("postType") String postType,
            @RequestParam(value = "attachedFiles", required = false) MultipartFile[] attachedFiles,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        System.out.println("=== 게시글 등록 요청 ===");
        System.out.println("postTitle: " + postTitle);
        System.out.println("postContent: " + postContent);
        System.out.println("postType: " + postType);
        System.out.println("token: " + token);
        System.out.println("attachedFiles: " + (attachedFiles != null ? attachedFiles.length : 0));
        
        // 토큰 체크
        if (token == null || token.isEmpty()) {
            System.out.println("토큰이 없음!");
            return ResponseEntity.status(401).body(0);
        }
        
        // 토큰에서 사용자 ID 추출
        String userId;
        try {
            userId = jwtUtils.getMemberIdFromToken(token);
            System.out.println("토큰에서 추출된 userId: " + userId);
        } catch (Exception e) {
            System.out.println("토큰 파싱 실패: " + e.getMessage());
            return ResponseEntity.status(401).body(0);
        }
        System.out.println("최종 사용할 userId: " + userId);
        
        // 공지사항은 슈퍼관리자만 작성 가능
        if("notice".equals(postType)) {
            try {
                int userLevel = jwtUtils.getMemberLevelFromToken(token);
                if(userLevel != 1) {
                    System.out.println("공지사항 작성 권한 없음. userLevel: " + userLevel);
                    return ResponseEntity.status(403).body(0);
                }
            } catch (Exception e) {
                System.out.println("사용자 레벨 추출 실패: " + e.getMessage());
                return ResponseEntity.status(401).body(0);
            }
        }
        
        // Post 객체 생성
        Post post = new Post();
        post.setUserId(userId);
        post.setPostType(postType);
        post.setPostTitle(postTitle);
        post.setPostContent(postContent);
        post.setPostStatus("public");
        
        int result = postService.insertPost(post, attachedFiles);
        return ResponseEntity.ok(result);
    }
    
    // 게시글 수정 (작성자만 가능)
    @PatchMapping("/{postNo}")
    @Operation(summary = "게시글 수정", description = "게시글을 수정합니다")
    public ResponseEntity<Integer> updatePost(
            @PathVariable int postNo,
            @RequestParam("postTitle") String postTitle,
            @RequestParam("postContent") String postContent,
            @RequestParam("postType") String postType,
            @RequestParam(value = "attachedFiles", required = false) MultipartFile[] attachedFiles,
            @RequestParam(value = "deletedFiles", required = false) String deletedFiles,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("=== 게시글 수정 요청 ===");
        System.out.println("postNo: " + postNo);
        System.out.println("postTitle: " + postTitle);
        System.out.println("postContent: " + postContent);
        System.out.println("postType: " + postType);
        System.out.println("token: " + token);
        System.out.println("attachedFiles: " + (attachedFiles != null ? attachedFiles.length : 0));
        System.out.println("deletedFiles: " + deletedFiles);
        
        try {
            // 토큰에서 사용자 ID 추출
            String userId = jwtUtils.getMemberIdFromToken(token);
            System.out.println("토큰에서 추출된 userId: " + userId);
            
            // 작성자 확인
            Post originalPost = postService.selectOnePost(postNo, false);
            if(originalPost == null) {
                System.out.println("원본 게시글이 존재하지 않음");
                return ResponseEntity.status(404).body(0);
            }
            
            System.out.println("원본 게시글 작성자: " + originalPost.getUserId());
            System.out.println("현재 사용자: " + userId);
            
            // 작성자 본인이거나 관리자인지 확인
            int userLevel = jwtUtils.getMemberLevelFromToken(token);
            System.out.println("사용자 레벨: " + userLevel);
            
            if(!originalPost.getUserId().equals(userId) && userLevel != 1) {
                System.out.println("수정 권한이 없음");
                return ResponseEntity.status(403).body(0);
            }
            
            // Post 객체 생성
            Post post = new Post();
            post.setPostNo(postNo);
            post.setUserId(userId);
            post.setPostType(postType);
            post.setPostTitle(postTitle);
            post.setPostContent(postContent);
            
            System.out.println("서비스 호출 전 - Post 객체: " + post);
            
            int result = postService.updatePost(post, attachedFiles, deletedFiles);
            System.out.println("게시글 수정 결과: " + result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("게시글 수정 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(0);
        }
    }
    
    // 게시글 삭제 (작성자만 가능)
    @DeleteMapping("/{postNo}")
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다")
    public ResponseEntity<Integer> deletePost(
            @PathVariable int postNo,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("=== 게시글 삭제 요청 ===");
        System.out.println("postNo: " + postNo);
        System.out.println("token: " + token);
        
        try {
            // 토큰에서 사용자 ID 추출
            String userId = jwtUtils.getMemberIdFromToken(token);
            System.out.println("토큰에서 추출된 userId: " + userId);
            
            // 게시글 존재 여부 및 작성자 확인
            Post originalPost = postService.selectOnePost(postNo, false);
            if(originalPost == null) {
                System.out.println("삭제할 게시글이 존재하지 않음");
                return ResponseEntity.status(404).body(0);
            }
            
            System.out.println("원본 게시글 작성자: " + originalPost.getUserId());
            System.out.println("현재 사용자: " + userId);
            
            // 작성자 본인이거나 관리자인지 확인
            int userLevel = jwtUtils.getMemberLevelFromToken(token);
            System.out.println("사용자 레벨: " + userLevel);
            
            if(!originalPost.getUserId().equals(userId) && userLevel != 1) {
                System.out.println("삭제 권한이 없음");
                return ResponseEntity.status(403).body(0);
            }
            
            int result = postService.deletePost(postNo, userId);
            System.out.println("게시글 삭제 결과: " + result);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("게시글 삭제 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(0);
        }
    }
    
    // 파일 다운로드 (비회원도 가능)
    @GetMapping("/download/{fileNo}")
    @NoTokenCheck
    @Operation(summary = "파일 다운로드", description = "게시글 첨부파일을 다운로드합니다")
    public ResponseEntity<Resource> downloadFile(@PathVariable int fileNo) {
        try {
            PostFile postFile = postService.selectPostFile(fileNo);
            if (postFile == null) {
                return ResponseEntity.notFound().build();
            }
            
            String uploadPath = System.getProperty("user.dir") + "/uploads/post/";
            Path filePath = Paths.get(uploadPath + postFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + postFile.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 신고 등록 (로그인 사용자만 가능)
    @PostMapping("/report")
    @Operation(summary = "게시글 신고", description = "게시글을 신고합니다")
    public ResponseEntity<Map<String, Object>> reportPost(
            @RequestBody Report report,
            @RequestHeader("Authorization") String token) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 토큰에서 사용자 ID 추출
            String userId = jwtUtils.getMemberIdFromToken(token);
            
            // 신고자 ID 설정
            report.setReporterId(userId);
            report.setReportStatus("wait");
            report.setAdminId("admin"); // 기본 관리자 ID 설정
            
            // 신고 등록
            int insertResult = postService.insertReport(report);
            
            if (insertResult == -1) {
                result.put("success", false);
                result.put("message", "이미 신고한 게시글입니다.");
                return ResponseEntity.ok(result);
            } else if (insertResult > 0) {
                result.put("success", true);
                result.put("message", "신고가 정상적으로 접수되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "신고 처리 중 오류가 발생했습니다.");
                return ResponseEntity.ok(result);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "신고 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
} 