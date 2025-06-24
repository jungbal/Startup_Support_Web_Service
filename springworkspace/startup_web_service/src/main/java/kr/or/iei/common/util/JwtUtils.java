package kr.or.iei.common.util;

import java.util.Calendar;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import kr.or.iei.common.annotation.LogExecutionTime;
import kr.or.iei.common.exception.TokenException;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

	//application.properties에 작성된 값 읽어오기
	@Value("${jwt.secret-key}")
	private String jwtSecretKey;
	@Value("${jwt.expire-minute}")
	private int jwtExpireMinute;
	@Value("${jwt.expire-hour-refresh}")
	private int jwtExpireHourRefresh;
	
	/**
	 * AccessToken 발급 메소드
	 */
	@LogExecutionTime(value = "AccessToken 생성", threshold = 100)
	public String createAccessToken(String memberId, int memberLevel) {
		try {
			//1. 내부에서 사용할 방식으로, 정의한 key 변환
			SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());
			
			//2. 토큰 생성시간 및 만료시간 설정
			Calendar calendar = Calendar.getInstance();		//현재시간
			Date startTime = calendar.getTime();			//현재시간 == 유효 시작시간
			calendar.add(Calendar.MINUTE, jwtExpireMinute);	//현재시간 + 설정된 분 == 유효 만료시간
			Date expireTime = calendar.getTime();
			
			//3. 토큰 생성
			String accessToken = Jwts.builder()				//builder를 이용해 토큰 생성
									.issuedAt(startTime)	//시작시간
									.expiration(expireTime) //만료시간
									.signWith(key)			//암호화 서명
									.claim("memberId", memberId)	//토큰 포함 정보(key ~ value 형태)
									.claim("memberLevel", memberLevel) //토큰 포함 정보(key ~ value 형태)
									.compact();				//생성
			
			log.debug("AccessToken 생성 완료 - 사용자: {}, 만료시간: {}", memberId, expireTime);
			return accessToken;
		} catch (Exception e) {
			log.error("AccessToken 생성 실패 - 사용자: {}, 오류: {}", memberId, e.getMessage());
			throw new TokenException("AccessToken 생성 중 오류가 발생했습니다.", e);
		}
	}
	
		//RefreshToken 발급 메소드
		public String createRefreshToken(String memberId, int memberLevel) {
			//1. 내부에서 사용할 방식으로, 정의한 key 변환
			SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());
			
			//2. 토큰 생성시간 및 만료시간 설정
			
			Calendar calendar = Calendar.getInstance();		//현재시간
			Date startTime = calendar.getTime();			//현재시간 == 유효 시작시간
			calendar.add(Calendar.HOUR, jwtExpireHourRefresh);	//현재시간 + 10분 == 유효 만료시간
			Date expireTime = calendar.getTime();
			
			//3. 토큰 생성
			String refreshToken = Jwts.builder()				//builder를 이용해 토큰 생성
									.issuedAt(startTime)	//시작시간
									.expiration(expireTime) //만료시간
									.signWith(key)			//암호화 서명
									.claim("memberId", memberId)	//토큰 포함 정보(key ~ value 형태)
									.claim("memberLevel", memberLevel) //토큰 포함 정보(key ~ value 형태)
									.compact();				//생성
			
			return refreshToken;
		}
		
		// 토큰에서 Claims 추출하는 공통 메소드
		private Claims getClaims(String token) {
			SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());
			
			// Bearer 토큰에서 실제 토큰 부분만 추출
			if(token != null && token.startsWith("Bearer ")) {
				token = token.substring(7);
			}
			
			return Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(token)
					.getPayload();
		}
		
		// 토큰에서 memberId 추출
		public String getMemberIdFromToken(String token) {
			Claims claims = getClaims(token);
			return claims.get("memberId", String.class);
		}
		
		// 토큰에서 memberLevel 추출
		public int getMemberLevelFromToken(String token) {
			Claims claims = getClaims(token);
			return claims.get("memberLevel", Integer.class);
		}
		
		// 토큰 유효성 검증
		public boolean validateToken(String token) {
			try {
				getClaims(token);
				return true;
			} catch (Exception e) {
				return false;
			}
		}
}
