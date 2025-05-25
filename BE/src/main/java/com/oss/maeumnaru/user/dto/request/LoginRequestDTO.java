package com.oss.maeumnaru.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank String loginId,
        @NotBlank String password
) {}
