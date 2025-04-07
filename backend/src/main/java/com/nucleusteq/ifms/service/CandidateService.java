package com.nucleusteq.ifms.service;

import com.nucleusteq.ifms.dto.CandidateDto;
import java.util.List;

public interface CandidateService {
    CandidateDto createCandidate(CandidateDto candidateDto);
    CandidateDto updateCandidate(Long id, CandidateDto candidateDto);
    List<CandidateDto> getAllCandidates();
    CandidateDto getCandidateById(Long id);
    void deleteCandidate(Long id);
    List<CandidateDto> getCandidatesByStatus(String status);
}