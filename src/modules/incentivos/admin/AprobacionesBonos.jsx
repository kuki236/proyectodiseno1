import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Button, Menu, MenuItem, ListItemIcon, ListItemText,
    Typography, Container, Paper, TextField, Select, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
    Checkbox, Tooltip, Alert, RadioGroup, FormControlLabel, Radio, FormControl,
    InputLabel, CssBaseline, Snackbar, CircularProgress
} from '@mui/material';

// --- ICONOS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PaidIcon from '@mui/icons-material/Paid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RuleIcon from '@mui/icons-material/Rule';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import UndoIcon from '@mui/icons-material/Undo';

// --- SERVICIOS ---
import { incentivoService} from '../../../services/incentivoService';

// ==========================================
// 1. NAVBAR (Reutilizado)
// ==========================================
const NavbarAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorElConfig, setAnchorElConfig] = useState(null);
    const [anchorElGestion, setAnchorElGestion] = useState(null);

    const handleOpenConfig = (event) => setAnchorElConfig(event.currentTarget);
    const handleCloseConfig = () => setAnchorElConfig(null);
    const handleOpenGestion = (event) => setAnchorElGestion(event.currentTarget);
    const handleCloseGestion = () => setAnchorElGestion(null);

    const handleNavigate = (path) => {
        // Ajuste temporal de ruta si se usa /incentivos-reconocimientos
        const base = '/incentivos-reconocimientos/admin';
        navigate(base + path);
        handleCloseConfig();
        handleCloseGestion();
    };

    const getButtonStyle = (path) => ({
        textTransform: 'none',
        fontWeight: location.pathname.includes(path) ? 'bold' : 'medium',
        color: location.pathname.includes(path) ? '#2563EB' : '#4B5563',
        mx: 1,
        '&:hover': { backgroundColor: '#EFF6FF', color: '#2563EB' }
    });

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
            <Toolbar variant="dense">
                <Button startIcon={<DashboardIcon />} onClick={() => navigate('/incentivos-reconocimientos/admin/dashboard')} sx={getButtonStyle('/dashboard')}>
                    Dashboard
                </Button>
                <Box>
                    <Button startIcon={<SettingsIcon />} endIcon={<KeyboardArrowDownIcon />} onClick={handleOpenConfig} sx={getButtonStyle('/reglas')}>
                        Configuración
                    </Button>
                    <Menu anchorEl={anchorElConfig} open={Boolean(anchorElConfig)} onClose={handleCloseConfig}>
                        <MenuItem onClick={() => handleNavigate('/reglas')}>
                            <ListItemIcon><RuleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Reglas de Incentivos" />
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigate('/metas')}>
                            <ListItemIcon><TrackChangesIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Metas del Periodo" />
                        </MenuItem>
                    </Menu>
                </Box>
                <Box>
                    <Button startIcon={<PaidIcon />} endIcon={<KeyboardArrowDownIcon />} onClick={handleOpenGestion} sx={getButtonStyle('/aprobaciones')}>
                        Gestión
                    </Button>
                    <Menu anchorEl={anchorElGestion} open={Boolean(anchorElGestion)} onClose={handleCloseGestion}>
                        <MenuItem onClick={() => handleNavigate('/aprobaciones')}>
                            <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Aprobar Bonos" />
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigate('/reportes')}>
                            <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Reportes" />
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
const AprobacionesBonos = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('2025-12'); // Período por defecto
    const [selectedIds, setSelectedIds] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('Todos');
    const [filterStatus, setFilterStatus] = useState('pendiente');

    // Modal Rechazo
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [currentBonusToReject, setCurrentBonusToReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectAction, setRejectAction] = useState('rechazar');

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await incentivoService.obtenerDataAprobaciones(periodo);
            setData(result);
        } catch (error) {
            console.error("Error cargando aprobaciones:", error);
            setNotification({ open: true, message: 'Error cargando datos de aprobación.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [periodo]);

    // --- LÓGICA DE FILTRADO Y CÁLCULO ---
    const filteredBonuses = useMemo(() => {
        if (!data) return [];
        return data.bonos.filter(bonus => {
            const matchesSearch = bonus.nombreEmpleado.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  bonus.codigoRef.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = filterDept === 'Todos' || bonus.departamento === filterDept;
            const matchesStatus = filterStatus === 'Todos' || bonus.estado.toLowerCase() === filterStatus;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [data, searchTerm, filterDept, filterStatus]);

    // Usamos los totales calculados por el Backend (data.totalBolsa, data.yaAprobado, data.porAprobar)
    const totalCalculated = data?.totalBolsa || 0;
    const totalApproved = data?.yaAprobado || 0;
    const totalPending = data?.porAprobar || 0;
    
    const percentApproved = totalCalculated > 0 ? (totalApproved / totalCalculated) * 100 : 0;
    const percentPending = totalCalculated > 0 ? (totalPending / totalCalculated) * 100 : 0;
    const pendingBonusIds = filteredBonuses.filter(b => b.estado.toLowerCase() === 'pendiente').map(b => b.idBono);

    // --- MANEJADORES DE ACCIÓN ---

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(pendingBonusIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleApprove = async (id) => {
        const bonus = filteredBonuses.find(b => b.idBono === id);
        if (bonus && bonus.alertaMonto && !window.confirm(`⚠️ ADVERTENCIA: Este bono es de S/ ${bonus.monto.toLocaleString()}. ¿Estás seguro de aprobar este monto inusual?`)) {
            return;
        }
        try {
            await incentivoService.aprobarBono(id);
            setNotification({ open: true, message: `Bono #${id} aprobado.`, severity: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ open: true, message: `Error al aprobar bono #${id}.`, severity: 'error' });
        }
    };

    const handleApproveSelected = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`¿Aprobar ${selectedIds.length} bonos seleccionados? Esta acción es irreversible.`)) {
            try {
                await incentivoService.aprobarMasivo(selectedIds);
                setNotification({ open: true, message: `${selectedIds.length} bonos aprobados masivamente.`, severity: 'success' });
                setSelectedIds([]);
                fetchData();
            } catch (error) {
                setNotification({ open: true, message: 'Error en la aprobación masiva.', severity: 'error' });
            }
        }
    };

    const handleOpenRejectModal = (bonus) => {
        setCurrentBonusToReject(bonus);
        setRejectReason('');
        setRejectAction('rechazar');
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            alert("Debes ingresar un motivo para el rechazo.");
            return;
        }
        try {
            await incentivoService.rechazarBono(currentBonusToReject.idBono);
            setNotification({ open: true, message: `Bono #${currentBonusToReject.idBono} rechazado.`, severity: 'warning' });
            setRejectModalOpen(false);
            fetchData();
        } catch (error) {
            setNotification({ open: true, message: 'Error al rechazar el bono.', severity: 'error' });
        }
    };
    
    // Función de Deshacer (solo vuelve a estado pendiente en el mock, en la vida real es más complejo)
    const handleUndoStatus = async (id, currentStatus) => {
        // En un sistema real, no harías esto. Aquí solo simulamos que vuelve a pendiente
        if (window.confirm(`¿Quieres revertir el bono #${id} a PENDIENTE para revisión?`)) {
             try {
                // Como no tenemos endpoint para "revertir", asumimos que rechazar (que setea estado)
                // O mejor, ignoramos el undo por ahora, ya que no tenemos el endpoint en la interfaz.
                // En el backend solo tenemos aprobar/rechazar. Para deshacer requeriría otro endpoint.
                setNotification({ open: true, message: 'Función Deshacer no implementada en el backend aún.', severity: 'info' });
            } catch (error) {
                // Nada
            }
        }
    };


    return (
        <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
            <CssBaseline />
            <NavbarAdmin />

            <Container maxWidth="xl" sx={{ mt: 3, mb: 4, px: { xs: 2, md: 4 } }}>
                
                {/* 2. BARRA DE RESUMEN FINANCIERO (Sticky Bar) */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, mb: 3, borderRadius: 2, position: 'sticky', top: 10, zIndex: 1000,
                        bgcolor: '#FFFFFF', color: '#1F2937', borderLeft: '6px solid #10B981'
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={5}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.6, letterSpacing: 1, color: '#4B5563' }}>BOLSA DE INCENTIVOS ({periodo})</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 0.5 }}>
                                <Typography variant="h4" fontWeight="bold" color="#111827">S/ {totalCalculated.toLocaleString()}</Typography>
                                <Chip label="Total Proyectado" size="small" sx={{ bgcolor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircleIcon fontSize="inherit" /> YA APROBADO ({percentApproved.toFixed(0)}%)
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#111827">S/ {totalApproved.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <HourglassEmptyIcon fontSize="inherit" /> POR APROBAR ({percentPending.toFixed(0)}%)
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#111827">S/ {totalPending.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                color="success" 
                                disabled={selectedIds.length === 0}
                                onClick={handleApproveSelected}
                                startIcon={<CheckCircleIcon />}
                            >
                                Aprobar ({selectedIds.length})
                            </Button>
                            <Button variant="outlined" sx={{ color: '#2563EB', borderColor: 'rgba(37, 99, 235, 0.5)' }} startIcon={<DownloadIcon />}>
                                Exportar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* 3. PANEL DE FILTROS */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField 
                        size="small" 
                        placeholder="Buscar por nombre o código..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                        sx={{ flexGrow: 1, minWidth: '250px' }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Departamento</InputLabel>
                        <Select value={filterDept} label="Departamento" onChange={(e) => setFilterDept(e.target.value)}>
                            <MenuItem value="Todos">Todos</MenuItem>
                            <MenuItem value="Comercial">Ventas (Comercial)</MenuItem>
                            <MenuItem value="Servicio al Cliente">Atención al Cliente</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select value={filterStatus} label="Estado" onChange={(e) => setFilterStatus(e.target.value)}>
                            <MenuItem value="Todos">Todos</MenuItem>
                            <MenuItem value="pendiente">⏳ Pendientes</MenuItem>
                            <MenuItem value="aprobado">✅ Aprobados</MenuItem>
                            <MenuItem value="rechazado">❌ Rechazados</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Período</InputLabel>
                        <Select value={periodo} label="Período" onChange={(e) => setPeriodo(e.target.value)}>
                            <MenuItem value="2025-12">Diciembre 2025</MenuItem>
                            <MenuItem value="2025-11">Noviembre 2025</MenuItem>
                        </Select>
                    </FormControl>
                </Paper>
                
                {loading && <Box sx={{display:'flex', justifyContent:'center', p:5}}><CircularProgress size={30} /></Box>}

                {/* 4. TABLA MAESTRA DE APROBACIÓN */}
                {!loading && (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            color="primary"
                                            indeterminate={selectedIds.length > 0 && selectedIds.length < pendingBonusIds.length}
                                            checked={pendingBonusIds.length > 0 && selectedIds.length === pendingBonusIds.length}
                                            onChange={handleSelectAll}
                                            disabled={filterStatus !== 'pendiente' && filterStatus !== 'Todos'}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>EMPLEADO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>CONCEPTO (REGLA/META)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>EVIDENCIA</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>MONTO CALC.</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>ESTADO</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#6B7280' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBonuses.map((row) => {
                                    const isPending = row.estado.toLowerCase() === 'pendiente';
                                    const isApproved = row.estado.toLowerCase() === 'aprobado';
                                    const isRejected = row.estado.toLowerCase() === 'rechazado';
                                    const isSelected = selectedIds.includes(row.idBono);

                                    return (
                                        <TableRow 
                                            key={row.idBono} 
                                            selected={isSelected}
                                            sx={{ 
                                                bgcolor: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : 'inherit',
                                                '&:hover': { bgcolor: '#F9FAFB' }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox 
                                                    color="primary" 
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(row.idBono)}
                                                    disabled={!isPending}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">{row.nombreEmpleado}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{row.departamento}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.concepto}</Typography>
                                                <Chip label={row.codigoRef} size="small" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    startIcon={<DescriptionIcon />} 
                                                    size="small" 
                                                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                                                >
                                                    {row.evidencia}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold">S/ {row.monto.toLocaleString()}</Typography>
                                                    {row.alertaMonto && (
                                                        <Tooltip title="Monto inusualmente alto (+S/ 10,000)">
                                                            <WarningAmberIcon color="warning" fontSize="small" />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {isPending && <Chip icon={<HourglassEmptyIcon />} label="Pendiente" size="small" color="warning" variant="outlined" sx={{ bgcolor: '#FFFBEB', border: 'none' }} />}
                                                {isApproved && <Chip icon={<CheckCircleIcon />} label="Aprobado" size="small" color="success" sx={{ fontWeight: 'bold' }} />}
                                                {isRejected && <Chip icon={<CloseIcon />} label="Rechazado" size="small" color="error" sx={{ fontWeight: 'bold' }} />}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isPending ? (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Aprobar">
                                                            <IconButton size="small" color="success" onClick={() => handleApprove(row.idBono)} sx={{ border: '1px solid #86EFAC', bgcolor: '#F0FDF4' }}>
                                                                <CheckIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rechazar">
                                                            <IconButton size="small" color="error" onClick={() => handleOpenRejectModal(row)} sx={{ border: '1px solid #FECACA', bgcolor: '#FEF2F2' }}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    <Tooltip title="Revertir a Pendiente (No disponible en este demo)">
                                                        <IconButton size="small" disabled onClick={() => handleUndoStatus(row.idBono, row.estado)}>
                                                            <UndoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredBonuses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            No se encontraron bonos pendientes de aprobación para los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        
                        {/* 6. FOOTER DE PAGINACIÓN SIMULADO */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB' }}>
                            <Typography variant="body2" color="text.secondary">
                                Mostrando {filteredBonuses.length} bonos del período.
                            </Typography>
                        </Box>
                    </TableContainer>
                )}

            </Container>

            {/* 5. MODAL DE RECHAZO (INTERACTION FLOW) */}
            <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#FEF2F2', color: '#991B1B', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloseIcon /> RECHAZAR BONO - {currentBonusToReject?.nombreEmpleado}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Estás a punto de rechazar el bono de <strong>S/ {currentBonusToReject?.monto.toLocaleString()}</strong> generado por la regla "{currentBonusToReject?.concepto}".
                    </Alert>
                    
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Motivo del rechazo (Obligatorio para auditoría):</Typography>
                        <TextField 
                            fullWidth 
                            multiline 
                            rows={3} 
                            placeholder="Ej. Error en la carga de datos. El monto no coincide con ERP..." 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>¿Qué desea hacer con el registro?</Typography>
                        <RadioGroup value={rejectAction} onChange={(e) => setRejectAction(e.target.value)}>
                            <FormControlLabel value="rechazar" control={<Radio color="error" />} label="Marcar como RECHAZADO (Finaliza el proceso)" />
                            <FormControlLabel value="recalcular" control={<Radio color="primary" disabled />} label="Solicitar Recálculo (Deshabilitado en esta versión)" />
                        </RadioGroup>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setRejectModalOpen(false)} sx={{ color: '#6B7280' }}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleConfirmReject}
                        disabled={!rejectReason.trim() || rejectAction === 'recalcular'} // Asegurar que haya motivo
                    >
                        Confirmar Rechazo
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open:false})}>
                <Alert severity={notification.severity} onClose={() => setNotification({...notification, open:false})}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AprobacionesBonos;