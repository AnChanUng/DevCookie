package com.csstudy.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.net.InetAddress;

@Component
public class ClientAddress {
    private final boolean trustForwardedFor;
    public ClientAddress(@Value("${app.security.trust-forwarded-for:false}") boolean trustForwardedFor) {
        this.trustForwardedFor = trustForwardedFor;
    }
    public String resolve(HttpServletRequest request) {
        // Enable only behind the deployment's trusted proxy. Its appended, rightmost hop
        // cannot be replaced by a caller prepending a forged X-Forwarded-For value.
        String forwarded = request.getHeader("X-Forwarded-For");
        if (trustForwardedFor && forwarded != null && forwarded.length() <= 1024) {
            String[] hops = forwarded.split(",");
            String last = hops[hops.length - 1].trim();
            if (last.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}")) {
                String[] octets=last.split("\\.");
                if (java.util.Arrays.stream(octets).mapToInt(Integer::parseInt).allMatch(n -> n<=255))
                    return java.util.Arrays.stream(octets).map(n -> Integer.toString(Integer.parseInt(n))).collect(java.util.stream.Collectors.joining("."));
            } else if (last.contains(":") && last.matches("[0-9a-fA-F:.]{2,45}")) {
                try { return InetAddress.getByName(last).getHostAddress(); }
                catch (Exception ignored) { /* fall back to socket peer */ }
            }
        }
        return request.getRemoteAddr();
    }
}
