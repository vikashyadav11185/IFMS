package com.nucleusteq.ifms.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nucleusteq.ifms.dto.CandidateDto;
import com.nucleusteq.ifms.service.CandidateService;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping
    public ResponseEntity<CandidateDto> createCandidate(@RequestBody CandidateDto candidateDto) {
        CandidateDto createdCandidate = candidateService.createCandidate(candidateDto);
        return ResponseEntity.ok(createdCandidate);
    }
    
    

    @PutMapping("/{id}")
    public ResponseEntity<CandidateDto> updateCandidate(@PathVariable Long id, 
                                                      @RequestBody CandidateDto candidateDto) {
        CandidateDto updatedCandidate = candidateService.updateCandidate(id, candidateDto);
        return ResponseEntity.ok(updatedCandidate);
    }

    @GetMapping
    public ResponseEntity<List<CandidateDto>> getAllCandidates() {
        List<CandidateDto> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getCandidateById(@PathVariable Long id) {
        CandidateDto candidate = candidateService.getCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CandidateDto>> getCandidatesByStatus(@PathVariable String status) {
        List<CandidateDto> candidates = candidateService.getCandidatesByStatus(status);
        return ResponseEntity.ok(candidates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok("Candidate deleted successfully");
    }
}