package com.oss.maeumnaru.global.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SimpleUserPrincipal {
    private final Long memberId;
    private final String LoginId;
}
