import React from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { Login } from './features/auth/pages/Login';
import { ControlCenterDashboard } from './features/analytics/pages/ControlCenterDashboard';
import { ElectionDayDashboard } from './features/election-day/pages/ElectionDayDashboard';
import { ElectorsList } from './features/electors/pages/ElectorsList';
import { PlanningDashboard } from './features/planning/pages/PlanningDashboard';
import { ResultsDashboard } from './features/results/pages/ResultsDashboard';
import { TeamDashboard } from './features/team/pages/TeamDashboard';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', marginRight: '2rem' }}>Electoral360</h1>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Control</Link>
          <Link to="/electors" style={{ color: 'white', textDecoration: 'none' }}>Electores</Link>
          <Link to="/team" style={{ color: 'white', textDecoration: 'none' }}>Equipo</Link>
          <Link to="/planning" style={{ color: 'white', textDecoration: 'none' }}>Planeacin</Link>
          <Link to="/election-day" style={{ color: 'white', textDecoration: 'none' }}>Da E</Link>
          <Link to="/results" style={{ color: 'white', textDecoration: 'none' }}>Resultados</Link>
          <div style={{ flexGrow: 1 }}></div>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Salir</Link>
        </nav>
      </header>
      <main style={{ flexGrow: 1, backgroundColor: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ControlCenterDashboard />} />
        <Route path="/election-day" element={<ElectionDayDashboard />} />
        <Route path="/electors" element={<ElectorsList />} />
        <Route path="/planning" element={<PlanningDashboard />} />
        <Route path="/results" element={<ResultsDashboard />} />
        <Route path="/team" element={<TeamDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
