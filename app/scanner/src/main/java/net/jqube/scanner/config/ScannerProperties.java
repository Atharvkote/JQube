package net.jqube.scanner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties(prefix = "jqube.scanner")
public class ScannerProperties {

    @DefaultValue("/tmp/jqube/scans")
    private String workspaceRoot;

    @DefaultValue("5m")
    private Duration gitTimeout;

    @DefaultValue("10m")
    private Duration semgrepTimeout;

    @DefaultValue("10m")
    private Duration trivyTimeout;

    @DefaultValue("10m")
    private Duration gitleaksTimeout;

    @DefaultValue("git")
    private String gitBinary;

    @DefaultValue("semgrep")
    private String semgrepBinary;

    @DefaultValue("trivy")
    private String trivyBinary;

    @DefaultValue("gitleaks")
    private String gitleaksBinary;

    public String getWorkspaceRoot() {
        return workspaceRoot;
    }

    public void setWorkspaceRoot(String workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }

    public Duration getGitTimeout() {
        return gitTimeout;
    }

    public void setGitTimeout(Duration gitTimeout) {
        this.gitTimeout = gitTimeout;
    }

    public Duration getSemgrepTimeout() {
        return semgrepTimeout;
    }

    public void setSemgrepTimeout(Duration semgrepTimeout) {
        this.semgrepTimeout = semgrepTimeout;
    }

    public Duration getTrivyTimeout() {
        return trivyTimeout;
    }

    public void setTrivyTimeout(Duration trivyTimeout) {
        this.trivyTimeout = trivyTimeout;
    }

    public Duration getGitleaksTimeout() {
        return gitleaksTimeout;
    }

    public void setGitleaksTimeout(Duration gitleaksTimeout) {
        this.gitleaksTimeout = gitleaksTimeout;
    }

    public String getGitBinary() {
        return gitBinary;
    }

    public void setGitBinary(String gitBinary) {
        this.gitBinary = gitBinary;
    }

    public String getSemgrepBinary() {
        return semgrepBinary;
    }

    public void setSemgrepBinary(String semgrepBinary) {
        this.semgrepBinary = semgrepBinary;
    }

    public String getTrivyBinary() {
        return trivyBinary;
    }

    public void setTrivyBinary(String trivyBinary) {
        this.trivyBinary = trivyBinary;
    }

    public String getGitleaksBinary() {
        return gitleaksBinary;
    }

    public void setGitleaksBinary(String gitleaksBinary) {
        this.gitleaksBinary = gitleaksBinary;
    }
}
