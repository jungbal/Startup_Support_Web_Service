package kr.or.iei.post.model.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.common.util.PageUtil;
import kr.or.iei.member.model.dto.Post;
import kr.or.iei.member.model.dto.PostFile;
import kr.or.iei.member.model.dto.Report;
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
        
        Post post = postDao.selectOnePost(postNo);
        if(post != null) {
            // 첨부파일 정보 조회
            List<PostFile> files = postDao.selectPostFileList(postNo);
            post.setAttachedFiles(files);
        }
        
        return post;
    }
    
    // 게시글 등록
    @Transactional
    public int insertPost(Post post) {
        return postDao.insertPost(post);
    }
    
    // 게시글 등록 (파일 첨부 포함)
    @Transactional
    public int insertPost(Post post, MultipartFile[] attachedFiles) {
        System.out.println("=== PostService.insertPost ===");
        System.out.println("Post 정보: " + post);
        System.out.println("첨부파일 개수: " + (attachedFiles != null ? attachedFiles.length : 0));
        
        // 먼저 게시글 등록
        int result = postDao.insertPost(post);
        System.out.println("게시글 등록 결과: " + result);
        
        if(result > 0 && attachedFiles != null && attachedFiles.length > 0) {
            // 파일 업로드 처리
            String uploadPath = System.getProperty("user.dir") + "/uploads/post/";
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            for (MultipartFile file : attachedFiles) {
                if (!file.isEmpty()) {
                    try {
                        String originalFilename = file.getOriginalFilename();
                        String savedFilename = System.currentTimeMillis() + "_" + originalFilename;
                        String filePath = uploadPath + savedFilename;
                        
                        // 파일 저장
                        file.transferTo(new File(filePath));
                        
                        // 파일 정보 DB에 저장
                        PostFile postFile = new PostFile();
                        postFile.setPostNo(post.getPostNo());
                        postFile.setFileName(originalFilename);
                        postFile.setFilePath(savedFilename);
                        
                        postDao.insertPostFile(postFile);
                    } catch (IOException e) {
                        e.printStackTrace();
                        // 파일 업로드 실패 시 게시글도 롤백
                        throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
                    }
                }
            }
        }
        
        return result;
    }
    
    // 게시글 수정
    @Transactional
    public int updatePost(Post post) {
        return postDao.updatePost(post);
    }
    
    // 게시글 수정 (파일 첨부 포함)
    @Transactional
    public int updatePost(Post post, MultipartFile[] attachedFiles, String deletedFiles) {
        System.out.println("=== PostService.updatePost ===");
        System.out.println("Post 정보: " + post);
        System.out.println("첨부파일 개수: " + (attachedFiles != null ? attachedFiles.length : 0));
        System.out.println("삭제할 파일들: " + deletedFiles);
        
        // 먼저 게시글 수정
        int result = postDao.updatePost(post);
        System.out.println("게시글 수정 결과: " + result);
        
        if(result > 0) {
            // 삭제할 파일들 처리
            if(deletedFiles != null && !deletedFiles.trim().isEmpty()) {
                System.out.println("삭제할 파일들 처리 시작");
                try {
                    // JSON 형태의 삭제할 파일 ID 배열을 파싱
                    deletedFiles = deletedFiles.replaceAll("[\\[\\]\"]", "");
                    String[] fileIds = deletedFiles.split(",");
                    System.out.println("삭제할 파일 ID 개수: " + fileIds.length);
                    
                    for(String fileId : fileIds) {
                        if(!fileId.trim().isEmpty()) {
                            int fileNo = Integer.parseInt(fileId.trim());
                            System.out.println("삭제할 파일 ID: " + fileNo);
                            
                            // 기존 파일 삭제
                            PostFile existingFile = postDao.selectPostFile(fileNo);
                            if(existingFile != null) {
                                System.out.println("삭제할 파일 정보: " + existingFile.getFileName());
                                
                                // 실제 파일 삭제
                                String uploadPath = System.getProperty("user.dir") + "/uploads/post/";
                                File file = new File(uploadPath + existingFile.getFilePath());
                                if(file.exists()) {
                                    boolean deleted = file.delete();
                                    System.out.println("실제 파일 삭제 결과: " + deleted);
                                } else {
                                    System.out.println("실제 파일이 존재하지 않음: " + file.getAbsolutePath());
                                }
                                
                                // DB에서 파일 정보 삭제
                                int deleteResult = postDao.deletePostFile(fileNo);
                                System.out.println("DB 파일 정보 삭제 결과: " + deleteResult);
                            } else {
                                System.out.println("삭제할 파일이 DB에 존재하지 않음: " + fileNo);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("파일 삭제 중 오류 발생: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // 새 파일들 업로드 처리
            if(attachedFiles != null && attachedFiles.length > 0) {
                System.out.println("새 파일들 업로드 시작");
                String uploadPath = System.getProperty("user.dir") + "/uploads/post/";
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) {
                    boolean created = uploadDir.mkdirs();
                    System.out.println("업로드 디렉토리 생성 결과: " + created);
                }
                
                for (int i = 0; i < attachedFiles.length; i++) {
                    MultipartFile file = attachedFiles[i];
                    if (!file.isEmpty()) {
                        try {
                            String originalFilename = file.getOriginalFilename();
                            String savedFilename = System.currentTimeMillis() + "_" + originalFilename;
                            String filePath = uploadPath + savedFilename;
                            
                            System.out.println("파일 " + (i+1) + " 업로드 시작: " + originalFilename);
                            System.out.println("저장 경로: " + filePath);
                            
                            // 파일 저장
                            file.transferTo(new File(filePath));
                            System.out.println("파일 저장 완료: " + savedFilename);
                            
                            // 파일 정보 DB에 저장
                            PostFile postFile = new PostFile();
                            postFile.setPostNo(post.getPostNo());
                            postFile.setFileName(originalFilename);
                            postFile.setFilePath(savedFilename);
                            
                            int insertResult = postDao.insertPostFile(postFile);
                            System.out.println("파일 정보 DB 저장 결과: " + insertResult);
                        } catch (IOException e) {
                            System.out.println("파일 업로드 중 오류 발생: " + e.getMessage());
                            e.printStackTrace();
                            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    // 게시글 삭제
    @Transactional
    public int deletePost(int postNo, String userId) {
        System.out.println("=== PostService.deletePost ===");
        System.out.println("postNo: " + postNo);
        System.out.println("userId: " + userId);
        
        // 작성자 확인
        Post post = postDao.selectOnePost(postNo);
        if(post == null) {
            System.out.println("삭제할 게시글이 존재하지 않음");
            return 0;
        }
        
        System.out.println("게시글 작성자: " + post.getUserId());
        
        // 먼저 첨부파일들 삭제
        try {
            List<PostFile> files = postDao.selectPostFileList(postNo);
            System.out.println("삭제할 첨부파일 개수: " + files.size());
            
            String uploadPath = System.getProperty("user.dir") + "/uploads/post/";
            for(PostFile file : files) {
                // 실제 파일 삭제
                File realFile = new File(uploadPath + file.getFilePath());
                if(realFile.exists()) {
                    boolean deleted = realFile.delete();
                    System.out.println("첨부파일 삭제 결과: " + file.getFileName() + " -> " + deleted);
                } else {
                    System.out.println("첨부파일이 존재하지 않음: " + file.getFileName());
                }
            }
        } catch (Exception e) {
            System.out.println("첨부파일 삭제 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 게시글 삭제 (CASCADE로 첨부파일 정보도 함께 삭제됨)
        int result = postDao.deletePost(postNo);
        System.out.println("게시글 삭제 결과: " + result);
        
        return result;
    }
    
    // 게시글 상태 변경
    @Transactional
    public int updatePostStatus(int postNo, String postStatus) {
        return postDao.updatePostStatus(postNo, postStatus);
    }
    
    // 첨부파일 조회
    public PostFile selectPostFile(int fileNo) {
        return postDao.selectPostFile(fileNo);
    }
    
    // 신고 등록
    @Transactional
    public int insertReport(Report report) {
        // 중복 신고 확인
        int duplicateCount = postDao.checkDuplicateReport(report.getReporterId(), report.getPostType(), report.getPostId());
        if(duplicateCount > 0) {
            // 이미 신고한 경우 -1 반환
            return -1;
        }
        
        // 신고 등록
        return postDao.insertReport(report);
    }
} 