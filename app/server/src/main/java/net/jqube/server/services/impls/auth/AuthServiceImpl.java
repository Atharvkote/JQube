package net.jqube.server.services.impls.auth;

// DTOs
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.dtos.auth.LoginDTO;
import net.jqube.server.dtos.auth.RegisterDTO;
import net.jqube.server.dtos.auth.VerifyUserDTO;

// Enums
import net.jqube.server.enums.RoleName;

// Exceptions
import net.jqube.server.exceptions.InvalidVerificationCodeException;
import net.jqube.server.exceptions.RoleNotFoundException;
import net.jqube.server.exceptions.TokenExpiredException;
import net.jqube.server.exceptions.UserAlreadyExistsException;
import net.jqube.server.exceptions.UserNotFoundException;
import net.jqube.server.exceptions.UserNotVerifiedException;
import jakarta.mail.MessagingException;

// Models
import net.jqube.server.models.Role;
import net.jqube.server.models.User;

// Repositories
import net.jqube.server.repositories.RoleRepository;
import net.jqube.server.repositories.UserRepository;

// Services
import net.jqube.server.services.auth.AuthService;
import net.jqube.server.services.auth.EmailService;

// Deps
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

// Annotations
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Utils
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RoleRepository roleRepository;
    private final TemplateEngine templateEngine;


    public AuthServiceImpl(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       EmailService emailService,
                       RoleRepository roleRepository,
                       TemplateEngine templateEngine
    ){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.roleRepository = roleRepository;
        this.templateEngine = templateEngine;
    }

    public boolean emailExists(String email){
        return userRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public User register(RegisterDTO registerDTO) {
        if (emailExists(registerDTO.getEmail())) {
            throw new UserAlreadyExistsException("Account with this email already exist");
        }
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setEnabled(false);
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationExpiresOn(LocalDateTime.now().plusMinutes(15));

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RoleNotFoundException("ROLE_USER not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        user = userRepository.save(user);
        System.out.println(user);
        sendVerificationEmail(user);
        return user;
    }

    @Transactional
    public User login(LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if(!user.isEnabled()){
            throw new UserNotVerifiedException("User Account Not Verified");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        loginDTO.getPassword()
                )
        );
        return user;
    }

    @Transactional
    public void verifyUser (VerifyUserDTO verifyUserDTO ) {
        User user = userRepository.findByEmail(verifyUserDTO.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found")); // Throws UserNotFoundException if user is not found

        if(user.getVerificationExpiresOn().isAfter(LocalDateTime.now())){
            if(user.getVerificationCode().equals(verifyUserDTO.getVerificationCode())){
                user.setEnabled(true);
                user.setVerificationExpiresOn(null);
                user.setVerificationCode(null);
                userRepository.save(user);
            } else {
                throw new InvalidVerificationCodeException("Invalid verification code");
            }
        } else {
            throw new TokenExpiredException("Verification code has expired");
        }
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found")); // Throws UserNotFoundException if user is not found

        if(user.isEnabled()){
            throw new InvalidVerificationCodeException("User is already verified");
        }
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationExpiresOn(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        sendVerificationEmail(user); // Resend email after updating code
    }


    private void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        Context context = new Context();
        context.setVariable("verificationCode", user.getVerificationCode());
        String htmlMessage = templateEngine.process("verification-email", context);

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            log.error(e.getMessage());
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}