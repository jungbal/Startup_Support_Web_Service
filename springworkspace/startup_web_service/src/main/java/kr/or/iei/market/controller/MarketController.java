package kr.or.iei.market.controller;


import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.common.dto.ResponseDTO;
import kr.or.iei.common.util.FileUtil;
import kr.or.iei.market.model.dto.MarketFile;
import kr.or.iei.market.model.service.MarketService;
import kr.or.iei.member.model.dto.Market;

@RestController
@CrossOrigin("*")
@RequestMapping("/market")
public class MarketController {
	
	@Autowired
	private MarketService service;
	
	@Autowired
	private FileUtil fileUtil;
	
	@Value("${file.uploadPath}")
	private String uploadPath; //C:/Start_Support_Img/market
	
	
	//마켓글 전체 조회
	@GetMapping("/list/{reqPage}")
	@NoTokenCheck
	public ResponseEntity<ResponseDTO> selectMarketList(@PathVariable int reqPage){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"마켓글 전체조회 중 오류가 발생하였습니다",null,"error");
		
		try {
			HashMap<String, Object> marketList=service.selectMarketList(reqPage);
			res = new ResponseDTO(HttpStatus.OK,"", marketList, "");
			
			
		}catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	//마켓글 작성
	@PostMapping
	public ResponseEntity<ResponseDTO> insertMarket(@ModelAttribute MultipartFile[] marketFile,
														@ModelAttribute Market market,
														@RequestParam(required = false) String[] isMainFile, //null값 들어와도 에러 안뜨게 방지
														@RequestParam(required = false) int[] fileOrder){
															
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 등록 중 오류가 발생하였습니다",false,"error");
	
		try {
			ArrayList<MarketFile>fileList=new ArrayList<>();
			
			//첨부파일 업로드 
			if(marketFile!=null) {
				for(int i=0; i<marketFile.length;i++) {
					MultipartFile mFile=marketFile[i];//첨부파일 1개
					
					String filePath=fileUtil.uploadFile(mFile, "/postFile/"); //파일 업로드
					MarketFile file = new MarketFile();
					file.setFileName(mFile.getOriginalFilename()); //사용자가 업로드한 실제 파일명
					file.setFilePath(filePath);					   //서버 저장 파일명
					
					if(fileOrder != null) { // null값이 아니라면 파일 순서 저장  
						file.setFileOrder(fileOrder[i]);
					}
					if (isMainFile != null) {// null값이 아니라면 메인 파일 여부 저장
			            file.setIsMainFile(isMainFile[i]);
			        }
					
					fileList.add(file); //DB에 추가할 파일들 리스트 완성
				}
			}
			//DB에 게시글 정보 등록
			int result = service.insertMarket(market, fileList);
			
			if(result>0) {
				res= new ResponseDTO(HttpStatus.OK,"게시글이 등록되었습니다",true,"success");
			}
			
		}catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	//마켓글 1개 상세조회
	@GetMapping("/{marketNo}")
	@NoTokenCheck
	public ResponseEntity<ResponseDTO> selectOneMarket(@PathVariable int marketNo){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 상세정보 조회 중 오류가 발생하였습니다",null,"error");
		try {
			Map<String, Object> marketData =service.selectOneMarket(marketNo);
			
			res= new ResponseDTO(HttpStatus.OK,"",marketData ,"");
		}catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	//게시글 삭제
	@DeleteMapping("/{marketNo}")
	public ResponseEntity<ResponseDTO> deleteMarket(@PathVariable int marketNo){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 삭제 중 오류가 발생하였습니다",null,"error");
		try {
			//서버에서 삭제
			Market market=service.deleteMarket(marketNo);
			
			//파일 삭제
			if(market!=null) {
				List<MarketFile> delFileList = market.getFileList();
				if(delFileList != null) {
					String savePath= uploadPath +"/postFile/";
					for(MarketFile m : delFileList) {
						File file = new File(savePath + m.getFilePath().substring(0,8) + File.separator + m.getFilePath());
		
						if(file.exists()) {
							file.delete();
						}
					}
				}
				res= new ResponseDTO(HttpStatus.OK,"게시글이 삭제되었습니다",true,"success");
			}

		}catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
		
	}
	
	//게시글 수정
	@PatchMapping
	public ResponseEntity<ResponseDTO> updateMarket(@ModelAttribute MultipartFile [] marketFile, //추가 첨부파일
													@ModelAttribute Market market,	//수정된 게시글 정보 + 삭제할 파일 번호 리스트
													@RequestParam(required = false) String[] isMainFile, //메인파일 여부
												    @RequestParam(required = false) Integer[] fileOrder,//파일순서
												    @RequestParam(required = false) Integer[] marketFileNo, //수정할 파일 넘버 리스트
												    @RequestParam String[] fileType //이미지 타입(old, new)
													){	
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 수정 중 오류가 발생하였습니다",false,"error");
		
		try {
			
			int newFileIndex = 0; //파일들 들어있는 객체 인덱스값 // fileType와 marketFile의 길이가 맞지 않기 때문
			
			ArrayList<MarketFile> allFileList= new ArrayList<MarketFile>();
			
			for(int i=0; i<fileType.length;i++) {					
				MarketFile file = new MarketFile();
				
				file.setMarketNo(market.getMarketNo());			//게시글 번호
				file.setFileOrder(fileOrder[i]);				//이미지 순서
				file.setIsMainFile(isMainFile[i]);				//메인이미지 여부
				file.setFileType(fileType[i]);					//new old 이미지 여부
				
                if(fileType[i].equals("new")) {//새롭게 추가하는 이미지 일때 
                	String filePath=fileUtil.uploadFile(marketFile[i], "/postFile/"); //파일 업로드
                	file.setFilePath(filePath);	//서버 저장 파일명
                	file.setFileName(marketFile[newFileIndex].getOriginalFilename()); //사용자가 업로드한 실제 파일명
                	newFileIndex++;
                	
                }else if(fileType[i].equals("old")) {//기존 이미지 순서 업데이트
                	file.setFileNo(marketFileNo[i]);
                }

				allFileList.add(file);
			}
			market.setFileList(allFileList); //업로드할 파일 정보 세팅
			
			
			//DB에 업데이트
			ArrayList<MarketFile> delFileList=service.updateMarket(market);
			
			//삭제할 파일이 있는 경우 저장된 사진 지워줌
			if(delFileList != null) {
				String savePath= uploadPath + "/postFile/";
				
				for(int i=0; i<delFileList.size();i++) {
					MarketFile delFile = delFileList.get(i);
					
					File file= new File(savePath +delFile.getFilePath().substring(0,8)+File.separator+delFile.getFilePath());
					if(file.exists()) {
						file.delete();
					}
				}
			}
			res=new ResponseDTO(HttpStatus.OK,"게시글이 정상적으로 수정 되었습니다",true, "success");
		}catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
}	
