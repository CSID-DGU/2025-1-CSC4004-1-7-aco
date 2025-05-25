package com.oss.maeumnaru.diary.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryRequestDto {

    private String title;

    // createDate, updateDate, patientCode 는 서버에서 처리하므로 제거
}

