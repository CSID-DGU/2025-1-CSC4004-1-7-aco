package com.oss.maeumnaru.user.service;

import com.oss.maeumnaru.global.jwt.JwtTokenProvider;
import com.oss.maeumnaru.global.redis.TokenRedis;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import com.oss.maeumnaru.user.entity.*;
import com.oss.maeumnaru.user.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final MemberRepository memberRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRedisRepository tokenRedisRepository;
    private final S3Service s3Service;


    private String generatePatientCode(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }

        return code.toString();
    }


    public void signUp(SignUpRequestDTO dto, MultipartFile file) throws IOException {
        try {
            System.out.println("회원가입 요청 들어옴: " + dto);

            MemberEntity member = MemberEntity.builder()
                    .name(dto.name())
                    .email(dto.email())
                    .loginId(dto.loginId())
                    .password(dto.password())
                    .phone(dto.phone())
                    .birthDate(dto.birthDate())
                    .gender(dto.gender())
                    .memberType(dto.memberType())
                    .createDate(new Date())
                    .build();

            System.out.println("MemberEntity 생성 완료: " + member);

            member = memberRepository.save(member);

            if (dto.memberType() == MemberEntity.MemberType.DOCTOR) {
                System.out.println("DOCTOR 처리 중");

                if (dto.licenseNumber() == null || dto.licenseNumber().isBlank()) {
                    throw new IllegalArgumentException("의사의 licenseNumber는 필수입니다.");
                }

                String fileUrl = (file != null && !file.isEmpty())
                        ? s3Service.uploadFile(file, "doctor-license")
                        : null;

                DoctorEntity doctor = DoctorEntity.builder()
                        .licenseNumber(dto.licenseNumber())
                        .hospital(dto.hospital())
                        .certificationPath(fileUrl)
                        .member(member)
                        .build();

                doctorRepository.save(doctor);

            } else {
                System.out.println("PATIENT 처리 중");
                String randomPatientCode;
                do {
                    randomPatientCode = generatePatientCode(6);
                } while (patientRepository.existsById(randomPatientCode));

                PatientEntity patient = PatientEntity.builder()
                        .patientCode(randomPatientCode)
                        .patientHospital(dto.hospital())
                        .member(member)
                        .build();

                patientRepository.save(patient);

            }

            System.out.println("회원가입 처리 완료");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("회원가입 중 오류 발생: " + e.getMessage());
        }
    }
    public TokenResponseDTO login(LoginRequestDTO dto, HttpServletResponse response) {
        try {
            System.out.println("로그인 요청: " + dto.loginId());

            MemberEntity member = memberRepository.findByLoginId(dto.loginId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 아이디의 회원이 존재하지 않습니다."));


            System.out.println("DB에서 찾은 사용자: " + member.getEmail());

            if (!member.getPassword().equals(dto.password())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }

            // 인증 객체 생성
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    member.getEmail(), member.getPassword()
            );

            System.out.println("Authentication 객체 생성 완료: " + authentication.getName());

            // JWT 토큰 생성
            // ✅ 토큰 생성
            JwtTokenProvider.TokenPair tokenPair = jwtTokenProvider.generateTokenPair(authentication);

            System.out.println("토큰 생성 완료: access = " + tokenPair.accessToken());

            // Redis 저장
            tokenRedisRepository.save(new TokenRedis(
                    authentication.getName(),
                    tokenPair.accessToken(),
                    tokenPair.refreshToken()
            ));

            System.out.println("Redis 저장 완료");

            // 쿠키 저장
            jwtTokenProvider.saveCookie(response, tokenPair.accessToken());

            return TokenResponseDTO.of(
                    tokenPair.accessToken(),
                    tokenPair.refreshToken(),
                    member.getMemberType()
            );

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("로그인 중 오류 발생: " + e.getMessage());
        }
    }
}
