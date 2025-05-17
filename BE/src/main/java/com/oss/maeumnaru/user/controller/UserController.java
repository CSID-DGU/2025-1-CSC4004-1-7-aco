package com.oss.maeumnaru.user.controller;

import com.oss.maeumnaru.global.jwt.JwtTokenProvider;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.global.util.CookieUtils;
import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

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


    // ✅ 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequestDTO dto) {
        userService.signUp(dto);
        return ResponseEntity.ok().build();
    }

    // ✅ 로그인 (JWT + Redis + Cookie)
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto, HttpServletResponse response) {
        TokenResponseDTO token = userService.login(dto, response);
        return ResponseEntity.ok(token);
    }

    // ✅ 로그아웃 (Redis 삭제 + 쿠키 삭제)
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

    // ✅ 마이페이지 - 내 정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<MemberEntity> getUserInfo(@PathVariable Long userId, Authentication authentication) {
        String loginEmail = authentication.getName();

        MemberEntity member = memberRepository.findByEmail(loginEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다."));

        return ResponseEntity.ok(member);
    }

    // ✅ 회원 탈퇴 (Redis 삭제 + 쿠키 삭제 + DB 삭제)
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> withdraw(@PathVariable Long userId, Authentication authentication, HttpServletResponse response) {
        MemberEntity member = memberRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));

        // ✅ Redis 토큰 삭제
        tokenRedisRepository.deleteById(String.valueOf(userId));

        // ✅ 쿠키 삭제
        jwtTokenProvider.clearCookie(response);

        // ✅ 연관된 doctor 또는 patient 먼저 삭제 (FK 제약 회피)
        if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
            DoctorEntity doctor = doctorRepository.findByMember_MemberId(member.getMemberId());
            doctorRepository.delete(doctor);
        } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
            PatientEntity patient = patientRepository.findByMember_MemberId(member.getMemberId());
            patientRepository.delete(patient);
        }


        // ✅ 최종 member 삭제
        memberRepository.delete(member);

        return ResponseEntity.ok().build();
    }

}
