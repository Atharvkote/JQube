package net.jqube.server.security.crypto.impls;

import lombok.RequiredArgsConstructor;
import net.jqube.server.configs.properties.EncryptionProperties;
import net.jqube.server.constants.AESConstants;
import net.jqube.server.exceptions.shared.EncryptionException;
import net.jqube.server.security.crypto.EncryptionService;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AESCryptoServiceImpl implements EncryptionService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final EncryptionProperties encryptionProperties;
    private SecretKey secretKey;

    // Initialize the AES secret key from the configured Base64 value.
    @PostConstruct
    private void initialize() {
        byte[] key = Base64.getDecoder().decode(encryptionProperties.getKey());
        this.secretKey = new SecretKeySpec(key, AESConstants.ALGORITHM);
    }

    @Override
    public String encrypt(String plaintext) {

        // Nothing to encrypt.
        if (plaintext == null || plaintext.isBlank()) {
            return null;
        }

        try {
            // Generate a unique IV for every encryption.
            byte[] iv = new byte[AESConstants.IV_SIZE];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AESConstants.TRANSFORMATION);
            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(AESConstants.TAG_LENGTH, iv)
            );

            byte[] cipherText = cipher.doFinal(
                    plaintext.getBytes(StandardCharsets.UTF_8)
            );

            // Store IV together with the encrypted value.
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + cipherText.length);
            buffer.put(iv);
            buffer.put(cipherText);

            return Base64.getEncoder().encodeToString(buffer.array());

        } catch (GeneralSecurityException ex) {
            throw new EncryptionException("Failed to encrypt value.", ex);
        }
    }

    @Override
    public String decrypt(String encryptedValue) {

        // Nothing to decrypt.
        if (encryptedValue == null || encryptedValue.isBlank()) {
            return null;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedValue);

            // Extract the IV from the encrypted payload.
            ByteBuffer buffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[AESConstants.IV_SIZE];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(AESConstants.TRANSFORMATION);
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(AESConstants.TAG_LENGTH, iv)
            );

            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (GeneralSecurityException | IllegalArgumentException ex) {
            throw new EncryptionException("Failed to decrypt value.", ex);
        }
    }

    // Generates a new Base64 encoded 256-bit AES key.
    public static String generateKey() throws GeneralSecurityException {

        KeyGenerator generator = KeyGenerator.getInstance(AESConstants.ALGORITHM);
        generator.init(AESConstants.KEY_SIZE);

        return Base64.getEncoder()
                .encodeToString(generator.generateKey().getEncoded());
    }
}