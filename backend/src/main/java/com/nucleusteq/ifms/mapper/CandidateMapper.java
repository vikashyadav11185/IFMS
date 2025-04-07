package com.nucleusteq.ifms.mapper;

import org.mapstruct.Mapper;
import com.nucleusteq.ifms.dto.CandidateDto;
import com.nucleusteq.ifms.model.Candidate;

@Mapper(componentModel = "spring")
public interface CandidateMapper {
    CandidateDto toDto(Candidate candidate);
    Candidate toEntity(CandidateDto candidateDTO);
}
