package com.oss.maeumnaru.paint.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.Date;

@NoArgsConstructor
@Getter
@Setter
public class PaintRequestDto {
    private String title;
    private String createDate;
}
