package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.CandidateDto;
import com.nucleusteq.ifms.model.Candidate;
import com.nucleusteq.ifms.model.CandidateStatus;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-06T22:38:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.7 (Eclipse Adoptium)"
)
@Component
public class CandidateMapperImpl implements CandidateMapper {

    @Override
    public CandidateDto toDto(Candidate candidate) {
        if ( candidate == null ) {
            return null;
        }

        CandidateDto candidateDto = new CandidateDto();

        candidateDto.setId( candidate.getId() );
        candidateDto.setName( candidate.getName() );
        candidateDto.setEmail( candidate.getEmail() );
        candidateDto.setRoleApplied( candidate.getRoleApplied() );
        candidateDto.setExperience( candidate.getExperience() );
        candidateDto.setResumePath( candidate.getResumePath() );
        if ( candidate.getStatus() != null ) {
            candidateDto.setStatus( candidate.getStatus().name() );
        }

        return candidateDto;
    }

    @Override
    public Candidate toEntity(CandidateDto candidateDTO) {
        if ( candidateDTO == null ) {
            return null;
        }

        Candidate candidate = new Candidate();

        candidate.setId( candidateDTO.getId() );
        candidate.setName( candidateDTO.getName() );
        candidate.setEmail( candidateDTO.getEmail() );
        candidate.setRoleApplied( candidateDTO.getRoleApplied() );
        candidate.setExperience( candidateDTO.getExperience() );
        candidate.setResumePath( candidateDTO.getResumePath() );
        if ( candidateDTO.getStatus() != null ) {
            candidate.setStatus( Enum.valueOf( CandidateStatus.class, candidateDTO.getStatus() ) );
        }

        return candidate;
    }
}
