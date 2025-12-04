import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importaciones necesarias para navegación
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress, 
  Chip, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Button,
  Divider,
  CssBaseline,
  AppBar,     // Nuevo
  Toolbar     // Nuevo
} from '@mui/material';

// --- ICONOS ---
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
// Nuevos iconos para el Navbar
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; 

// ==========================================
// 1. NAVBAR EMPLEADO
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
    '&:hover': {
      backgroundColor: '#EFF6FF',
      color: '#2563EB'
    }
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
// COMPONENTES AUXILIARES
// ==========================================

const BarraProgreso = ({ titulo, actual, meta, unidad = "S/", bono, mensajeMotivador, completado }) => {
  const porcentaje = Math.min((actual / meta) * 100, 100);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Has logrado {unidad} {actual.toLocaleString()} de {unidad} {meta.toLocaleString()}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold" color={completado ? "success.main" : "primary.main"}>
          {Math.round(porcentaje)}%
        </Typography>
      </Box>

      {/* Barra visual */}
      <Box sx={{ position: 'relative', height: 12, width: '100%', bgcolor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            width: `${porcentaje}%`, 
            height: '100%', 
            bgcolor: completado ? '#10B981' : '#2563EB', // Verde si completo, Azul si progreso
            borderRadius: 6,
            transition: 'width 1s ease-in-out',
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)' // Glow effect
          }} 
        />
      </Box>

      {/* Mensaje Motivador */}
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        {completado ? (
          <CheckCircleIcon fontSize="small" color="success" />
        ) : (
          <TrendingUpIcon fontSize="small" color="primary" />
        )}
        <Typography 
          variant="body2" 
          fontWeight="medium" 
          color={completado ? "success.main" : "primary.main"}
        >
          {completado ? "¡Meta cumplida! Bono asegurado." : mensajeMotivador}
        </Typography>
      </Box>
    </Box>
  );
};

const FeedItem = ({ icono, color, titulo, tiempo }) => (
  <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: `${color}15`, color: color }}>
        {icono}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="body2" fontWeight="bold" color="text.primary">
          {titulo}
        </Typography>
      }
      secondary={
        <Typography variant="caption" color="text.secondary">
          {tiempo}
        </Typography>
      }
    />
  </ListItem>
);

// ==========================================
// DASHBOARD PRINCIPAL (HOME EMPLEADO)
// ==========================================
const DashboardEmpleado = () => {
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

      {/* 1. Navbar de Navegación (Dashboard / Pagos) */}
      <NavbarEmpleado />

      {/* 2. Header de Contexto (Usuario / Periodo) */}
      <Box sx={{ bgcolor: 'white', py: 2, px: 4, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
           <Typography variant="h5" fontWeight="bold" color="#1E293B">
            Hola, Juan (Ventas) 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Periodo: <Box component="span" fontWeight="bold" color="primary.main">Noviembre 2025</Box>
          </Typography>
        </Box>
        <Box>
            <Button startIcon={<NotificationsIcon />} color="inherit">
                Novedades
            </Button>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563EB', ml: 2 }}>J</Avatar>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        
        {/* SECCIÓN A: HERO - GANANCIA ACTUAL */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 4, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)', // Gradiente sutil
            border: '1px solid #BAE6FD',
            position: 'relative',
            overflow: 'visible' // Para permitir elementos decorativos fuera si se desea
          }}
        >
            {/* Decoración de fondo */}
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, transform: 'rotate(15deg)' }}>
                <StarIcon sx={{ fontSize: 200, color: '#2563EB' }} />
            </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  Incentivo Acumulado Estimado
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h2" fontWeight="900" sx={{ color: '#0F172A', letterSpacing: '-1px' }}>
                    S/ 1,250.00
                  </Typography>
                  
                  {/* Icono de bono en especie */}
                  <Box sx={{ 
                    bgcolor: '#EFF6FF', 
                    p: 1, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    border: '1px dashed #2563EB',
                    cursor: 'pointer'
                  }} title="Bono Viaje Activo">
                     <FlightTakeoffIcon sx={{ color: '#2563EB', fontSize: 30 }} />
                  </Box>
                </Box>

                <Chip 
                  label="Pendiente de Cierre" 
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#B45309', ml: 1 }} />} // Punto amarillo oscuro
                  sx={{ 
                    bgcolor: '#FEF3C7', 
                    color: '#92400E', 
                    fontWeight: 'bold',
                    border: '1px solid #FCD34D'
                  }} 
                />
              </Grid>
              
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                 <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "¡Gran trabajo, Juan! Estás superando el promedio de tu equipo."
                 </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* SECCIÓN B: MIS METAS */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <EmojiEventsIcon color="warning" />
                    <Typography variant="h6" fontWeight="bold">Mis Metas</Typography>
                </Box>
                
                {/* Meta 1: Ventas */}
                <BarraProgreso 
                  titulo="Monto Vendido Mensual"
                  actual={15000}
                  meta={20000}
                  unidad="S/"
                  bono={500}
                  mensajeMotivador="¡Faltan S/ 5,000 para desbloquear tu bono de S/ 500!"
                  completado={false}
                />

                <Divider sx={{ my: 3 }} />

                {/* Meta 2: Calidad (Atención/Tickets) - Ejemplo de completado */}
                <BarraProgreso 
                  titulo="Tickets Cerrados (Calidad)"
                  actual={50}
                  meta={50}
                  unidad="" // Sin unidad monetaria
                  bono={200}
                  mensajeMotivador=""
                  completado={true}
                />

              </CardContent>
            </Card>
          </Grid>

          {/* SECCIÓN C: ÚLTIMOS LOGROS (FEED) */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Últimos Logros
                </Typography>
                
                <List sx={{ p: 0 }}>
                  <FeedItem 
                    icono={<EmojiEventsIcon fontSize="small" />}
                    color="#10B981" // Verde
                    titulo="Te ganaste el bono 'Comisión 5%'"
                    tiempo="Ayer"
                  />
                  <Divider variant="inset" component="li" />
                  
                  <FeedItem 
                    icono={<TrendingUpIcon fontSize="small" />}
                    color="#3B82F6" // Azul
                    titulo="Tu venta de S/ 2,000 fue registrada"
                    tiempo="Hace 1 hora"
                  />
                  <Divider variant="inset" component="li" />

                  <FeedItem 
                    icono={<VerifiedIcon fontSize="small" />}
                    color="#8B5CF6" // Morado
                    titulo="¡Meta 'Tickets Cerrados' cumplida!"
                    tiempo="Hace 2 días"
                  />
                  <Divider variant="inset" component="li" />

                   <FeedItem 
                    icono={<ShoppingCartIcon fontSize="small" />}
                    color="#64748B" // Gris azulado
                    titulo="Nueva venta de S/ 850 registrada"
                    tiempo="Hace 3 días"
                  />
                </List>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button size="small" sx={{ textTransform: 'none' }}>Ver todo el historial</Button>
                </Box>

              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default DashboardEmpleado;