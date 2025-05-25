package com.oss.maeumnaru.paint.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
@Setter
public class PaintRequestDto {
    private Long patientCode;
    private String title;

}
