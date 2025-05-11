package com.oss.maeumnaru.user.entity;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "refreshToken", timeToLive = 604800) // 7일 TTL
public class RefreshTokenInfo {

    @Id
    private String username; // 사용자 식별자
    private String refreshToken;
}
