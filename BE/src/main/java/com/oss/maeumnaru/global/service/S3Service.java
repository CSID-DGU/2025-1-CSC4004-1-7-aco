package com.oss.maeumnaru.global.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;


import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;
    @Value("${cloud.aws.region.static}")
    private String region;
    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        // 고유 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // S3 객체 키: 폴더명/파일명 형태
        String key = folderName + "/" + uniqueFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        // S3 퍼블릭 URL 반환 (버킷 정책에 따라 다름)
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
    }
    public void deleteFile(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }
    private String extractKeyFromUrl(String fileUrl) {
        String prefix = "https://" + bucketName + ".s3." + region + ".amazonaws.com/";
        if (!fileUrl.startsWith(prefix)) {
            throw new IllegalArgumentException("올바른 S3 파일 URL이 아닙니다.");
        }
        return fileUrl.substring(prefix.length());
    }
}