package net.jqube.server.services.shared.impls;

// Exceptions

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

// Services
import net.jqube.server.services.shared.EmailService;

// Deps
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

// Annotation
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String from;

    @Transactional
    public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);
        emailSender.send(message);
    }

    @Transactional
    public void sendWelcomeEmail(String to, String userName, String dashboardUrl) throws MessagingException {
        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("dashboardUrl", dashboardUrl);

        String htmlMessage = templateEngine.process("welcome-email", context);

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject("Welcome to JQube!");
        helper.setText(htmlMessage, true);
        emailSender.send(message);
    }
}