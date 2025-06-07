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
        UserProfileResponseDTO response = userService.getMyInfo(authentication.getName());
        return ResponseEntity.ok(response);
    }

    // 마이페이지 - 내 정보 수정
    @PutMapping("/me")
    public ResponseEntity<Void> updateMyInfo(
            @RequestBody UserUpdateRequestDTO dto,
            Authentication authentication) {
        userService.updateMyInfo(authentication.getName(), dto);
        return ResponseEntity.ok().build();
    }


    // 회원 탈퇴 (Redis 삭제 + 쿠키 삭제 + DB 삭제)
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdrawMyAccount(Authentication authentication, HttpServletResponse response) {
        userService.withdrawMyAccount(authentication.getName(), response);
        return ResponseEntity.ok().build();
    }
}