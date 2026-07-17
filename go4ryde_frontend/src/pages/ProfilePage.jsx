import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile, upgradeToDriver } from "../services/authService";

import api from "../utils/axiosInstance";

import Navbar from "../components/Navbar";

import "../css/pages/ProfilePage.css";

export default function ProfilePage() {

  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:8000";

  // =========================
  // STATE
  // =========================
  const [profile, setProfile] = useState({});
  const [role, setRole] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  const [loading, setLoading] = useState(true);

  // MODALS
  const [showAccount, setShowAccount] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [showWallet, setShowWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // WALLET
  const [walletAmount, setWalletAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // BANK ACCOUNT
  const [showBankModal, setShowBankModal] = useState(false);

  const [bankData, setBankData] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
  });

  // DRIVER FORM
  const [formData, setFormData] = useState({
    vehicle_number: "",
    dl_image: null,
    rc_image: null,
    profile_image: null,
  });

  const [preview, setPreview] = useState({});

  // UI
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {

    try {

      const res = await getProfile();

      setProfile(res.data);

      setRole(
        res.data.role ||
        localStorage.getItem("role")
      );

      setWalletBalance(
        res.data.wallet_balance || 0
      );

      // preload bank account
      if (res.data.bank_account) {

        setBankData({
          account_holder_name:
            res.data.bank_account.account_holder_name || "",

          bank_name:
            res.data.bank_account.bank_name || "",

          account_number:
            res.data.bank_account.account_number || "",

          ifsc_code:
            res.data.bank_account.ifsc_code || "",

          upi_id:
            res.data.bank_account.upi_id || "",
        });
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // =========================
  // DRIVER FORM CHANGE
  // =========================
  const handleChange = (e) => {

    if (e.target.type === "file") {

      const file = e.target.files[0];

      setFormData({
        ...formData,
        [e.target.name]: file
      });

      setPreview({
        ...preview,
        [e.target.name]:
          URL.createObjectURL(file),
      });

    } else {

      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });

    }
  };

  // =========================
  // BANK INPUT CHANGE
  // =========================
  const handleBankChange = (e) => {

    setBankData({
      ...bankData,
      [e.target.name]: e.target.value,
    });

  };

  // =========================
  // SAVE BANK ACCOUNT
  // =========================
  const handleSaveBank = async () => {

    try {

      await api.post(
        "/payments/bank-account/",
        bankData
      );

      alert("Bank account saved");

      await loadProfile();

      setShowBankModal(false);

    } catch (err) {

      console.log(err.response);

      alert(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to save bank account"
      );

    }
  };

  // =========================
  // UPGRADE DRIVER
  // =========================
  const handleUpgrade = async () => {

    setError("");
    setSuccess("");

    if (!formData.vehicle_number) {
      return setError(
        "Vehicle number required"
      );
    }

    if (
      !formData.dl_image ||
      !formData.rc_image
    ) {
      return setError(
        "DL & RC required"
      );
    }

    try {

      setUploading(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {

        if (formData[key]) {
          data.append(key, formData[key]);
        }

      });

      await upgradeToDriver(data);

      setSuccess(
        "🎉 You are now a Driver!"
      );

      setTimeout(() => {

        setShowForm(false);

        loadProfile();

      }, 1200);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Upgrade failed"
      );

    }

    setUploading(false);
  };

  // =========================
  // WALLET TOPUP
  // =========================
  const handleWalletTopup = async () => {

    try {

      if (
        !walletAmount ||
        walletAmount <= 0
      ) {
        return alert("Enter valid amount");
      }

      const res = await api.post(
        "/payments/wallet/topup/",
        {
          amount: walletAmount
        }
      );

      const options = {

        key: res.data.key,

        amount: res.data.amount,

        currency: "INR",

        name: "Go4Ryde Wallet",

        order_id: res.data.order_id,

        handler: async function (response) {

          await api.post(
            "/payments/wallet/verify/",
            {
              order_id:
                response.razorpay_order_id,

              payment_id:
                response.razorpay_payment_id,

              signature:
                response.razorpay_signature,

              amount: walletAmount
            }
          );

          alert("Wallet updated!");

          setShowWallet(false);

          setWalletBalance((prev) =>
            prev + Number(walletAmount)
          );

          setWalletAmount("");
        }
      };

      new window.Razorpay(options).open();

    } catch (err) {

      alert(
        err.response?.data?.error ||
        "Top-up failed"
      );

    }
  };

  // =========================
  // WITHDRAW
  // =========================
  const handleWithdraw = async () => {

    try {

      if (
        !withdrawAmount ||
        withdrawAmount <= 0
      ) {
        return alert("Enter valid amount");
      }

      if (!profile.bank_account) {

        alert(
          "Please add bank account first"
        );

        setShowBankModal(true);

        return;
      }

      await api.post(
        "/payments/wallet/withdraw/",
        {
          amount: withdrawAmount
        }
      );

      alert(
        "Withdrawal request submitted"
      );

      setWalletBalance((prev) =>
        prev - Number(withdrawAmount)
      );

      setWithdrawAmount("");

      setShowWithdraw(false);

    } catch (err) {

      alert(
        err.response?.data?.error ||
        "Withdraw failed"
      );

    }
  };

  // =========================
  // LOADER
  // =========================
  if (loading) {
    return (
      <div className="loader">
        Loading...
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <>
      <Navbar />

      <div className="profile-page">

        {/* HERO */}
        <div className="profile-hero">

          <div className="profile-avatar">
            {profile.email?.charAt(0)?.toUpperCase()}
          </div>

          <div>

            <h1 className="profile-name">
              {profile.email?.split("@")[0]}
            </h1>

            <p className="profile-role">
              {role}
            </p>

 <p className="profile-phone">
        📞 {profile.phone}
    </p>
          </div>

        </div>

        {/* WALLET */}
        <div className="wallet-section">

          <div className="wallet-card">

            <span>Wallet Balance</span>

            <h2>
              ₹{walletBalance}
            </h2>

            <div className="wallet-actions">

              <button
                className="primary-btn"
                onClick={() =>
                  setShowWallet(true)
                }
              >
                Add Money
              </button>

              {role === "DRIVER" && (
                <button
                  className="secondary-btn"
                  onClick={() =>
                    setShowWithdraw(true)
                  }
                >
                  Withdraw
                </button>
              )}

            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="action-grid">

          {/* PASSENGER */}
          {role === "PASSENGER" && (
            <>
              <div
                className="action-card"
                onClick={() =>
                  navigate("/my-bookings")
                }
              >
                <h3>📖 My Bookings</h3>
                <p>
                  View booked rides
                </p>
              </div>

              <div
                className="action-card"
                onClick={() =>
                  setShowForm(true)
                }
              >
                <h3>🚘 Become Driver</h3>

                <p>
                  Start offering rides
                </p>
              </div>
            </>
          )}

          {/* DRIVER */}
          {role === "DRIVER" && (
            <>
              <div
                className="action-card"
                onClick={() =>
                  navigate("/my-rides")
                }
              >
                <h3>🚗 My Rides</h3>

                <p>
                  Manage your rides
                </p>
              </div>

              <div className="action-card">

                <h3>🏦 Bank Account</h3>

                <p>
                  Add withdrawal account
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setShowBankModal(true)
                  }
                >
                  Manage
                </button>

              </div>
            </>
          )}

          

          {/* ACCOUNT */}
          <div
            className="action-card"
            onClick={() =>
              setShowAccount(true)
            }
          >
            <h3>👤 Account</h3>

            <p>
              Manage profile settings
            </p>
          </div>

        </div>

        {/* ACCOUNT MODAL */}
        {showAccount && (

          <div className="modal-overlay">

            <div className="profile-modal">

              <div className="modal-header">

                <h2>
                  Account Settings
                </h2>

                <button
                  onClick={() =>
                    setShowAccount(false)
                  }
                >
                  ✕
                </button>

              </div>

              <div className="account-content">

                <div className="profile-info">

                  <div className="profile-avatar large">
                    {profile.email?.charAt(0)?.toUpperCase()}
                  </div>

                 <h3>
  {profile.username?.trim() || profile.email?.split("@")[0]}
</h3>

                  <p>{role}</p>

                  <p>
    📞 {profile.phone}
</p>
<p>{profile.email}</p>

                </div>

                {/* DRIVER INFO */}
                {role === "DRIVER" && (
                  <>

                    <h3 className="section-title">
                      Vehicle Details
                    </h3>

                    <div className="driver-info-card">

                      <div className="driver-info-row">

                        <span>
                          Vehicle Number
                        </span>

                        <strong>
                          {profile.vehicle_number}
                        </strong>

                      </div>

                    </div>

                    {/* BANK INFO */}
                    {profile.bank_account && (

                      <>
                        <h3 className="section-title">
                          Bank Details
                        </h3>

                        <div className="driver-info-card">

                          <div className="driver-info-row">
                            <span>Bank</span>

                            <strong>
                              {
                                profile.bank_account.bank_name
                              }
                            </strong>
                          </div>

                          <div className="driver-info-row">
                            <span>
                              Account Holder
                            </span>

                            <strong>
                              {
                                profile.bank_account
                                  .account_holder_name
                              }
                            </strong>
                          </div>

                          <div className="driver-info-row">
                            <span>
                              Verification
                            </span>

                            <strong>
                              {
                                profile.bank_account
                                  .is_verified
                                  ? "Verified"
                                  : "Pending"
                              }
                            </strong>
                          </div>

                        </div>
                      </>
                    )}

                    {/* IMAGES */}
                    <div className="image-grid">

                      {[
                        "profile_image",
                        "dl_image",
                        "rc_image"
                      ].map((key) =>

                        profile[key] && (

                          <img
                            key={key}
                            src={
                              BASE_URL +
                              profile[key]
                            }
                            alt=""
                          />

                          

                        )

                      )}

                      

                    </div>

                  </>
                )}

                

              </div>
{role === "DRIVER" && (
    <div
        className="action-card"
        onClick={() => {
            setShowAccount(false);
            navigate("/wallet/withdrawals");
        }}
    >
        <h3>💸 Withdrawal History</h3>
        <p>View withdrawal requests</p>
    </div>
)}
              

            </div>



          </div>
        )}

        {/* ADD MONEY MODAL */}
        {showWallet && (

          <div className="modal-overlay">

            <div className="popup-card">

              <h2>
                💰 Add Money
              </h2>

              <input
                type="number"
                placeholder="Enter amount"
                className="popup-input"
                value={walletAmount}
                onChange={(e) =>
                  setWalletAmount(
                    e.target.value
                  )
                }
              />

              <div className="popup-actions">

                <button
                  className="primary-btn"
                  onClick={handleWalletTopup}
                >
                  Add
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setShowWallet(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

        {/* WITHDRAW MODAL */}
        {showWithdraw && (

          <div className="modal-overlay">

            <div className="popup-card">

              <h2>
                🏦 Withdraw Money
              </h2>

              <input
                type="number"
                placeholder="Enter amount"
                className="popup-input"
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(
                    e.target.value
                  )
                }
              />

              {!profile.bank_account && (
                <p className="warning-text">
                  ⚠ Add bank account first
                </p>
              )}

              <div className="popup-actions">

                <button
                  className="primary-btn"
                  onClick={handleWithdraw}
                >
                  Withdraw
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setShowWithdraw(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

        {/* BANK MODAL */}
        {showBankModal && (

          <div className="modal-overlay">

            <div className="popup-card">

              <h2>
                🏦 Bank Account
              </h2>

              <input
                type="text"
                name="account_holder_name"
                placeholder="Account Holder Name"
                className="popup-input"
                value={bankData.account_holder_name}
                onChange={handleBankChange}
              />

              <input
                type="text"
                name="bank_name"
                placeholder="Bank Name"
                className="popup-input"
                value={bankData.bank_name}
                onChange={handleBankChange}
              />

              <input
                type="text"
                name="account_number"
                placeholder="Account Number"
                className="popup-input"
                value={bankData.account_number}
                onChange={handleBankChange}
              />

              <input
                type="text"
                name="ifsc_code"
                placeholder="IFSC Code"
                className="popup-input"
                value={bankData.ifsc_code}
                onChange={handleBankChange}
              />

              <input
                type="text"
                name="upi_id"
                placeholder="UPI ID (Optional)"
                className="popup-input"
                value={bankData.upi_id}
                onChange={handleBankChange}
              />

              <div className="popup-actions">

                <button
                  className="primary-btn"
                  onClick={handleSaveBank}
                >
                  Save
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setShowBankModal(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

        {/* DRIVER FORM */}
        {showForm && (

          <div
            className="driver-modal-overlay"
            onClick={() =>
              setShowForm(false)
            }
          >

            <div
              className="driver-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}
              <div className="driver-modal-header">

                <div>

                  <h2>
                    Become a Driver 🚗
                  </h2>

                  <p>
                    Upload your documents
                    to start offering rides.
                  </p>

                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  ✕
                </button>

              </div>

              {/* ALERTS */}
              {error && (
                <div className="driver-alert error-alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="driver-alert success-alert">
                  {success}
                </div>
              )}

              {/* FORM */}
              <div className="driver-form">

                <div className="input-group">

                  <label>
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    name="vehicle_number"
                    placeholder="KA01AB1234"
                    onChange={handleChange}
                  />

                </div>

                <div className="upload-box">

                  <label>
                    Driving License
                  </label>

                  <input
                    type="file"
                    name="dl_image"
                    onChange={handleChange}
                  />

                </div>

                <div className="upload-box">

                  <label>
                    RC Document
                  </label>

                  <input
                    type="file"
                    name="rc_image"
                    onChange={handleChange}
                  />

                </div>

                <div className="upload-box">

                  <label>
                    Profile Photo
                  </label>

                  <input
                    type="file"
                    name="profile_image"
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* ACTIONS */}
              <div className="driver-actions">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={handleUpgrade}
                  disabled={uploading}
                >

                  {
                    uploading
                      ? "Uploading..."
                      : "Submit Application"
                  }

                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}