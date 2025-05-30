package com.oss.maeumnaru.diary.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryRequestDto {

    private String title;
    private Date createDate;
    // createDate, updateDate, patientCode 는 서버에서 처리하므로 제거
}

