package kr.or.iei.publicservice.model.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.publicservice.model.dto.PublicService;

@Mapper
public interface PublicServiceDao {
    ArrayList<PublicService> selectAll();

    int insertPublicService(PublicService ps);
}
