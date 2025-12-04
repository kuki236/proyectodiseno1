package com.rrhh.reclutamiento.service;

public interface IServicioNotificacion {
    void notificarCandidato(String email, String asunto, String mensaje);
    void notificarReclutador(String email, String asunto, String mensaje);
    void enviarRecordatorio(Integer idEntrevista);
    void notificarNuevaOferta(Integer idOferta);
    void notificarCambioEtapa(Integer idPostulanteProceso, String nuevaEtapa);
}

