package kr.or.iei.commercial.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.or.iei.commercial.model.dao.CommercialDao;

@Service
public class CommercialService {

	@Autowired
	private CommercialDao dao;
}
