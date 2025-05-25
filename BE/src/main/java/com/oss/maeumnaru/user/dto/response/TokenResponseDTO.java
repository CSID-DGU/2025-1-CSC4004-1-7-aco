package com.oss.maeumnaru.user.dto.response;

public record TokenResponseDTO (
        String accessToken,
        String refreshToken
) {
    public static TokenResponseDTO of(String accessToken, String refreshToken) {
        return new TokenResponseDTO(accessToken, refreshToken);
    }
}
