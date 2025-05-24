package com.oss.maeumnaru.user.dto.request;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequestDTO {
    private String email;
    private String password;
    private String phone;
    private String hospital;
}
