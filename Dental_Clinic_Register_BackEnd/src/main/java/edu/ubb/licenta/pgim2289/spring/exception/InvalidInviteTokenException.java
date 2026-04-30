package edu.ubb.licenta.pgim2289.spring.exception;

public class InvalidInviteTokenException extends RuntimeException {
    private final String messageKey;

    public InvalidInviteTokenException(String messageKey, String defaultMessage) {
        super(defaultMessage);
        this.messageKey = messageKey;
    }

    public String getMessageKey() {
        return messageKey;
    }
}
