package com.oss.maeumnaru.diary.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;



import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryRequestDto {

    private String title;

    private String createDate;
    // createDate, updateDate, patientCode 는 서버에서 처리하므로 제거
}

