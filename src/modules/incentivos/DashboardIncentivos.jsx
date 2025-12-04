import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Button, Menu, MenuItem, Box, ListItemIcon, ListItemText,
  Grid, Card, CardContent, Typography, Chip, LinearProgress, Avatar,
  Paper, Container, CssBaseline, CircularProgress
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
import SyncIcon from '@mui/icons-material/Sync';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- SERVICIOS ---
import axios from 'axios';
import authService from '../../services/api/authService';

// ==========================================
// 1. NAVBAR (Mismo código visual)
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
    navigate(path);
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
        <Button startIcon={<DashboardIcon />} onClick={() => navigate('/incentivos-reconocimientos/admin/dashboard')} sx={getButtonStyle('/dashboard')}>Dashboard</Button>
        <Box>
          <Button startIcon={<SettingsIcon />} endIcon={<KeyboardArrowDownIcon />} onClick={handleOpenConfig} sx={getButtonStyle('/configuracion')}>Configuración</Button>
          <Menu anchorEl={anchorElConfig} open={Boolean(anchorElConfig)} onClose={handleCloseConfig}>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/reglas')}><ListItemIcon><RuleIcon fontSize="small" /></ListItemIcon><ListItemText primary="Reglas de Incentivos" /></MenuItem>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/metas')}><ListItemIcon><TrackChangesIcon fontSize="small" /></ListItemIcon><ListItemText primary="Metas del Periodo" /></MenuItem>
          </Menu>
        </Box>
        <Box>
          <Button startIcon={<PaidIcon />} endIcon={<KeyboardArrowDownIcon />} onClick={handleOpenGestion} sx={getButtonStyle('/gestion')}>Gestión</Button>
          <Menu anchorEl={anchorElGestion} open={Boolean(anchorElGestion)} onClose={handleCloseGestion}>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/aprobaciones')}><ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon><ListItemText primary="Aprobar Bonos" /></MenuItem>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/reportes')}><ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon><ListItemText primary="Reportes" /></MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// ==========================================
// 2. DASHBOARD PRINCIPAL
// ==========================================
const DashboardIncentivos = () => {
  const [loading, setLoading] = useState(true);
  // Estados iniciales seguros para evitar errores de renderizado si falla la API
  const [data, setData] = useState({
    totalPagar: 0,
    pendientesRevision: 0,
    porcentajeMetasCumplidas: 0,
    empleadosActivos: 0,
    evolucionSemestral: [],
    presupuestoPorArea: { Ventas: 0, "Atención al Cliente": 0, Otros: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser(); 
        const token = user?.token || localStorage.getItem('token'); 

        const response = await axios.get('http://localhost:8080/api/incentivos/admin/dashboard', {
          params: { periodo: '2025-12' }, 
          headers: { Authorization: `Bearer ${token}` }
        });

        if(response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalPresupuesto = Object.values(data.presupuestoPorArea || {}).reduce((a, b) => a + b, 0);
  const pctVentas = totalPresupuesto > 0 ? Math.round((data.presupuestoPorArea?.['Ventas'] || 0) / totalPresupuesto * 100) : 0;
  const pctAtencion = totalPresupuesto > 0 ? Math.round((data.presupuestoPorArea?.['Atención al Cliente'] || 0) / totalPresupuesto * 100) : 0;
  const pctOthers = 100 - pctVentas - pctAtencion;
  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <CssBaseline />
      <NavbarAdmin />

      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        
        {/* BARRA DE CONTEXTO */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">Resumen:</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">Diciembre 2025</Typography>
            <Chip label="CÁLCULO EN PROCESO" color="warning" size="small" sx={{ fontWeight: 'bold', bgcolor: '#FFF4E5', color: '#663C00' }} />
          </Box>
          <Button variant="contained" startIcon={<SyncIcon />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Sincronizar</Button>
        </Paper>

        {/* KPIs */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* KPI 1: Total Pagar */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">TOTAL A PAGAR</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>S/ {(data.totalPagar || 0).toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                      <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5 }} /> +12%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}><AttachMoneyIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI 2: Pendientes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">PENDIENTES</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{data.pendientesRevision || 0}</Typography>
                    <Typography variant="caption" color="warning.main" fontWeight="bold">Requiere revisión</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFF3E0', color: '#EF6C00' }}><PendingActionsIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI 3: Metas Cumplidas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">METAS CUMPLIDAS</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 0.5 }}>{data.porcentajeMetasCumplidas || 0}%</Typography>
                    <LinearProgress variant="determinate" value={data.porcentajeMetasCumplidas || 0} sx={{ height: 6, borderRadius: 5 }} />
                  </Box>
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976D2', ml: 1 }}><EmojiEventsIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI 4: Activos */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">ACTIVOS</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{data.empleadosActivos || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">+3 nuevas altas</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#F5F5F5', color: '#616161' }}><GroupIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* GRÁFICOS */}
        <Grid container spacing={3}>
          {/* Gráfico Barras (Datos dinámicos de data.evolucionSemestral) */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Evolución Semestral</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 2 }}>
                  {['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((mes, index) => {
                    // Actualizado rango de meses para terminar en Dic
                    const valor = (data.evolucionSemestral && data.evolucionSemestral[index]) || 0;
                    const altura = Math.min((valor / 60000) * 100, 100); 
                    
                    return (
                      <Box key={mes} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'flex-end' }}>
                        <Box sx={{ width: '60%', height: `${altura}%`, bgcolor: index === 5 ? '#2563EB' : '#93C5FD', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
                        <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>{mes}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico Donut */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Presupuesto por Área</Typography>
                <Box sx={{ position: 'relative', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                  {/* Círculo simulado con CSS Conic Gradient basado en porcentajes reales */}
                  <Box sx={{
                    width: 180, height: 180, borderRadius: '50%',
                    background: `conic-gradient(#2563EB 0% ${pctVentas}%, #10B981 ${pctVentas}% ${pctVentas + pctAtencion}%, #E0E0E0 ${pctVentas + pctAtencion}% 100%)`
                  }} />
                  <Box sx={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', bgcolor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" fontWeight="bold">100%</Typography>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, bgcolor: '#2563EB', borderRadius: '50%' }} /><Typography variant="body2">Ventas</Typography></Box>
                    <Typography variant="body2" fontWeight="bold">{pctVentas}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, bgcolor: '#10B981', borderRadius: '50%' }} /><Typography variant="body2">Atención</Typography></Box>
                    <Typography variant="body2" fontWeight="bold">{pctAtencion}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, bgcolor: '#E0E0E0', borderRadius: '50%' }} /><Typography variant="body2">Otros</Typography></Box>
                    <Typography variant="body2" fontWeight="bold">{pctOthers || 0}%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardIncentivos;