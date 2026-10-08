package net.jqube.scanner.configs.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "jqube.scanner")
public class ScannerProperties {

    private Workspace workspace = new Workspace();
    private Timeout timeout = new Timeout();
    private Tools tools = new Tools();

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public Timeout getTimeout() {
        return timeout;
    }

    public void setTimeout(Timeout timeout) {
        this.timeout = timeout;
    }

    public Tools getTools() {
        return tools;
    }

    public void setTools(Tools tools) {
        this.tools = tools;
    }

    @Setter
    @Getter
    public static class Workspace {
        private String root = "/tmp/jqube/scans";

    }

    @Setter
    @Getter
    public static class Timeout {
        private String git = "5m";
        private String semgrep = "10m";
        private String trivy = "10m";
        private String gitleaks = "10m";

        public Duration getGitDuration() {
            return parseDuration(git);
        }

        public Duration getSemgrepDuration() {
            return parseDuration(semgrep);
        }

        public Duration getTrivyDuration() {
            return parseDuration(trivy);
        }

        public Duration getGitleaksDuration() {
            return parseDuration(gitleaks);
        }

        private Duration parseDuration(String value) {
            if (value == null || value.isBlank()) {
                return Duration.ofMinutes(10);
            }

            value = value.trim().toLowerCase();

            try {
                if (value.endsWith("ms")) {
                    return Duration.ofMillis(Long.parseLong(value.substring(0, value.length() - 2)));
                }
                if (value.endsWith("s")) {
                    return Duration.ofSeconds(Long.parseLong(value.substring(0, value.length() - 1)));
                }
                if (value.endsWith("m")) {
                    return Duration.ofMinutes(Long.parseLong(value.substring(0, value.length() - 1)));
                }
                if (value.endsWith("h")) {
                    return Duration.ofHours(Long.parseLong(value.substring(0, value.length() - 1)));
                }
                if (value.endsWith("d")) {
                    return Duration.ofDays(Long.parseLong(value.substring(0, value.length() - 1)));
                }
                return Duration.ofMinutes(Long.parseLong(value));
            } catch (NumberFormatException e) {
                return Duration.ofMinutes(10);
            }
        }
    }

    public static class Tools {
        private String git = "git";
        private String semgrep = "semgrep";
        private String trivy = "trivy";
        private String gitleaks = "gitleaks";

        public String getGit() {
            return git;
        }

        public void setGit(String git) {
            this.git = git;
        }

        public String getSemgrep() {
            return semgrep;
        }

        public void setSemgrep(String semgrep) {
            this.semgrep = semgrep;
        }

        public String getTrivy() {
            return trivy;
        }

        public void setTrivy(String trivy) {
            this.trivy = trivy;
        }

        public String getGitleaks() {
            return gitleaks;
        }

        public void setGitleaks(String gitleaks) {
            this.gitleaks = gitleaks;
        }
    }
}
