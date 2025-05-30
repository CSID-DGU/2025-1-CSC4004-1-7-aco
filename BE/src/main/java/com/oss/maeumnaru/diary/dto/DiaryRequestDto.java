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
    @DateTimeFormat(pattern = "yyyy-MM-dd")  // form-data 요청 대응용
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // JSON 요청 대응용
    private Date createDate;
    // createDate, updateDate, patientCode 는 서버에서 처리하므로 제거
}

