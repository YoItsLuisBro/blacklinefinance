import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Protected } from "./routes/Protected";
import { AppShell } from "./layouts/AppShell";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<Protected />}>
          <Route element={<AppShell />}>
            <Route path="/app" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
