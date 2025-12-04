import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Menu, MenuItem, Box, ListItemIcon, ListItemText } from '@mui/material';

// Iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PaidIcon from '@mui/icons-material/Paid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RuleIcon from '@mui/icons-material/Rule';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';

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

  const getButtonStyle = (pathSegment) => {
    const isActive = location.pathname.includes(pathSegment);
    return {
      textTransform: 'none',
      fontWeight: isActive ? 'bold' : 'medium',
      color: isActive ? '#2563EB' : '#4B5563', // Azul si está activo, Gris si no
      mx: 1,
      '&:hover': { backgroundColor: '#EFF6FF', color: '#2563EB' }
    };
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
      <Toolbar variant="dense">
        {/* DASHBOARD */}
        <Button 
            startIcon={<DashboardIcon />} 
            onClick={() => navigate('/incentivos-reconocimientos/admin/dashboard')} 
            sx={getButtonStyle('/dashboard')}
        >
            Dashboard
        </Button>

        {/* MENU CONFIGURACIÓN */}
        <Box>
          <Button 
            startIcon={<SettingsIcon />} 
            endIcon={<KeyboardArrowDownIcon />} 
            onClick={handleOpenConfig} 
            sx={getButtonStyle('/admin/reglas') || getButtonStyle('/admin/metas')} 
          >
            Configuración
          </Button>
          <Menu anchorEl={anchorElConfig} open={Boolean(anchorElConfig)} onClose={handleCloseConfig}>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/reglas')}>
                <ListItemIcon><RuleIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Reglas de Incentivos" />
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/metas')}>
                <ListItemIcon><TrackChangesIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Metas del Periodo" />
            </MenuItem>
          </Menu>
        </Box>

        {/* MENU GESTIÓN */}
        <Box>
          <Button 
            startIcon={<PaidIcon />} 
            endIcon={<KeyboardArrowDownIcon />} 
            onClick={handleOpenGestion} 
            sx={getButtonStyle('/admin/aprobaciones') || getButtonStyle('/admin/reportes')}
          >
            Gestión
          </Button>
          <Menu anchorEl={anchorElGestion} open={Boolean(anchorElGestion)} onClose={handleCloseGestion}>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/aprobaciones')}>
                <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Aprobar Bonos" />
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/incentivos-reconocimientos/admin/reportes')}>
                <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Reportes" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarAdmin;