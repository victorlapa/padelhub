import { createBrowserRouter } from "react-router";
import App from "./App";
import Onboarding from "./pages/Onboarding";
import CompleteRegistration from "./pages/CompleteRegistration";
import CreateMatch from "./pages/CreateMatch";
import Profile from "./pages/Profile";
import Lobby from "./pages/Lobby";
import Match from "./pages/Match";
import AppLayout from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/complete-registration",
    element: (
      <ProtectedRoute>
        <CompleteRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "create-match",
        element: <CreateMatch />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "lobby/:lobbyId",
        element: <Lobby />,
      },
      {
        path: "match",
        element: <Match />,
      },
    ],
  },
]);
