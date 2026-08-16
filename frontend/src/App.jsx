import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAdmin from "./components/RequireAdmin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetail from "./pages/MovieDetail";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
      </Routes>
    </>
  );
}
