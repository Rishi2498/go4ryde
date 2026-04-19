import React, { useState, useEffect } from "react";
import { getProfile } from "../services/authService";
import Navbar from "../components/Navbar";
import "./ProfilePage.css";

export default function ProfilePage() {
  const BASE_URL = "http://127.0.0.1:8000";

  const [profile, setProfile] = useState({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setRole(res.data.role);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      <Navbar />

      <div className="profile-container">

        <div className="profile-card">

          <h2 className="title">GO4RYDE</h2>
          <p className="subtitle">{role} PROFILE</p>

          {/* INFO */}
          <div className="info-box">
            <p><b>Email:</b> {profile.email}</p>
            <p><b>Phone:</b> {profile.phone}</p>
          </div>

          {/* DRIVER */}
          {role === "DRIVER" && (
            <>
              <div className="info-box">
                <p><b>Vehicle:</b> {profile.vehicle_number}</p>
              </div>

              <div className="image-grid">

                {profile.profile_image && (
                  <img
                    src={BASE_URL + profile.profile_image}
                    className="preview"
                    alt=""
                  />
                )}

                {profile.dl_image && (
                  <img
                    src={BASE_URL + profile.dl_image}
                    className="preview"
                    alt=""
                  />
                )}

                {profile.rc_image && (
                  <img
                    src={BASE_URL + profile.rc_image}
                    className="preview"
                    alt=""
                  />
                )}

              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}