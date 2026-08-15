package net.jqube.server.constants;

public final class AESConstants {

    // Algorithm
    public static final String ALGORITHM = "AES";

    // Padding
    public static final String TRANSFORMATION = "AES/GCM/NoPadding";

    // Constants
    public static final int KEY_SIZE = 256;
    public static final int IV_SIZE = 12;
    public static final int TAG_LENGTH = 128;
}
