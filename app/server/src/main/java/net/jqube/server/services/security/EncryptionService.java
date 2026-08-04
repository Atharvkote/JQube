package net.jqube.server.services.security;

public interface EncryptionService {

    String encrypt(String plaintext);

    String decrypt(String ciphertext);

}