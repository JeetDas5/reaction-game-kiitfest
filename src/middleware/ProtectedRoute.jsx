import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ currentUser, children }) {
  const isAuthenticated =
    currentUser &&
    typeof currentUser.kfid === "string" &&
    currentUser.kfid.trim().length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
