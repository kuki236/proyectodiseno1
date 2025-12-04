import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Button, Menu, MenuItem, ListItemIcon, ListItemText,
    Typography, Container, Paper, TextField, Select, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Grid, FormControl, InputLabel, CssBaseline, CircularProgress,
    Tooltip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

// --- ICONOS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PaidIcon from '@mui/icons-material/Paid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RuleIcon from '@mui/icons-material/Rule';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Usado para el título del reporte
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';


// --- LIBRERÍAS EXTERNAS (Asumidas disponibles) ---
const jsPDF = typeof window !== 'undefined' && window.jsPDF; 

// --- SERVICIOS ---
// CORRECCIÓN: Ajuste de la ruta relativa.
// Si el archivo está en src/modules/incentivos/ y el servicio en src/services/, la ruta debería ser:
import { incentivoService} from '../../../services/incentivoService';

// ==========================================
// 1. NAVBAR (Mantenido)
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
                    <Button startIcon={<PaidIcon />} endIcon={<KeyboardArrowDownIcon />} onClick={handleOpenGestion} sx={getButtonStyle('/reportes')}>
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
const ReportesIncentivos = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anio, setAnio] = useState('2025'); 
    const [isExporting, setIsExporting] = useState({ pdf: false, excel: false });
    const [filterDept, setFilterDept] = useState('Todos'); 
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    
    // Estado para el Modal de Detalle de Periodo
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPeriodDetail, setSelectedPeriodDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false); // Nuevo estado para la carga del modal


    // --- Carga de datos del Backend ---
    const fetchReportData = async () => {
        setLoading(true);
        try {
            const data = await incentivoService.generarReporteAnual(anio);
            setReportData(data);
        } catch (error) {
            console.error("Error al cargar reporte anual:", error);
            setNotification({ open: true, message: 'Error al cargar datos del reporte anual.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [anio]);
    
    // --- Lógica de Gráfico (Consolida la data del Backend) ---
    const chartData = useMemo(() => {
        if (!reportData) return [];
        return reportData.etiquetasMeses.map((month, index) => ({
            month,
            sales: reportData.dataVentas[index] ? parseFloat(reportData.dataVentas[index]) : 0,
            support: reportData.dataAtencion[index] ? parseFloat(reportData.dataAtencion[index]) : 0,
        }));
    }, [reportData]);

    const getMaxHeight = () => {
        if (!chartData || chartData.length === 0) return 1;
        const maxVal = Math.max(...chartData.map(d => d.sales + d.support));
        return maxVal > 0 ? maxVal : 1;
    };
    const maxVal = getMaxHeight();

    // --- Filtrado local de la tabla de detalle (Nómina) ---
    const filteredReports = useMemo(() => {
        if (!reportData || !reportData.tablaDetalle) return [];
        return reportData.tablaDetalle; 
    }, [reportData]);

    // --- MANEJADORES DE ACCIÓN ---

    const handleOpenDetailModal = async (periodoConsolidado, numBeneficiarios) => {
        setLoadingDetail(true);
        setDetailModalOpen(true);
        setSelectedPeriodDetail({
            periodo: periodoConsolidado,
            numBeneficiarios,
            empleados: [],
            totalMonto: 0
        });

   
        const monthIndex = reportData.etiquetasMeses.indexOf(periodoConsolidado.split(' ')[0]) + 1;
        const anioPart = periodoConsolidado.split(' ')[1];
        const periodoKey = anioPart + '-' + monthIndex.toString().padStart(2, '0');
        
        try {
            // Llama al nuevo endpoint del backend
            const empleadosDetalle = await incentivoService.obtenerDetalleBonosPorPeriodo(periodoKey);

            const totalMonto = empleadosDetalle.reduce((sum, emp) => sum + parseFloat(emp.monto), 0);

            setSelectedPeriodDetail(prev => ({
                ...prev,
                empleados: empleadosDetalle,
                totalMonto: totalMonto
            }));

        } catch (error) {
            console.error("Error fetching detail:", error);
            setNotification({ open: true, message: `Error al cargar detalle para ${periodoConsolidado}.`, severity: 'error' });
            setSelectedPeriodDetail(prev => ({ ...prev, empleados: [], totalMonto: 0 }));
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleExport = (type) => {
        setIsExporting(prev => ({ ...prev, [type]: true }));
        setNotification({ open: true, message: `Iniciando exportación a ${type.toUpperCase()}...`, severity: 'info' });

        if (type === 'pdf') {
            exportPdf();
        } 
        
        setTimeout(() => {
            setIsExporting(prev => ({ ...prev, [type]: false }));
            if (type !== 'pdf') {
                setNotification({ open: true, message: `Exportación a ${type.toUpperCase()} finalizada.`, severity: 'success' });
            }
        }, 2000);
    };

    // --- LÓGICA DE EXPORTACIÓN A PDF (Mantenida) ---
    const exportPdf = () => {
        if (!jsPDF) {
            setNotification({ open: true, message: "Librería jsPDF no disponible. Instala jspdf y jspdf-autotable para esta función.", severity: 'error' });
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape' });
        
        const headers = [
            ["PERIODO", "CONCEPTO", "N° BENEFICIARIOS", "MONTO TOTAL (S/)", "ESTADO PAGO"]
        ];

        const body = filteredReports.map(row => [
            row.periodo,
            row.concepto,
            row.numBeneficiarios,
            `S/ ${parseFloat(row.montoTotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            row.estadoPago
        ]);

        doc.setFontSize(18);
        doc.text(`Reporte Anual de Nómina de Incentivos - ${anio}`, 14, 22);

        doc.autoTable({
            startY: 30,
            head: headers,
            body: body,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                3: { halign: 'right' },
                2: { halign: 'center' }
            }
        });

        doc.save(`Reporte_Incentivos_${anio}.pdf`);
    };

    // Renderizado del Contenido Principal
    const renderMainContent = () => {
        if (loading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
        }
        
        return (
            <Grid container spacing={3}>
                {/* GRÁFICO DE TENDENCIA */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon color="action" /> TENDENCIA DE GASTO EN INCENTIVOS ({anio})
                        </Typography>
                        <Box sx={{ mt: 4, height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
                            {/* Eje Y (Simplificado) */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', pb: 3, mr: 1, position: 'relative', width: 40 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 0, left: 0 }}>S/ {Math.round(maxVal).toLocaleString()}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0 }}>S/ {Math.round(maxVal / 2).toLocaleString()}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: 0, left: 0 }}>S/ 0</Typography>
                            </Box>
                            
                            {/* Barras */}
                            <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', alignItems: 'flex-end', gap: 2 }}>
                                {chartData.map((data, index) => {
                                    const totalMonth = data.sales + data.support;
                                    const heightSales = (data.sales / maxVal) * 100;
                                    const heightSupport = (data.support / maxVal) * 100;
                                    return (
                                        <Box key={index} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                                            <Tooltip title={`Ventas: S/ ${data.sales.toLocaleString()} | Atención: S/ ${data.support.toLocaleString()} | Total: S/ ${totalMonth.toLocaleString()}`}>
                                                <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column-reverse', height: '100%', cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }}>
                                                    <Box sx={{ height: `${heightSales}%`, bgcolor: '#2563EB', width: '100%', borderRadius: '2px 2px 0 0' }} />
                                                    <Box sx={{ height: `${heightSupport}%`, bgcolor: '#10B981', width: '100%' }} />
                                                </Box>
                                            </Tooltip>
                                            <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', color: 'text.secondary' }}>{data.month}</Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: '#2563EB', borderRadius: '50%' }} />
                                <Typography variant="caption">Ventas</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: '#10B981', borderRadius: '50%' }} />
                                <Typography variant="caption">Atención</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* TABLA DE DETALLE (Nómina) */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <Typography variant="subtitle1" fontWeight="bold">Detalle de Nómina de Incentivos por Período</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>PERIODO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>CONCEPTO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }} align="center">N° BENEFICIARIOS</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }} align="right">MONTO TOTAL</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }}>ESTADO PAGO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#6B7280' }} align="center">ACCIONES</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredReports.length > 0 ? filteredReports.map((row) => (
                                        <TableRow key={row.periodo}>
                                            <TableCell fontWeight="medium">{row.periodo}</TableCell>
                                            <TableCell>{row.concepto}</TableCell>
                                            <TableCell align="center">{row.numBeneficiarios} Empleados</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>S/ {parseFloat(row.montoTotal).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {row.estadoPago === 'Pendiente' && <Chip label="Pendiente" size="small" color="warning" sx={{ bgcolor: '#FFFBEB', color: '#B45309' }} />}
                                                {row.estadoPago === 'Pagado' && <Chip label="Pagado" size="small" color="primary" sx={{ bgcolor: '#EFF6FF', color: '#1E40AF' }} />}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Ver detalle de empleados">
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary" 
                                                        onClick={() => handleOpenDetailModal(row.periodo, row.numBeneficiarios)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No hay datos de nómina para el año {anio}.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    return (
        <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
            <CssBaseline />
            <NavbarAdmin />

            <Container maxWidth="xl" sx={{ mt: 3, mb: 4, px: { xs: 2, md: 4 } }}>
                
                {/* 2. TÍTULO PRINCIPAL (Única Pestaña: Nomina Financiera) */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon /> Reporte Financiero de Nómina Anual
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Visualización de la tendencia de gasto y consolidado de pagos de incentivos.
                    </Typography>
                    <Box sx={{ borderBottom: '1px solid #E5E7EB', mt: 2 }} />
                </Box>

                {/* 3. BARRA DE FILTROS Y EXPORTACIÓN */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: 1, px: 1, py: 0.5, bgcolor: '#F9FAFB' }}>
                            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>Año Fiscal:</Typography>
                            <FormControl size="small" sx={{ minWidth: 100, bgcolor: 'white' }}>
                                <Select value={anio} onChange={(e) => setAnio(e.target.value)} displayEmpty>
                                    <MenuItem value="2025">2025</MenuItem>
                                    <MenuItem value="2024">2024</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} displayEmpty>
                                <MenuItem value="Todos">Todos los Departamentos</MenuItem>
                                <MenuItem value="Ventas">Ventas</MenuItem>
                                <MenuItem value="Atención">Atención</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={isExporting.pdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                            disabled={isExporting.pdf || loading}
                            onClick={() => handleExport('pdf')}
                            sx={{ bgcolor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626', '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}
                        >
                            {isExporting.pdf ? 'Generando PDF...' : 'PDF'}
                        </Button>
                        <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={isExporting.excel ? <CircularProgress size={20} color="inherit" /> : <TableViewIcon />}
                            disabled={isExporting.excel || loading}
                            onClick={() => handleExport('excel')}
                            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            {isExporting.excel ? 'Procesando Excel...' : 'Excel'}
                        </Button>
                    </Box>
                </Paper>

                {/* 4. PANEL DE VISUALIZACIÓN */}
                {renderMainContent()}

            </Container>
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open:false})}>
                <Alert severity={notification.severity} onClose={() => setNotification({...notification, open:false})}>
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* MODAL DE DETALLE DE EMPLEADOS POR PERIODO */}
            <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Beneficiarios de Incentivos - {selectedPeriodDetail?.periodo}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {selectedPeriodDetail?.numBeneficiarios} empleados recibieron un total de S/ {selectedPeriodDetail?.empleados?.reduce((sum, emp) => sum + parseFloat(emp.monto), 0).toLocaleString()}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {loadingDetail ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : selectedPeriodDetail?.empleados.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>EMPLEADO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>CONCEPTO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">MONTO</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ESTADO</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedPeriodDetail?.empleados.map((emp) => (
                                        <TableRow key={emp.idBono}>
                                            <TableCell>{emp.nombreEmpleado}</TableCell>
                                            <TableCell>{emp.concepto}</TableCell>
                                            <TableCell align="right">S/ {parseFloat(emp.monto).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip label={emp.estado} size="small" color={emp.estado === 'PENDIENTE' ? 'warning' : 'primary'} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">No se encontraron detalles de bonos para este período.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailModalOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportesIncentivos;