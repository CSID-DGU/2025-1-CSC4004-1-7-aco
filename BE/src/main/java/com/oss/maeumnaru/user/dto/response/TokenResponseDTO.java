package com.oss.maeumnaru.user.dto.response;

import com.oss.maeumnaru.user.entity.MemberEntity;

public record TokenResponseDTO(
        String accessToken,
        String refreshToken,
        MemberEntity.MemberType memberType
) {
    public static TokenResponseDTO of(String accessToken, String refreshToken, MemberEntity.MemberType memberType) {
        return new TokenResponseDTO(accessToken, refreshToken, memberType);
    }
}

