package net.jqube.scanner;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.controllers.models.ScanQueuedResponse;
import net.jqube.scanner.controllers.models.ScanRequest;
import net.jqube.scanner.controllers.models.ScanResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ScanEndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldExecuteEndToEndScan() throws Exception {
        // 1. Create a ScanRequest
        ScanRequest request = new ScanRequest();
        // Using a small public repo
        request.setRepositoryUrl("https://github.com/OWASP/NodeGoat.git");
        request.setBranch("master");
        request.setCommit("e96b341f3e0984ee5869485b0d00a89d7b4db137");

        // 2. Trigger Scan
        MvcResult mvcResult = mockMvc.perform(post("/api/scans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();
        ScanQueuedResponse queuedResponse = objectMapper.readValue(responseContent, ScanQueuedResponse.class);
        
        assertNotNull(queuedResponse.getScanId());
        assertEquals("QUEUED", queuedResponse.getStatus());

        String scanId = queuedResponse.getScanId();

        // 3. Poll until COMPLETED or FAILED
        boolean finished = false;
        ScanResponse finalScanResponse = null;
        
        // Timeout after 3 minutes for tests
        for (int i = 0; i < 36; i++) {
            Thread.sleep(5000); // Wait 5 seconds
            
            MvcResult statusResult = mockMvc.perform(get("/api/scans/" + scanId))
                    .andExpect(status().isOk())
                    .andReturn();
            
            String statusContent = statusResult.getResponse().getContentAsString();
            finalScanResponse = objectMapper.readValue(statusContent, ScanResponse.class);
            
            if ("COMPLETED".equals(finalScanResponse.getStatus()) || 
                "COMPLETED_WITH_FINDINGS".equals(finalScanResponse.getStatus()) ||
                "FAILED".equals(finalScanResponse.getStatus())) {
                finished = true;
                break;
            }
        }
        
        assertTrue(finished, "Scan did not finish within timeout");
        assertNotEquals("FAILED", finalScanResponse.getStatus(), "Scan failed");

        // 4. Verify Summary and Tools
        assertNotNull(finalScanResponse.getSummary());
        assertTrue(finalScanResponse.getSummary().getTotal() >= 0);
        
        assertNotNull(finalScanResponse.getTools());
        assertFalse(finalScanResponse.getTools().isEmpty());
    }
}
