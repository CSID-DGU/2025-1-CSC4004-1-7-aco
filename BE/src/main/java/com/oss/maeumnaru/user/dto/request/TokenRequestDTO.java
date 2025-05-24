package com.oss.maeumnaru.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TokenRequestDTO(
        @NotBlank
        String accessToken,
        @NotBlank
        String refreshToken
) {
}
