import { Routes, Route, useLocation } from "react-router-dom";
import { routes } from "@/navigation/routes";
import { useAuthRestore } from "@/hooks/useAuthRestore";
import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing-page/Footer";
import Notiflix from "notiflix";
import { isDashboardPage } from "@/utils/isDashboardPage";
import "../src/styles/index.css";

// Helper function to render routes recursively
const renderRoutes = (routes: any[]) => {
  return routes.map((route) => {
    if (route.children) {
      return (
        <Route key={route.path} path={route.path} element={route.element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    return <Route key={route.path} path={route.path} element={route.element} />;
  });
};

function App() {
  Notiflix.Notify.init({
    width: "300px",
    position: "right-bottom",
    distance: "10px",
    timeout: 3000,
  });
  // Restore auth state on app initialization
  useAuthRestore();

  const location = useLocation();
  console.log("Current location:", location.pathname);
  const isAdminRoute = isDashboardPage(location.pathname);
  return (
    <Box>
      <Navbar />
      <Box sx={{ mt: location.pathname === "/" ? 0 : "80px" }} />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Routes>{renderRoutes(routes)}</Routes>
        </Box>
        {!isAdminRoute && <Footer />}
      </Box>
    </Box>
  );
}
export default App;
