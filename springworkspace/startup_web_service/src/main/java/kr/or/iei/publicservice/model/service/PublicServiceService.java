package kr.or.iei.publicservice.model.service;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import kr.or.iei.publicservice.model.dao.PublicServiceDao;
import kr.or.iei.publicservice.model.dto.PublicService;

@Service
public class PublicServiceService {

    @Autowired
    private PublicServiceDao dao;

    // DB 전체 조회
    public ArrayList<PublicService> selectAll() {
        return dao.selectAll();
    }
}
