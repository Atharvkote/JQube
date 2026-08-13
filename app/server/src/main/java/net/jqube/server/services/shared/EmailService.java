package net.jqube.server.services.shared;

import jakarta.mail.MessagingException;

public interface EmailService {

    // verify user
    void sendVerificationEmail(String to, String subject, String text)
            throws MessagingException;

    // welcome user
    void sendWelcomeEmail(String to, String userName, String dashboardUrl)
            throws MessagingException;
}