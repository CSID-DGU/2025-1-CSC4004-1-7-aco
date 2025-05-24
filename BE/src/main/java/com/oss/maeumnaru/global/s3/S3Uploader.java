package com.oss.maeumnaru.global.s3;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String uploadTextAsFile(String content, String fileName, String dirName) throws IOException {
        // 확장자 누락 방지
        if (!fileName.endsWith(".txt")) {
            fileName += ".txt";
        }

        // 디렉토리 경로 정리 (슬래시 중복/누락 방지)
        String sanitizedDir = dirName.endsWith("/") ? dirName : dirName + "/";
        String sanitizedFile = fileName.startsWith("/") ? fileName.substring(1) : fileName;
        String fullPath = sanitizedDir + sanitizedFile;

        // 텍스트 내용을 바이트 배열로 변환
        byte[] contentBytes = content.getBytes(StandardCharsets.UTF_8);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(contentBytes.length);
        metadata.setContentType("text/plain");

        try (InputStream inputStream = new ByteArrayInputStream(contentBytes)) {
            amazonS3.putObject(bucket, fullPath, inputStream, metadata);
        }

        // 파일 URL 반환 (퍼블릭 권한이 없으면 접근 불가할 수 있음)
        return amazonS3.getUrl(bucket, fullPath).toString();
    }
}
