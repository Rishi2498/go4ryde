import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
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
import RoutePreviewPage from "./pages/RoutePreviewPage";
import RideChatPage from "./pages/RideChatPage";
import RideRoutePage from "./pages/RideRoutePage";

import "leaflet/dist/leaflet.css";

const libraries = ["places"];

export default function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });

  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-ride" element={<CreateRide />} />
        <Route path="/rides" element={<RideList />} />
        <Route path="/my-rides" element={<MyRides />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/tracking/:rideId" element={<TrackingPage />} />
        <Route path="/chat/:rideId" element={<RideChatPage />} />
        <Route path="/route-preview" element={<RoutePreviewPage />} />
        <Route path="/ride/:id/route" element={<RideRoutePage />} />



      </Routes>
    </BrowserRouter>
  );
}