package com.oss.maeumnaru.global.config;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long memberId;           // ✅ 커스텀 필드
    private final String loginId;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long memberId, String loginId, String password,
                             Collection<? extends GrantedAuthority> authorities) {
        this.memberId = memberId;
        this.loginId = loginId;
        this.password = password;
        this.authorities = authorities;
    }

    @Override
    public String getUsername() {
        return loginId; // 또는 email 등
    }

    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}