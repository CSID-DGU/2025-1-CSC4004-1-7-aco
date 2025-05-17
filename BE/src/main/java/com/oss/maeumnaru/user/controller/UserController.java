package com.oss.maeumnaru.user.controller;

import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import com.oss.maeumnaru.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequestDTO dto) {
        userService.signUp(dto);
        return ResponseEntity.ok().build();
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto, HttpServletResponse response) {
        TokenResponseDTO token = userService.login(dto, response);
        return ResponseEntity.ok(token);
    }
}
