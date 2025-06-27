package kr.or.iei.market.model.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.member.model.dto.Market;

@Mapper
public interface MarketDao {

	ArrayList<Market> selectMarketList();

}
