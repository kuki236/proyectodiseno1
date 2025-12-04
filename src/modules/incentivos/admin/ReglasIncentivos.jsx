import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Typography, Container, Paper, Tabs, Tab, TextField, Select, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  RadioGroup, FormControlLabel, Radio, Divider, FormControl, InputLabel, CssBaseline,
  CircularProgress, Alert, Snackbar
} from '@mui/material';

// Iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PaidIcon from '@mui/icons-material/Paid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RuleIcon from '@mui/icons-material/Rule';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CodeIcon from '@mui/icons-material/Code';
import NavbarAdmin from '../components/NavbarAdmin';

import { incentivoService, getCategoriaByTab } from '../../../services/incentivoService';


const ReglasIncentivos = () => {
  const [tabValue, setTabValue] = useState(0);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Form States
  const [formData, setFormData] = useState({
    nombre: '',
    frecuencia: 'MENSUAL',
    descripcion: '',
    campo: 'monto_venta',
    operador: '>',
    valorObjetivo: '',
    tipoRecompensa: 'MONETARIO', // monetario | especie
    monto: '',
    tipoCalculo: 'FIJO',
    descripcionRegalo: ''
  });

  // 1. CARGAR REGLAS DESDE EL BACKEND
  const fetchRules = async () => {
    setLoading(true);
    try {
      const categoria = getCategoriaByTab(tabValue);
      const data = await incentivoService.listarReglas(categoria);
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      setNotification({ open: true, message: 'Error cargando reglas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [tabValue]);

  // 2. GUARDAR NUEVA REGLA (POST)
  const handleSaveRule = async () => {
    try {
      const categoria = getCategoriaByTab(tabValue);
      
      // Construir DTO exacto para Java
      const payload = {
        categoria: categoria,
        nombre: formData.nombre,
        frecuencia: formData.frecuencia,
        metrica: formData.campo,
        operador: formData.operador,
        valorObjetivo: formData.valorObjetivo,
        tipoRecompensa: formData.tipoRecompensa.toUpperCase(),
        // Lógica condicional para campos
        tipoCalculo: formData.tipoRecompensa === 'MONETARIO' ? formData.tipoCalculo.toUpperCase() : null,
        monto: formData.tipoRecompensa === 'MONETARIO' ? parseFloat(formData.monto) : 0,
        descripcionRegalo: formData.tipoRecompensa === 'ESPECIE' ? formData.descripcionRegalo : null
      };

      await incentivoService.crearRegla(payload);
      
      setNotification({ open: true, message: 'Regla creada exitosamente', severity: 'success' });
      setOpenModal(false);
      fetchRules(); // Recargar tabla
      
      // Reset form (simplificado)
      setFormData({ ...formData, nombre: '', valorObjetivo: '', monto: '', descripcionRegalo: '' });

    } catch (error) {
      console.error(error);
      setNotification({ open: true, message: 'Error al crear la regla', severity: 'error' });
    }
  };

  // 3. CAMBIAR ESTADO (PATCH)
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await incentivoService.cambiarEstadoRegla(id, !currentStatus);
      // Actualización optimista local
      setRules(rules.map(r => r.id === id ? { ...r, estado: !currentStatus } : r));
    } catch (error) {
      setNotification({ open: true, message: 'Error actualizando estado', severity: 'error' });
    }
  };

  // 4. ELIMINAR (DELETE)
  const handleDelete = async (id) => {
    if(window.confirm('¿Estás seguro de eliminar esta regla?')) {
      try {
        await incentivoService.eliminarRegla(id);
        setRules(rules.filter(r => r.id !== id));
      } catch (error) {
        setNotification({ open: true, message: 'Error eliminando regla', severity: 'error' });
      }
    }
  };

  const filteredRules = rules.filter(rule => 
    rule.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <NavbarAdmin />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#111827">Configuración de Reglas</Typography>
            <Typography variant="body2" color="text.secondary">Define la lógica del Abstract Factory para Ventas y Atención.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ bgcolor: '#2563EB' }}>
            Crear Nueva Regla
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="🛍️ Reglas de VENTAS" />
            <Tab label="🎧 Reglas de ATENCIÓN" />
          </Tabs>
        </Box>

        {/* TABLA */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            {loading ? <Box sx={{display:'flex', justifyContent:'center', p:3}}><CircularProgress /></Box> : (
            <TableContainer>
                <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                    <TableRow>
                    <TableCell>NOMBRE</TableCell>
                    <TableCell>CONDICIÓN (IF)</TableCell>
                    <TableCell>RECOMPENSA (THEN)</TableCell>
                    <TableCell>PERIODO</TableCell>
                    <TableCell>ESTADO</TableCell>
                    <TableCell>ACCIONES</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredRules.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell fontWeight="bold">{row.nombre}</TableCell>
                        <TableCell><Chip icon={<CodeIcon />} label={row.condicionLogica} size="small" sx={{ fontFamily: 'monospace' }} /></TableCell>
                        <TableCell>{row.recompensa}</TableCell>
                        <TableCell>{row.periodo}</TableCell>
                        <TableCell>
                        <Switch checked={row.estado} onChange={() => handleToggleStatus(row.id, row.estado)} />
                        </TableCell>
                        <TableCell>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><DeleteOutlineIcon /></IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {filteredRules.length === 0 && <TableRow><TableCell colSpan={6} align="center">No hay reglas definidas.</TableCell></TableRow>}
                </TableBody>
                </Table>
            </TableContainer>
            )}
        </Paper>
      </Container>

      {/* MODAL CREACIÓN */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: tabValue === 0 ? '#EFF6FF' : '#F5F3FF', color: tabValue === 0 ? '#1E40AF' : '#5B21B6' }}>
            Crear Regla para {tabValue === 0 ? 'VENTAS' : 'ATENCIÓN'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={8}>
                        <TextField fullWidth label="Nombre Regla" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} size="small" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Frecuencia</InputLabel>
                            <Select value={formData.frecuencia} onChange={(e) => setFormData({...formData, frecuencia: e.target.value})}>
                                <MenuItem value="MENSUAL">Mensual</MenuItem>
                                <MenuItem value="ANUAL">Anual</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight:'bold' }}>CONDICIÓN (IF)</Typography>
                <Grid container spacing={2} sx={{ mb: 3, bgcolor: '#F9FAFB', p: 2, borderRadius: 1 }}>
                    <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Métrica</InputLabel>
                            <Select value={formData.campo} onChange={(e) => setFormData({...formData, campo: e.target.value})}>
                                {tabValue === 0 ? [
                                    <MenuItem key="mv" value="monto_venta">Monto Venta</MenuItem>,
                                    <MenuItem key="cb" value="cantidad_boletas">Boletas</MenuItem>
                                ] : [
                                    <MenuItem key="tr" value="tickets_resueltos">Tickets Resueltos</MenuItem>,
                                    <MenuItem key="cs" value="csat_score">CSAT Score</MenuItem>
                                ]}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <Select fullWidth size="small" value={formData.operador} onChange={(e) => setFormData({...formData, operador: e.target.value})}>
                            <MenuItem value=">">Mayor que</MenuItem>
                            <MenuItem value=">=">Mayor o igual</MenuItem>
                            <MenuItem value="=">Igual</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={5}>
                        <TextField fullWidth label="Valor Objetivo" type="number" value={formData.valorObjetivo} onChange={(e) => setFormData({...formData, valorObjetivo: e.target.value})} size="small" />
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight:'bold' }}>RECOMPENSA (THEN)</Typography>
                <RadioGroup row value={formData.tipoRecompensa} onChange={(e) => setFormData({...formData, tipoRecompensa: e.target.value})}>
                    <FormControlLabel value="MONETARIO" control={<Radio />} label="Monetario" />
                    <FormControlLabel value="ESPECIE" control={<Radio />} label="Especie / Regalo" />
                </RadioGroup>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {formData.tipoRecompensa === 'MONETARIO' ? (
                        <>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Monto / %" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <Select fullWidth size="small" value={formData.tipoCalculo} onChange={(e) => setFormData({...formData, tipoCalculo: e.target.value})}>
                                    <MenuItem value="FIJO">Monto Fijo</MenuItem>
                                    <MenuItem value="PORCENTAJE">Porcentaje</MenuItem>
                                </Select>
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <TextField fullWidth label="Descripción del Regalo" value={formData.descripcionRegalo} onChange={(e) => setFormData({...formData, descripcionRegalo: e.target.value})} size="small" />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveRule}>Guardar Regla</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open:false})}>
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReglasIncentivos;