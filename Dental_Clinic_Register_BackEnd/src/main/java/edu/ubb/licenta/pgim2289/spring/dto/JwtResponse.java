package edu.ubb.licenta.pgim2289.spring.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@SuppressFBWarnings("NM_CONFUSING")
public class JwtResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String refreshToken;
    private Long id;
    private String username;
    private String email;
    private List<String> roles;

    public JwtResponse(
            String accessToken,
            String refreshToken,
            Long id,
            String username,
            String email,
            List<String> roles
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}
