package com.nucleusteq.ifms.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.nucleusteq.ifms.dto.CandidateDto;
import com.nucleusteq.ifms.exception.ResourceNotFoundException;
import com.nucleusteq.ifms.mapper.CandidateMapper;
import com.nucleusteq.ifms.model.Candidate;
import com.nucleusteq.ifms.model.CandidateStatus;
import com.nucleusteq.ifms.repository.CandidateRepository;
import com.nucleusteq.ifms.service.CandidateService;

@Service
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateMapper candidateMapper;

    public CandidateServiceImpl(CandidateRepository candidateRepository, 
                              CandidateMapper candidateMapper) {
        this.candidateRepository = candidateRepository;
        this.candidateMapper = candidateMapper;
    }

    @Override
    public CandidateDto createCandidate(CandidateDto candidateDto) {
    	 if (candidateRepository.existsByEmail(candidateDto.getEmail())) {
             throw new RuntimeException("Email already in use!");
         }
        Candidate candidate = candidateMapper.toEntity(candidateDto);
        Candidate savedCandidate = candidateRepository.save(candidate);
        return candidateMapper.toDto(savedCandidate);
    }

    @Override
    public CandidateDto updateCandidate(Long id, CandidateDto candidateDto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        
        candidate.setName(candidateDto.getName());
        candidate.setEmail(candidateDto.getEmail());
        candidate.setRoleApplied(candidateDto.getRoleApplied());
        candidate.setExperience(candidateDto.getExperience());
        candidate.setResumePath(candidateDto.getResumePath());
        candidate.setStatus(CandidateStatus.valueOf(candidateDto.getStatus()));
        
        Candidate updatedCandidate = candidateRepository.save(candidate);
        return candidateMapper.toDto(updatedCandidate);
    }

    @Override
    public List<CandidateDto> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(candidateMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CandidateDto getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        return candidateMapper.toDto(candidate);
    }

    @Override
    public void deleteCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        candidateRepository.delete(candidate);
    }

    @Override
    public List<CandidateDto> getCandidatesByStatus(String status) {
        return candidateRepository.findByStatus(status).stream()
                .map(candidateMapper::toDto)
                .collect(Collectors.toList());
    }
}