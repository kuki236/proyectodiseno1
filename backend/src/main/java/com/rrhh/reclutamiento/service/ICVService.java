package com.rrhh.reclutamiento.service;

import com.rrhh.reclutamiento.dto.CVGoogleDriveDTO;
import com.rrhh.shared.domain.model.CV;

public interface ICVService {
    CV registrarDesdeGoogleDrive(CVGoogleDriveDTO dto);
}
