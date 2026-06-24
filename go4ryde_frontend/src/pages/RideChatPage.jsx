// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import ChatBox from "../components/ChatBox";
// import api from "../utils/axiosInstance";
// import "../css/pages/Chatpage.css";

// export default function RideChatPage() {

//     // ✅ GET BOOKING ID
//     const { bookingId } = useParams();

//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(true);
//     const [allowed, setAllowed] = useState(false);
//     const [error, setError] = useState("");

//     // ====================================
//     // 🚀 PAGE LOAD
//     // ====================================
//     useEffect(() => {

//         if (!bookingId) {

//             setError("Invalid booking");

//             setLoading(false);

//             return;
//         }

//         checkAccess();

//     }, [bookingId]);

//     // ====================================
//     // 🔐 CHECK ACCESS
//     // ====================================
//     const checkAccess = async () => {

//         try {

//             console.log("🔥 BOOKING ID:", bookingId);

//             // ✅ booking based route
//             const res = await api.get(`/chat/${bookingId}/`);

//             console.log("✅ CHAT RESPONSE:", res.data);

//             setAllowed(true);

//         } catch (err) {

//             console.log(
//                 "❌ CHAT ERROR:",
//                 err.response?.data || err.message
//             );

//             // ❌ LOGIN REQUIRED
//             if (err.response?.status === 401) {

//                 setError("Please login first");

//                 setTimeout(() => {
//                     navigate("/login");
//                 }, 1500);
//             }

//             // ❌ FORBIDDEN
//             else if (err.response?.status === 403) {

//                 setError(
//                     "You are not allowed to access this chat"
//                 );
//             }

//             // ❌ ROOM NOT FOUND
//             else if (err.response?.status === 404) {

//                 setError("Chat room not found");
//             }

//             // ❌ SERVER
//             else if (err.response?.status === 500) {

//                 setError("Server error while loading chat");
//             }

//             // ❌ UNKNOWN
//             else {

//                 setError("Unable to load chat");
//             }

//         } finally {

//             console.log("✅ FINISHED LOADING");

//             setLoading(false);
//         }
//     };

//     // ====================================
//     // ⏳ LOADING
//     // ====================================
//     if (loading) {

//         return (
//             <div className="chat-loading">

//                 <div className="chat-loader"></div>

//                 <p>Loading chat...</p>

//             </div>
//         );
//     }

//     // ====================================
//     // ❌ ERROR
//     // ====================================
//     if (!allowed) {

//         return (
//             <div className="chat-error-page">

//                 <div className="chat-error-card">

//                     <h2>Chat Error</h2>

//                     <p>{error}</p>

//                     <button
//                         className="chat-back-btn"
//                         onClick={() =>
//                             navigate("/my-bookings")
//                         }
//                     >
//                         Go to My Bookings
//                     </button>

//                 </div>

//             </div>
//         );
//     }

//     // ====================================
//     // ✅ CHAT PAGE
//     // ====================================
//     return (
//         <div className="chat-page">

//             {/* HEADER */}
//             <div className="chat-header">

//                 <div className="chat-header-left">

//                     <button
//                         className="back-icon"
//                         onClick={() => navigate(-1)}
//                     >
//                         ←
//                     </button>

//                     <div>

//                         <h3>Ride Chat</h3>

//                         <p>
//                             Booking #{bookingId}
//                         </p>

//                     </div>

//                 </div>

//                 <div className="chat-status">
//                     🟢 Online
//                 </div>

//             </div>

//             {/* CHAT */}
//             <div className="chat-body">

//                 {/* ✅ booking based chat */}
//                 <ChatBox bookingId={bookingId} />

//             </div>

//         </div>
//     );
// }


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import api from "../utils/axiosInstance";
import "../css/pages/Chatpage.css";

export default function RideChatPage() {

    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!bookingId) {
            setError("Invalid booking");
            setLoading(false);
            return;
        }

        checkAccess();

    }, [bookingId]);

    const checkAccess = async () => {

        try {

            await api.get(`/chat/${bookingId}/`);

            setAllowed(true);

        } catch (err) {

            if (err.response?.status === 401) {

                setError("Please login first");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);

            } else if (err.response?.status === 403) {

                setError("You are not allowed to access this chat");

            } else if (err.response?.status === 404) {

                setError("Chat room not found");

            } else {

                setError("Unable to load chat");

            }

        } finally {

            setLoading(false);

        }
    };

    if (loading) {

        return (
            <div className="go4ryde-chat-loading">

                <div className="go4ryde-chat-loader"></div>

                <p>Loading chat...</p>

            </div>
        );
    }

    if (!allowed) {

        return (
            <div className="go4ryde-chat-error-page">

                <div className="go4ryde-chat-error-card">

                    <h2>Chat Error</h2>

                    <p>{error}</p>

                    <button
                        className="go4ryde-chat-back-btn"
                        onClick={() => navigate("/my-bookings")}
                    >
                        Back to My Bookings
                    </button>

                </div>

            </div>
        );
    }

    return (

        <div className="go4ryde-chat-page">

            <div className="go4ryde-chat-container">

                {/* HEADER */}

                <div className="go4ryde-chat-header">

                    <div className="go4ryde-chat-header-left">

                        <button
                            className="go4ryde-back-btn"
                            onClick={() => navigate(-1)}
                        >
                            ←
                        </button>

                        <div>

                            <h3>Ride Chat</h3>

                            <p>
                                Booking #{bookingId}
                            </p>

                        </div>

                    </div>

                    <div className="go4ryde-chat-status">
                        🟢 Online
                    </div>

                </div>

                {/* CHAT */}

                <div className="go4ryde-chat-body">

                    <ChatBox bookingId={bookingId} />

                </div>

            </div>

        </div>

    );
}