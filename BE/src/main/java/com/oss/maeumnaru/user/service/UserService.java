package com.oss.maeumnaru.user.service;

import com.oss.maeumnaru.global.jwt.JwtTokenProvider;
import com.oss.maeumnaru.global.redis.TokenRedis;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import com.oss.maeumnaru.user.entity.*;
import com.oss.maeumnaru.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class UserService {

    private final MemberRepository memberRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRedisRepository tokenRedisRepository;

    public void signUp(SignUpRequestDTO dto) {
        try {
            System.out.println("회원가입 요청 들어옴: " + dto);

            MemberEntity member = MemberEntity.builder()
                    .name(dto.name())
                    .email(dto.email())
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

                DoctorEntity doctor = DoctorEntity.builder()
                        .licenseNumber(dto.licenseNumber())
                        .hospital(dto.hospital())
                        .certificationPath(dto.certificationPath())
                        .member(member)
                        .build();

                doctorRepository.save(doctor);

            } if (dto.memberType() == MemberEntity.MemberType.DOCTOR) {
                System.out.println("DOCTOR 처리 중");
                DoctorEntity doctor = DoctorEntity.builder()
                        .licenseNumber(dto.licenseNumber())   // ✅ 필수
                        .hospital(dto.hospital())
                        .certificationPath(dto.certificationPath())
                        .member(member)
                        .build();
                doctorRepository.save(doctor);
            } else {
                System.out.println("PATIENT 처리 중");
                PatientEntity patient = PatientEntity.builder()
                        .patientCode(dto.patientCode())
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

    public TokenResponseDTO login(LoginRequestDTO dto) {
        try {
            System.out.println("로그인 요청: " + dto.email());

            MemberEntity member = memberRepository.findByEmail(dto.email())
                    .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 회원이 존재하지 않습니다."));

            System.out.println("DB에서 찾은 사용자: " + member.getEmail());

            if (!member.getPassword().equals(dto.password())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }

            // 인증 객체 수동 생성
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    member.getEmail(), member.getPassword()
            );

            System.out.println("Authentication 객체 생성 완료: " + authentication.getName());

            // JWT 토큰 생성
            TokenResponseDTO tokenInfo = jwtTokenProvider.generateToken(authentication);

            System.out.println("토큰 생성 완료: access = " + tokenInfo.accessToken());

            // Redis 저장
            tokenRedisRepository.save(new TokenRedis(
                    authentication.getName(),
                    tokenInfo.accessToken(),
                    tokenInfo.refreshToken()
            ));

            System.out.println("Redis 저장 완료");

            return tokenInfo;

        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 전체 에러 스택 출력
            throw new RuntimeException("로그인 중 오류 발생: " + e.getMessage());
        }
    }



}
