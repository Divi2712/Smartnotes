import React, {
  useState,
  useEffect
} from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";

import {
  getCurrentUser,
  logoutUser
} from "./js/auth";

import "./index.css";

type Page =
  | "login"
  | "register"
  | "workspace";

const App: React.FC = () => {
  const [page, setPage] =
    useState<Page>("login");

  const [userName, setUserName] =
    useState("User");

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    const userName =
      localStorage.getItem("userName");

    if (token) {

      setPage("workspace");

      if (userName) {
        setUserName(userName);
      }

    }

  }, []);

  useEffect(() => {

    window.history.replaceState(
      {},
      "",
      "/login"
    );

  }, []);

  useEffect(() => {

    const handlePopState = () => {

      if (page === "workspace") {

        setPage("login");

        window.history.pushState(
          {},
          "",
          "/login"
        );

      }

    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {

      window.removeEventListener(
        "popstate",
        handlePopState
      );

    };

  }, [page]);

  function handleLogin(name: string) {

    setUserName(name);

    window.history.pushState(
      {},
      "",
      "/workspace"
    );

    setPage("workspace");

  }

  function handleRegister(
    name: string
  ) {
    setUserName(name);
    setPage("workspace");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    logoutUser();
    setPage("login");
  }

  return (
    <>
      {page === "login" && (
        <Login
          onLogin={handleLogin}
          onGoRegister={() =>
            setPage("register")
          }
        />
      )}

      {page === "register" && (
        <Register
          onRegister={handleRegister}
          onGoLogin={() =>
            setPage("login")
          }
        />
      )}

      {page === "workspace" && (
        <Workspace
          userName={userName}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;