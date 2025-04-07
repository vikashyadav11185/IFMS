package com.nucleusteq.ifms.model;

public enum InterviewStatus {
    SCHEDULED,
    COMPLETED,
    PENDING_FEEDBACK,
    CANCELLED,
    RESCHEDULED;

    public static InterviewStatus fromString(String text) {
        for (InterviewStatus status : InterviewStatus.values()) {
            if (status.name().equalsIgnoreCase(text)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No constant with text " + text + " found");
    }
}