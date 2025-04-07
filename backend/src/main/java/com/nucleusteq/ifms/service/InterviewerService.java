package com.nucleusteq.ifms.service;

import java.util.List;
import com.nucleusteq.ifms.model.Interviewer;
import com.nucleusteq.ifms.model.Position;

public interface InterviewerService {
    List<Interviewer> getAllInterviewers();
    Interviewer getInterviewerById(Long id);
    Interviewer getInterviewerByEmail(String email);
    List<Interviewer> getInterviewersByPosition(Position position);
}