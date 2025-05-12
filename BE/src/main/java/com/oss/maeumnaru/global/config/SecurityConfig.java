//package com.oss.maeumnaru.global.config;
//
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//
//import java.util.Collections;
//
//@Configuration
//@EnableWebSecurity    // 스프링 시큐리티 필터가 스프링 필터체인에 등록됨.
//@RequiredArgsConstructor
//public class WebSecurityConfig {
//
//    private final JwtTokenProvider jwtTokenProvider;
//
//    @Bean
//    public PasswordEncoder passwordEncoder(){
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http.cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
//            @Override
//            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
//                CorsConfiguration config = new CorsConfiguration();
//                config.setAllowedOrigins(Collections.singletonList("http://localhost:3000/"));
//                config.setAllowedMethods(Collections.singletonList("*"));
//                config.setAllowCredentials(true);
//                config.setAllowedHeaders(Collections.singletonList("*"));
//                config.setMaxAge(3600L); //1시간
//                return config;
//            }
//        }));
//
//        // csrf 토큰 없이 요청하면 해당 요청을 막기 때문에 잠깐 비활성화
//        http.csrf(csrf -> csrf.disable())
//                // 인증절차 설정 시작 => 특정 URL에 대한 권한 설정.
//                .authorizeHttpRequests((requests) -> requests
//
//                        // 모두 허용
//                        // "/api/v1/auth/n/**" 라고 설정해줄 수도 있음. => 사용자 토큰 없이(n) 접근 허용.
//                        .requestMatchers("/api/v1/auth/n/**").permitAll()
//
//                        // 관리자=선생님(ROLE_ADMIN)만 접근 허용
//                        // "/api/v1/auth/admin/**" 라고 설정해줄 수도 있음.
//                        //.requestMatchers("/admin/**").hasRole("ADMIN") => ROLE_ 접두사가 자동으로 들어감.
//                        .requestMatchers("/admin/**").hasAnyAuthority("ROLE_ADMIN")
//
//                        // 로그인한 사용자(ROLE_USER)만 접근 허용
//                        // "/api/v1/auth/y/**" 라고 설정해줄 수도 있음.
//                        .requestMatchers("/api/v1/auth/y/**").hasAnyAuthority("ROLE_USER")
//
//                        // TODO: 최고 권한의 관리자 필요함. ( 필수는 아님. 추후 고려해보기. )
//                        // 나머지 요청은 인증된 사용자에게만 접근 허용
//                        .anyRequest().authenticated()
//                )
//
//                // (버전에 따라 변경된 부분) 기본 로그인 폼을 사용하지 않도록 설정
//                .formLogin((form) -> form.disable())
//                // 로그아웃은 아래 코드 말고 따로 설정할거임.
//                .logout((logout) -> logout.permitAll());   // 로그아웃 허용
//
//        // 필터 통해서 토큰 기반 로그인을 할거다.
//        // UsernamePasswordAuthenticationFilter 이전에 JwtAuthenticationFilter가 실행되도록 등록
//        //http.addFilterBefore(new JwtAuthenticationFilter(JwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
//        //        .addFilterBefore(new JwtExceptionFilter(), JwtAuthenticationFilter.class);
//
//
//        return http.build();
//    }
//
//}