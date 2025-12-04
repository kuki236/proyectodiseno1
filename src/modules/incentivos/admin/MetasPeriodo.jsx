import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Typography, Container, Paper, Tabs, Tab, TextField, Select, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, LinearProgress,
  FormControl, InputLabel, Avatar, CssBaseline, CircularProgress, Snackbar, Alert
} from '@mui/material';

// Iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import RuleIcon from '@mui/icons-material/Rule';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavbarAdmin from '../components/NavbarAdmin';
import { incentivoService, getCategoriaByTab } from '../../../services/incentivoService';

const MetasPeriodo = () => {
  const [tabValue, setTabValue] = useState(0); // 0 = Ventas, 1 = Atención
  const [periodo, setPeriodo] = useState('2025-12');
  const [loading, setLoading] = useState(false);
  
  // Datos del Backend
  const [summaryData, setSummaryData] = useState({
    metaGlobalObjetivo: 0,
    sumaAsignada: 0,
    porcentajeAvanceEquipo: 0,
    empleados: []
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newTargetValue, setNewTargetValue] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // 1. OBTENER DATOS (GET)
  const fetchData = async () => {
    setLoading(true);
    try {
      const depto = getCategoriaByTab(tabValue);
      const data = await incentivoService.obtenerResumenMetas(depto, periodo);
      setSummaryData(data);
    } catch (error) {
      console.error(error);
      setNotification({ open: true, message: 'Error cargando metas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue, periodo]);

  // 2. ABRIR MODAL
  const handleOpenModal = (emp) => {
    setSelectedEmp(emp);
    setNewTargetValue(emp.metaObjetivo > 0 ? emp.metaObjetivo : '');
    setOpenModal(true);
  };

  // 3. ASIGNAR META (POST)
  const handleSaveMeta = async () => {
    if (!newTargetValue) return;
    
    try {
      const tipoMeta = tabValue === 0 ? 'Volumen de Ventas' : 'Calidad de Atención';
      
      const payload = {
        idEmpleado: selectedEmp.idEmpleado,
        periodo: periodo,
        tipoMeta: tipoMeta,
        valorObjetivo: parseFloat(newTargetValue)
      };

      await incentivoService.asignarMeta(payload);
      
      setNotification({ open: true, message: 'Meta asignada correctamente', severity: 'success' });
      setOpenModal(false);
      fetchData(); // Recargar datos para ver cambios
    } catch (error) {
      setNotification({ open: true, message: 'Error asignando meta', severity: 'error' });
    }
  };

  // UI Helpers
  const pendingToAssign = Math.max(0, summaryData.metaGlobalObjetivo - summaryData.sumaAsignada);

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <NavbarAdmin />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        
        {/* CONTEXTO TEMPORAL */}
        <Paper elevation={0} sx={{ p: 1.5, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#edeef5ff', borderRadius: 2 }}>
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold">PERIODO: {periodo}</Typography>
            </Box>
            <Chip icon={<TrendingUpIcon />} label="ABIERTO" color="success" variant="outlined" />
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="🎯 Metas de VENTAS" />
            <Tab label="🏆 Metas de ATENCIÓN" />
          </Tabs>
        </Box>

        {/* CARDS RESUMEN */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">META GLOBAL DEL DEPARTAMENTO</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        {tabValue === 0 ? `S/ ${summaryData.metaGlobalObjetivo.toLocaleString()}` : summaryData.metaGlobalObjetivo}
                    </Typography>
                    {tabValue === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Asignado a empleados: <strong>S/ {summaryData.sumaAsignada.toLocaleString()}</strong>
                            {pendingToAssign > 0 && <Chip label={`Faltan S/ ${pendingToAssign.toLocaleString()}`} size="small" color="warning" sx={{ ml: 1 }} />}
                        </Typography>
                    )}
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">AVANCE ACTUAL (EQUIPO)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                        {summaryData.porcentajeAvanceEquipo}%
                    </Typography>
                    <LinearProgress variant="determinate" value={Math.min(summaryData.porcentajeAvanceEquipo, 100)} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                </Paper>
            </Grid>
        </Grid>

        {/* TABLA */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            {loading ? <Box sx={{p:3, textAlign:'center'}}><CircularProgress /></Box> : (
            <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                    <TableRow>
                        <TableCell>EMPLEADO</TableCell>
                        <TableCell>CARGO</TableCell>
                        <TableCell>META</TableCell>
                        <TableCell>AVANCE</TableCell>
                        <TableCell>ESTADO</TableCell>
                        <TableCell align="center">ACCIONES</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {summaryData.empleados.map((row) => (
                        <TableRow key={row.idEmpleado} sx={{ bgcolor: row.metaObjetivo === 0 ? '#FEF2F2' : 'inherit' }}>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>{row.avatar}</Avatar>
                                    <Typography variant="body2" fontWeight="medium">{row.nombreEmpleado}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{row.cargo}</TableCell>
                            <TableCell fontWeight="bold">
                                {row.metaObjetivo === 0 ? <span style={{color:'red'}}>--</span> : 
                                    (tabValue === 0 ? `S/ ${row.metaObjetivo.toLocaleString()}` : row.metaObjetivo)}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption">{row.avanceActual}</Typography>
                                    <Typography variant="caption" fontWeight="bold">{row.porcentajeAvance.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={row.porcentajeAvance} sx={{ height: 6, borderRadius: 5 }} />
                            </TableCell>
                            <TableCell>
                                {row.metaObjetivo === 0 ? <Chip label="Sin Asignar" size="small" color="error" icon={<LockIcon />} variant="outlined" /> : 
                                 <Chip label={row.estado} size="small" color={row.estado === 'Cumplida' ? 'success' : 'warning'} />}
                            </TableCell>
                            <TableCell align="center">
                                <IconButton size="small" color="primary" onClick={() => handleOpenModal(row)}>
                                    {row.metaObjetivo === 0 ? <AddIcon /> : <EditIcon />}
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {summaryData.empleados.length === 0 && <TableRow><TableCell colSpan={6} align="center">No hay empleados en este departamento.</TableCell></TableRow>}
                </TableBody>
            </Table>
            )}
        </TableContainer>
      </Container>

      {/* MODAL DE ASIGNACIÓN */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Meta: {selectedEmp?.nombreEmpleado}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tipo de Meta (Abstract Factory)</InputLabel>
                    <Select value={tabValue === 0 ? "volumen" : "calidad"} disabled>
                        <MenuItem value="volumen">Volumen de Ventas (Dinero)</MenuItem>
                        <MenuItem value="calidad">Calidad de Atención (Puntos/Tickets)</MenuItem>
                    </Select>
                </FormControl>
                
                <TextField 
                    fullWidth 
                    label="Valor Objetivo"
                    type="number"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    InputProps={{
                        startAdornment: tabValue === 0 ? <InputAdornment position="start">S/</InputAdornment> : null,
                        style: { fontSize: '1.5rem', fontWeight: 'bold' }
                    }}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveMeta}>Guardar Meta</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({...notification, open:false})}>
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MetasPeriodo;