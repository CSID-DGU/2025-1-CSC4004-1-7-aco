package com.oss.maeumnaru.user.service;

import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.JwtTokenProvider;
import com.oss.maeumnaru.global.redis.TokenRedis;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.user.dto.request.LoginRequestDTO;
import com.oss.maeumnaru.user.dto.request.SignUpRequestDTO;
import com.oss.maeumnaru.user.dto.request.UserUpdateRequestDTO;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import com.oss.maeumnaru.user.dto.response.UserProfileResponseDTO;
import com.oss.maeumnaru.user.entity.*;
import com.oss.maeumnaru.user.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
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
    private final PasswordEncoder passwordEncoder;


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
            if (memberRepository.findByLoginId(dto.loginId()).isPresent()) {
                throw new ApiException(ExceptionEnum.DUPLICATE_LOGIN_ID);
            }

            if (memberRepository.findByEmail(dto.email()).isPresent()) {
                throw new ApiException(ExceptionEnum.DUPLICATE_EMAIL);
            }

            MemberEntity member = MemberEntity.builder()
                    .name(dto.name())
                    .email(dto.email())
                    .loginId(dto.loginId())
                    .password(passwordEncoder.encode(dto.password()))
                    .phone(dto.phone())
                    .birthDate(dto.birthDate())
                    .gender(dto.gender())
                    .memberType(dto.memberType())
                    .createDate(new Date())
                    .build();


            member = memberRepository.save(member);

            if (dto.memberType() == MemberEntity.MemberType.DOCTOR) {
                if (dto.licenseNumber() == null || dto.licenseNumber().isBlank()) {
                    throw new ApiException(ExceptionEnum.MISSING_LICENSE_NUMBER);
                }
                if (file == null || file.isEmpty()) {
                    throw new ApiException(ExceptionEnum.FILE_REQUIRED);
                }
                String dateStr = new SimpleDateFormat("yyyy-MM-dd").format(member.getCreateDate());
                String fileUrl = s3Service.uploadFile(file, "doctor/" + dto.licenseNumber(), dateStr);

                DoctorEntity doctor = DoctorEntity.builder()
                        .licenseNumber(dto.licenseNumber())
                        .hospital(dto.hospital())
                        .certificationPath(fileUrl)
                        .member(member)
                        .build();

                doctorRepository.save(doctor);

            } else if (dto.memberType() == MemberEntity.MemberType.PATIENT) {
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

            } else {
                throw new ApiException(ExceptionEnum.INVALID_MEMBER_TYPE);
            }


        } catch (ApiException e) {
            throw e;
        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SIGNUP_FAILED);
        }
    }
    public TokenResponseDTO login(LoginRequestDTO dto, HttpServletResponse response) {
        try {
            MemberEntity member = memberRepository.findByLoginId(dto.loginId())
                    .orElseThrow(() -> new ApiException(ExceptionEnum.USER_NOT_FOUND));

            if (!passwordEncoder.matches(dto.password(), member.getPassword())) {
                throw new ApiException(ExceptionEnum.INVALID_PASSWORD);
            }

            // 인증 객체 생성
            CustomUserDetails customUserDetails = new CustomUserDetails(
                    member.getMemberId(),
                    member.getLoginId(),
                    member.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + member.getMemberType()))
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    customUserDetails,
                    null,
                    customUserDetails.getAuthorities()
            );


            // JWT 토큰 생성
            // 토큰 생성
            JwtTokenProvider.TokenPair tokenPair = jwtTokenProvider.generateTokenPair(authentication);


            // Redis 저장
            tokenRedisRepository.save(new TokenRedis(
                    authentication.getName(),
                    tokenPair.accessToken(),
                    tokenPair.refreshToken()
            ));


            // 쿠키 저장
            jwtTokenProvider.saveCookie(response, tokenPair.accessToken());

            return TokenResponseDTO.of(
                    tokenPair.accessToken(),
                    tokenPair.refreshToken(),
                    member.getMemberType(),
                    member.getName()
            );

        } catch (ApiException e) {
            throw e;
        }
//        catch (Exception e) {
//            throw new ApiException(ExceptionEnum.LOGIN_FAILED);
//        }
    }
    public UserProfileResponseDTO getMyInfo(String loginId) {
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.USER_NOT_FOUND));

        String hospital = null;
        String patientCode = null;

        if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
            hospital = doctorRepository.findByMember_MemberId(member.getMemberId())
                    .map(DoctorEntity::getHospital)
                    .orElse(null);
        } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
            hospital = patientRepository.findByMember_MemberId(member.getMemberId())
                    .map(PatientEntity::getPatientHospital)
                    .orElse(null);
            patientCode = patientRepository.findByMember_MemberId(member.getMemberId())
                    .map(PatientEntity::getPatientCode)
                    .orElse(null);
        }

        return UserProfileResponseDTO.builder()
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
    }

    public void updateMyInfo(String loginId, UserUpdateRequestDTO dto) {
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.USER_NOT_FOUND));

        if (dto.getEmail() != null) member.setEmail(dto.getEmail());
        if (dto.getPassword() != null) member.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (dto.getPhone() != null) member.setPhone(dto.getPhone());

        if (dto.getHospital() != null) {
            if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
                doctorRepository.findByMember_MemberId(member.getMemberId())
                        .ifPresentOrElse(
                                doctor -> {
                                    doctor.setHospital(dto.getHospital());
                                    doctorRepository.save(doctor);
                                },
                                () -> { throw new ApiException(ExceptionEnum.DOCTOR_NOT_FOUND); }
                        );
            } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
                patientRepository.findByMember_MemberId(member.getMemberId())
                        .ifPresentOrElse(
                                patient -> {
                                    patient.setPatientHospital(dto.getHospital());
                                    patientRepository.save(patient);
                                },
                                () -> { throw new ApiException(ExceptionEnum.PATIENT_NOT_FOUND); }
                        );
            }
        }

        memberRepository.save(member);
    }

    public void withdrawMyAccount(String loginId, HttpServletResponse response) {
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.USER_NOT_FOUND));

        if (member.getMemberType() == MemberEntity.MemberType.DOCTOR) {
            DoctorEntity doctor = doctorRepository.findByMember_MemberId(member.getMemberId())
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DOCTOR_NOT_FOUND));
            s3Service.deleteFolder("doctor/" + doctor.getLicenseNumber() + "/");
        } else if (member.getMemberType() == MemberEntity.MemberType.PATIENT) {
            PatientEntity patient = patientRepository.findByMember_MemberId(member.getMemberId())
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));
            s3Service.deleteFolder("patient/" + patient.getPatientCode() + "/");
        }

        tokenRedisRepository.deleteById(member.getLoginId());
        jwtTokenProvider.clearCookie(response);
        memberRepository.delete(member);
    }
}
