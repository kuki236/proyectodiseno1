import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Avatar, 
  Button,
  Chip,
  AppBar,
  Toolbar,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton
} from '@mui/material';

// --- ICONOS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';

// ==========================================
// 1. NAVBAR EMPLEADO (Reutilizado)
// ==========================================
const NavbarEmpleado = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getButtonStyle = (path) => ({
    textTransform: 'none',
    fontWeight: location.pathname.includes(path) ? 'bold' : 'medium',
    color: location.pathname.includes(path) ? '#2563EB' : '#4B5563',
    mx: 1,
    borderBottom: location.pathname.includes(path) ? '2px solid #2563EB' : '2px solid transparent',
    borderRadius: 0,
    px: 2,
    '&:hover': { backgroundColor: '#EFF6FF', color: '#2563EB' }
  });

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
      <Toolbar variant="dense" sx={{ minHeight: '56px' }}>
        <Button 
          startIcon={<DashboardIcon />}
          onClick={() => navigate('/incentivos-reconocimientos/empleado/dashboard')}
          sx={getButtonStyle('/dashboard')}
        >
          Mi Progreso
        </Button>
        <Button
          startIcon={<ReceiptLongIcon />}
          onClick={() => navigate('/incentivos-reconocimientos/empleado/pagos')}
          sx={getButtonStyle('/pagos')}
        >
          Mis Bonos (Detalle Pagos)
        </Button>
      </Toolbar>
    </AppBar>
  );
};

// ==========================================
// 2. COMPONENTE DE ESTADO (BADGE)
// ==========================================
const EstadoBadge = ({ estado }) => {
  let config = {
    color: 'default',
    bgcolor: '#F3F4F6',
    icon: <PendingIcon fontSize="small" />,
    label: estado
  };

  if (estado === 'Aprobado') {
    config = {
      color: '#166534',
      bgcolor: '#DCFCE7',
      icon: <CheckCircleIcon fontSize="small" />,
      label: 'Aprobado'
    };
  } else if (estado === 'Pendiente') {
    config = {
      color: '#854D0E',
      bgcolor: '#FEF9C3',
      icon: <PendingIcon fontSize="small" />,
      label: 'Pendiente'
    };
  }

  return (
    <Chip 
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{ 
        bgcolor: config.bgcolor, 
        color: config.color,
        fontWeight: 'bold',
        border: '1px solid',
        borderColor: config.bgcolor === '#F3F4F6' ? '#E5E7EB' : 'transparent',
        '& .MuiChip-icon': { color: config.color }
      }} 
    />
  );
};

// ==========================================
// 3. PANTALLA PRINCIPAL: DETALLE PAGOS
// ==========================================
const DetallePagosEmpleado = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBono, setSelectedBono] = useState(null);

  // Datos simulados (Billetera)
  const bonos = [
    { id: 1, concepto: 'Comisión Venta #B-099', fecha: '01/11/2025', estado: 'Aprobado', monto: 120.00, tipo: 'dinero', evidencia: 'Factura F001-2342' },
    { id: 2, concepto: 'Bono Superación Meta', fecha: '15/11/2025', estado: 'Pendiente', monto: 500.00, tipo: 'dinero', evidencia: 'Reporte Mensual Nov' },
    { id: 3, concepto: 'Empleado del Mes', fecha: '20/11/2025', estado: 'Aprobado', premio: 'Cena para dos', tipo: 'especie', evidencia: 'Memorándum RRHH' },
    { id: 4, concepto: 'Comisión Venta #C-001', fecha: '22/11/2025', estado: 'Pendiente', monto: 310.00, tipo: 'dinero', evidencia: 'Factura F001-2399' },
  ];

  const handleRowClick = (bono) => {
    setSelectedBono(bono);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedBono(null);
  };

  return (
    <Box sx={{ 
      bgcolor: '#F8FAFC', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <CssBaseline />

      <NavbarEmpleado />

      {/* HEADER DE CONTEXTO */}
      <Box sx={{ bgcolor: 'white', py: 2, px: 4, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
           <Typography variant="h5" fontWeight="bold" color="#1E293B">
            Billetera de Incentivos 💰
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Desglose financiero | <Box component="span" fontWeight="bold" color="primary.main">Noviembre 2025</Box>
          </Typography>
        </Box>
        <Box>
            <Button startIcon={<NotificationsIcon />} color="inherit">Alertas</Button>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563EB', ml: 2 }}>J</Avatar>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        
        {/* TABLA DE BONOS */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de bonos">
              <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Concepto (Regla)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>Monto / Premio</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bonos.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => handleRowClick(row)}
                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {row.concepto}
                    </TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell>
                      <EstadoBadge estado={row.estado} />
                    </TableCell>
                    <TableCell align="right">
                      {row.tipo === 'especie' ? (
                        <Chip 
                          icon={<CardGiftcardIcon />} 
                          label={row.premio} 
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontWeight: 'bold', borderColor: '#EC4899', color: '#DB2777', '& .MuiChip-icon': { color: '#DB2777' } }}
                        />
                      ) : (
                        <Typography fontWeight="bold" color="text.primary">
                          S/ {row.monto.toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                       <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                       </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* MODAL DE EVIDENCIA (Pantalla 3 Simulada) */}
        <Dialog 
          open={openModal} 
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          {selectedBono && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
                <Typography variant="h6" fontWeight="bold">Detalle de Evidencia</Typography>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                
                <Grid container spacing={2}>
                   {/* Cabecera del Detalle */}
                   <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Regla Aplicada
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {selectedBono.concepto}
                      </Typography>
                   </Grid>

                   {/* Estado y Fecha */}
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Fecha de Registro</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedBono.fecha}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <EstadoBadge estado={selectedBono.estado} />
                      </Box>
                   </Grid>

                   {/* Monto Final */}
                   <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', textAlign: 'center', borderRadius: 2, borderStyle: 'dashed', borderColor: '#94A3B8' }}>
                         <Typography variant="body2" color="text.secondary">Total a Pagar / Premio</Typography>
                         {selectedBono.tipo === 'especie' ? (
                            <Typography variant="h5" fontWeight="900" color="secondary.main">
                               🎁 {selectedBono.premio}
                            </Typography>
                         ) : (
                            <Typography variant="h4" fontWeight="900" color="success.main">
                               S/ {selectedBono.monto.toFixed(2)}
                            </Typography>
                         )}
                      </Paper>
                   </Grid>

                   {/* Sección de Evidencia */}
                   <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <AttachFileIcon fontSize="small" /> Documentos de Soporte
                      </Typography>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: '#F1F5F9', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#E2E8F0' }
                        }}
                      >
                         <Avatar sx={{ bgcolor: '#fff', color: '#EF4444' }}>
                            <DescriptionIcon />
                         </Avatar>
                         <Box>
                            <Typography variant="body2" fontWeight="bold">{selectedBono.evidencia}.pdf</Typography>
                            <Typography variant="caption" color="text.secondary">1.2 MB • Subido automáticamente</Typography>
                         </Box>
                      </Paper>
                   </Grid>
                </Grid>

              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cerrar</Button>
                <Button variant="contained" disableElevation sx={{ textTransform: 'none' }}>Descargar Comprobante</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

      </Container>
    </Box>
  );
};

export default DetallePagosEmpleado;