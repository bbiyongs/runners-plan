package com.runner.core.global.oauth2.info;

import java.util.Map;

public class GoogleOAuth2UserInfo implements OAuth2UserInfo{

    private final Map<String, Object> attribues;

    public GoogleOAuth2UserInfo(Map<String, Object> attribues) {
        this.attribues = attribues;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attribues;
    }

    @Override
    public String getProviderId() {
        return (String)attribues.get("sub");
    }

    @Override
    public String getProvider() {
        return "GOOGLE";
    }

    @Override
    public String getEmail() {
        return (String) attribues.get("email");
    }

    @Override
    public String getName() {
        return (String) attribues.get("name");
    }

    @Override
    public String getProfileImageUrl() {
        return (String) attribues.get("picture");
    }
}
