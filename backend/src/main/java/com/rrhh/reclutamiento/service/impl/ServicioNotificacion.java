package com.rrhh.reclutamiento.service.impl;

import com.rrhh.reclutamiento.service.IServicioNotificacion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ServicioNotificacion implements IServicioNotificacion {
    
    @Override
    public void notificarCandidato(String email, String asunto, String mensaje) {
        // Implementación de envío de email
        // Por ahora solo logueamos
        log.info("Notificación a candidato {}: {} - {}", email, asunto, mensaje);
        // TODO: Integrar con servicio de email (JavaMail, SendGrid, etc.)
    }
    
    @Override
    public void notificarReclutador(String email, String asunto, String mensaje) {
        log.info("Notificación a reclutador {}: {} - {}", email, asunto, mensaje);
        // TODO: Integrar con servicio de email
    }
    
    @Override
    public void enviarRecordatorio(Integer idEntrevista) {
        log.info("Enviando recordatorio de entrevista {}", idEntrevista);
        // TODO: Implementar lógica de recordatorio
    }
    
    @Override
    public void notificarNuevaOferta(Integer idOferta) {
        log.info("Notificando nueva oferta {}", idOferta);
        // TODO: Implementar notificación de oferta
    }
    
    @Override
    public void notificarCambioEtapa(Integer idPostulanteProceso, String nuevaEtapa) {
        log.info("Notificando cambio de etapa {} para proceso {}", nuevaEtapa, idPostulanteProceso);
        // TODO: Implementar notificación de cambio de etapa
    }
}

