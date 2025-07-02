package kr.or.iei.market.controller;


import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
	
	
	//마켓글 조회
	@GetMapping("/list/{reqPage}")
	@NoTokenCheck
	public ResponseEntity<ResponseDTO> selectMarketList(@PathVariable int reqPage){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"마켓글 조회 중 오류가 발생하였습니다",null,"error");
		
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
														@ModelAttribute Market market){
															
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 등록 중 오류가 발생하였습니다",false,"error");
		System.out.println(market.getUserId());
		
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
					
					fileList.add(file);
				}
			}
			//DB에 게시글 정보 등록
			int result = service.insertBoard(market, fileList);
			
			if(result>0) {
				res= new ResponseDTO(HttpStatus.OK,"게시글이 등록되었습니다",true,"success");
			}
			
		}catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
	
}
