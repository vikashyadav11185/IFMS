package com.nucleusteq.ifms.service;

import java.time.LocalDate;
import java.util.List;
import com.nucleusteq.ifms.dto.InterviewDto;

public interface InterviewService {
    InterviewDto scheduleInterview(InterviewDto interviewDto);
    InterviewDto updateInterview(Long id, InterviewDto interviewDto);
    List<InterviewDto> getAllInterviews();
    InterviewDto getInterviewById(Long id);
    void cancelInterview(Long id);
    List<InterviewDto> getInterviewsByInterviewer(Long interviewerId);
    List<InterviewDto> getInterviewsByCandidate(Long candidateId);
    List<InterviewDto> getInterviewsByDate(LocalDate date);
    List<InterviewDto> getInterviewsByStatus(String status);
    List<InterviewDto> getTodayInterviews();
    List<InterviewDto> getUpcomingInterviews();
    List<InterviewDto> getPastInterviews();
    List<InterviewDto> getInterviewsBetweenDates(LocalDate startDate, LocalDate endDate);
    List<InterviewDto> getUpcomingInterviewsSorted();
    long getInterviewCountByStatus(String status);
    List<InterviewDto> getUpcomingInterviewsByInterviewer(Long interviewerId);
    List<InterviewDto> getInterviewsByRound(String round);
}