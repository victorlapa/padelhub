import { createBrowserRouter } from "react-router";
import App from "./App";
import Onboarding from "./pages/Onboarding";
import CreateMatch from "./pages/CreateMatch";
import Profile from "./pages/Profile";
import Lobby from "./pages/Lobby";
import Match from "./pages/Match";
import AppLayout from "./layouts/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/app",
    element: <AppLayout />,
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
