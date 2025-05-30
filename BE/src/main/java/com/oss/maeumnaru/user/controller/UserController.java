package com.oss.maeumnaru.user.controller;

import com.oss.maeumnaru.global.jwt.JwtTokenProvider;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.global.util.CookieUtils;
import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.request.UserUpdateRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import com.oss.maeumnaru.user.dto.response.UserProfileResponseDTO;
import com.oss.maeumnaru.user.entity.MemberEntity;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.repository.MemberRepository;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import com.oss.maeumnaru.user.repository.PatientRepository;
import com.oss.maeumnaru.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TokenRedisRepository tokenRedisRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;


    //회원가입
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> signUp(
            @ModelAttribute SignUpRequestDTO dto,
            @RequestPart(required = false) MultipartFile file // 의사 면허증 이미지
    ) throws IOException {
        userService.signUp(dto, file);
        return ResponseEntity.ok().build();
    }


    // 로그인 (JWT + Redis + Cookie)
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto, HttpServletResponse response) {
        TokenResponseDTO token = userService.login(dto, response);
        return ResponseEntity.ok(token);
    }

    // 로그아웃 (Redis 삭제 + 쿠키 삭제)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Optional<Cookie> accessToken = CookieUtils.getCookie(request, "accessToken");

        accessToken.ifPresent(cookie -> {
            tokenRedisRepository.findByAccessToken(cookie.getValue())
                    .ifPresent(tokenRedisRepository::delete);
            jwtTokenProvider.clearCookie(response);
        });

        return ResponseEntity.ok().build();
    }

    // 마이페이지 - 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyInfo(Authentication authentication) {
        System.out.println("authentication = " + authentication);
        System.out.println("authentication.getPrincipal() = " + authentication.getPrincipal());
        System.out.println("authentication.getName() = " + authentication.getName());

        String loginId = authentication.getName();

        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다."));

        String hospital = null;
        String patientCode = null;  // 기본 null

        if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
            // 환자 병원명 조회
            hospital = doctorRepository.findByMember_MemberId(member.getMemberId())
                    .map(DoctorEntity::getHospital)
                    .orElse(null);

        } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
            hospital = patientRepository.findByMember_MemberId(member.getMemberId())
                    .map(PatientEntity::getPatientHospital)
                    .orElse(null);
            // 환자코드 조회
            patientCode = patientRepository.findByMember_MemberId(member.getMemberId())
                    .map(PatientEntity::getPatientCode)
                    .orElse(null);
        }

        UserProfileResponseDTO response = UserProfileResponseDTO.builder()
                .memberId(member.getMemberId())
                .name(member.getName())
                .loginId(member.getLoginId())
                .email(member.getEmail())
                .phone(member.getPhone())
                .gender(String.valueOf(member.getGender()))
                .memberType(member.getMemberType().name())
                .birthDate(member.getBirthDate() != null ? member.getBirthDate().toString() : null)
                .createDate(member.getCreateDate() != null ? member.getCreateDate().toString() : null)
                .hospital(hospital)
                .patientCode(patientCode)
                .build();

        return ResponseEntity.ok(response);
    }



    @PutMapping("/me")
    public ResponseEntity<Void> updateMyInfo(
            @RequestBody UserUpdateRequestDTO dto,
            Authentication authentication) {

        String loginId = authentication.getName();
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));

        if (dto.getEmail() != null) member.setEmail(dto.getEmail());

        if (dto.getPassword() != null) {
            // 🔒 비밀번호 암호화 후 저장
            member.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getPhone() != null) member.setPhone(dto.getPhone());

        if (dto.getHospital() != null) {
            if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
                doctorRepository.findByMember_MemberId(member.getMemberId()).ifPresent(doctor -> {
                    doctor.setHospital(dto.getHospital());
                    doctorRepository.save(doctor);
                });
            } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
                patientRepository.findByMember_MemberId(member.getMemberId()).ifPresent(patient -> {
                    patient.setPatientHospital(dto.getHospital());
                    patientRepository.save(patient);
                });
            }
        }

        memberRepository.save(member);
        return ResponseEntity.ok().build();
    }




    // 회원 탈퇴 (Redis 삭제 + 쿠키 삭제 + DB 삭제)
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdrawMyAccount(Authentication authentication, HttpServletResponse response) {
        String loginId = authentication.getName();
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));

        // Redis 토큰 삭제
        tokenRedisRepository.deleteById(String.valueOf(member.getMemberId()));

        // 쿠키 삭제
        jwtTokenProvider.clearCookie(response);

        // 연관된 doctor 또는 patient 먼저 삭제
        if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
            DoctorEntity doctor = doctorRepository.findByMember_MemberId(member.getMemberId())
                    .orElseThrow(() -> new RuntimeException("해당 의사를 찾을 수 없습니다."));
            if (doctor.getCertificationPath() != null) {
                s3Service.deleteFile(doctor.getCertificationPath());
            }
            doctorRepository.delete(doctor);
        } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
            PatientEntity patient = patientRepository.findByMember_MemberId(member.getMemberId())
                    .orElseThrow(() -> new RuntimeException("해당 환자를 찾을 수 없습니다."));
            patientRepository.delete(patient);
        }

        memberRepository.delete(member);
        return ResponseEntity.ok().build();
    }


}
