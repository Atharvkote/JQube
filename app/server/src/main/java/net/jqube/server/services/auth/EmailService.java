package net.jqube.server.services.auth;

import jakarta.mail.MessagingException;

public interface EmailService {

    void sendVerificationEmail(String to, String subject, String text)
            throws MessagingException;
}