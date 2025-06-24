package kr.or.iei.common.filter;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;

public class EncodingFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		// (1) 필터 수행 로직
		request.setCharacterEncoding("utf-8");

		//(2) 지정된 필터가 또 존재할 경우, 해당 필터 실행
		chain.doFilter(request, response);
	}

}
