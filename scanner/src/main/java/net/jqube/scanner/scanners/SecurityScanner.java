package net.jqube.scanner.scanners;

import net.jqube.scanner.queues.messages.ScanFinding;

import java.nio.file.Path;
import java.util.List;

public interface SecurityScanner {

    String getName();

    ScannerOutput scan(Path workspace);
}
