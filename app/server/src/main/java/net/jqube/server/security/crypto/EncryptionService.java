package net.jqube.server.security.crypto;

public interface EncryptionService {

    String encrypt(String plaintext);

    String decrypt(String ciphertext);

}