package net.jqube.server.services.impls.auth;

// DTOs
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.dtos.auth.LoginDTO;
import net.jqube.server.dtos.auth.RegisterDTO;
import net.jqube.server.dtos.auth.VerifyUserDTO;

// Enums
import net.jqube.server.enums.SystemRoles;

// Exceptions
import net.jqube.server.exceptions.auth.InvalidVerificationCodeException;
import net.jqube.server.exceptions.auth.RoleNotFoundException;
import net.jqube.server.exceptions.auth.TokenExpiredException;
import net.jqube.server.exceptions.auth.UserAlreadyExistsException;
import net.jqube.server.exceptions.shared.UserNotFoundException;
import net.jqube.server.exceptions.auth.UserNotVerifiedException;
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
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
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

    private static final SecureRandom random = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            EmailService emailService,
            RoleRepository roleRepository,
            TemplateEngine templateEngine) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.roleRepository = roleRepository;
        this.templateEngine = templateEngine;
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public User register(RegisterDTO registerDTO) {

        Optional<User> existingUser = userRepository.findByEmail(registerDTO.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Account already exists and is verified
            if (user.isEnabled()) {
                throw new UserAlreadyExistsException("Account with this email already exists");
            }

            // Account exists but is not verified.
            // Generate a fresh verification code and resend the verification email.
            return regenerateVerification(user);
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setEnabled(false);

        Role userRole = roleRepository.findByName(SystemRoles.ROLE_USER)
                .orElseThrow(() -> new RoleNotFoundException("ROLE_USER not found"));

        user.setRoles(new HashSet<>(Set.of(userRole)));
        user = userRepository.save(user);

        // Generate verification details and send the verification email
        return regenerateVerification(user);
    }

    @Transactional
    public User login(LoginDTO loginDTO) {

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // User must verify their account before logging in
        if (!user.isEnabled()) {
            throw new UserNotVerifiedException("User Account Not Verified");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        loginDTO.getPassword()));

        return user;
    }

    @Transactional
    public void verifyUser(VerifyUserDTO verifyUserDTO) {

        User user = userRepository.findByEmail(verifyUserDTO.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // User has already verified their account
        if (user.isEnabled()) {
            throw new UserAlreadyExistsException("User is already verified");
        }

        // Verification information is missing
        if (user.getVerificationCode() == null || user.getVerificationExpiresOn() == null) {
            throw new InvalidVerificationCodeException("Invalid verification code");
        }

        // Verification code has expired
        if (user.getVerificationExpiresOn().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Verification code has expired");
        }

        // Verification code does not match
        if (!user.getVerificationCode().equals(verifyUserDTO.getVerificationCode())) {
            throw new InvalidVerificationCodeException("Invalid verification code");
        }

        // Verification successful
        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationExpiresOn(null);

        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationCode(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Account is already verified
        if (user.isEnabled()) {
            throw new InvalidVerificationCodeException("User is already verified");
        }

        // Generate a fresh verification code and resend the email
        regenerateVerification(user);
    }

    private User regenerateVerification(User user) {

        // Generate a new verification code valid for 15 minutes
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationExpiresOn(LocalDateTime.now().plusMinutes(15));

        user = userRepository.save(user);

        // Send the verification email
        sendVerificationEmail(user);

        return user;
    }

    private void sendVerificationEmail(User user) {

        String subject = "Account Verification";

        Context context = new Context();
        context.setVariable("verificationCode", user.getVerificationCode());

        String htmlMessage = templateEngine.process("verification-email", context);

        try {
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    subject,
                    htmlMessage);
        } catch (MessagingException e) {

            log.error("Failed to send verification email to {}", user.getEmail(), e);

            // Throw a runtime exception so the transaction rolls back
            throw new RuntimeException("Failed to send verification email.", e);
        }
    }

    private String generateVerificationCode() {

        // Generate a random 6-digit verification code
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}