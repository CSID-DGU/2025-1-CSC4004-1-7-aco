package com.oss.maeumnaru.paint.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponseDto {

    private Long chatId;
    private Date chatDate;
    private String writerType;
    private String comment;
    private Long paintId;
}