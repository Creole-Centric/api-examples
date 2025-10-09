package com.creolecentric.example.exception;

import lombok.Getter;

@Getter
public class CreoleCentricException extends RuntimeException {
    private final int statusCode;
    private final String responseBody;

    public CreoleCentricException(String message, int statusCode, String responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public CreoleCentricException(String message) {
        this(message, 500, null);
    }
}
