import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import RideList from "./pages/RideList";
import MyRides from "./pages/MyRides";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import TrackingPage from "./pages/TrackingPage";
import RideChatPage from "./pages/RideChatPage";

import "leaflet/dist/leaflet.css";
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-ride" element={<CreateRide />} />
        <Route path="/rides" element={<RideList />} />
        <Route path="/my-rides" element={<MyRides />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/tracking/:rideId" element={<TrackingPage />} />
        <Route path="/chat/:rideId" element={<RideChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}