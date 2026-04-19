import React from "react";
import { useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";

export default function RideChatPage() {
    const { rideId } = useParams();

    return (
        <div>
            <h2>Ride Chat</h2>
            <ChatBox rideId={rideId} />
        </div>
    );
}