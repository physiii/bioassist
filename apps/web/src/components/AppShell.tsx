import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { appRoutes } from "../appRoutes";
import { useAuth } from "../auth/AuthContext";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 1 }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/")}>
            BioAssist
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>
            {user?.name}
          </Typography>
          <Button variant="outlined" onClick={() => void logout()}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">BioAssist</Typography>
            <Typography variant="body2" color="text.secondary">
              Health operating system
            </Typography>
          </Box>
          <Divider />
          <List sx={{ px: 1, pt: 1 }}>
            {appRoutes.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
