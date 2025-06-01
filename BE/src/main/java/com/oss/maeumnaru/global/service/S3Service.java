package com.oss.maeumnaru.global.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;


import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public String uploadFile(MultipartFile file, String folderName, String date) throws IOException {
        // 원본 확장자 추출
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        // 날짜 기반 파일명 생성
        String fileName = date + extension;  // 예: 2025-05-29.jpg

        // S3 key 생성: 폴더명/날짜.확장자
        String key = folderName + "/" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

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
    public void deleteFolder(String folderPrefix) {
        // folderPrefix 예: "doctor/LICENSENUMBER/"

        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(folderPrefix)
                .build();

        ListObjectsV2Response listRes = s3Client.listObjectsV2(listReq);
        List<S3Object> objects = listRes.contents();

        if (objects.isEmpty()) {
            return; // 삭제할 파일 없음
        }

        List<ObjectIdentifier> toDelete = objects.stream()
                .map(obj -> ObjectIdentifier.builder().key(obj.key()).build())
                .collect(Collectors.toList());

        DeleteObjectsRequest deleteReq = DeleteObjectsRequest.builder()
                .bucket(bucketName)
                .delete(Delete.builder().objects(toDelete).build())
                .build();

        s3Client.deleteObjects(deleteReq);
    }
}