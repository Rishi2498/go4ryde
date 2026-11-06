import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";

import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import MyWithdrawals from "./pages/MyWithdrawals";
import RideList from "./pages/SearchRides";
import MyRides from "./pages/MyRides";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import TrackingPage from "./pages/TrackingPage";
import RoutePreviewPage from "./pages/RoutePreviewPage";
import RideChatPage from "./pages/RideChatPage";
import PassengerRideDetails from "./pages/PassengerRideDetails";
import RideDetails from "./pages/RideDetails";
import RideRoutePage from "./pages/RideRoutePage";
import PaymentPage from "./pages/PaymentPage";
import Notifications from "./pages/Notifications";
// import "../src/css/global.css";
import "leaflet/dist/leaflet.css";
import "../src/css/base.css";
import "../src/css/components.css";
import "../src/css/layout.css";

const libraries = ["places"];

// ✅ Layout wrapper
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });
   if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }


  return (

    <BrowserRouter>
      <Routes>

        {/* Routes WITHOUT Navbar */}
        <Route path="/login" element={<AuthPage />} />

        {/* Routes WITH Navbar */}
        <Route element={<Layout />}>

          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-ride" element={<CreateRide />} />
          <Route path="/rides" element={<RideList />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking/:id" element={<PassengerRideDetails />}/>
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          {/* <Route path="/payment/failed" element={<PaymentFailed />}/> */}
          <Route
    path="/payment/failed"
    element={<PaymentFailed />}
/>        
<Route
    path="/wallet/withdrawals"
    element={<MyWithdrawals />}
/>
          <Route path="/tracking/:rideId" element={<TrackingPage />} />
          <Route path="/chat/:bookingId" element={<RideChatPage />} />
          <Route path="/notifications" element={<Notifications />}
/>
{/* need to delete later */}
<Route
    path="/route-preview"
    element={<RoutePreviewPage />}
/>        
  <Route path="/ride/:id/route" element={<RideRoutePage />} />
          <Route path="/ride/:id" element={<RideDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>

  );
}