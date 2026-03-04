import { JSX } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./global.css";

import LandingComponent from "./index/landing";
import NavBar from "./components/navigation";
import LoginForm from "./authentication/login";
import RegisterForm from "./authentication/signup";
import UserManagment from "./admin/users";
import AddItemPage from "./company_assets/add_item";
import PageNotFound from "./components/404_error";
import ViewAssets from "./company_assets/view_assets";

import { useAuth } from "./authentication/auth";
import Logout from "./authentication/logout";
import CreateNewMovementPage from "./company_assets/create_new_movement";

export function App(): JSX.Element {
  const { access_level, token } = useAuth();

  const routes: JSX.Element[] = [
    <Route path="/login" element={<LoginForm />} key={0} />,
    <Route path="/register" element={<RegisterForm />} key={1} />,
  ];

  const userRoutes: JSX.Element[] = [
    <Route path="/" element={<LandingComponent />} key={2} />,
    <Route path="/view" element={<ViewAssets />} key={3} />,
    <Route path="/add" element={<AddItemPage />} key={4} />,
    <Route
      path="/create_new_movement"
      element={<CreateNewMovementPage />}
      key={5}
    />,
    <Route path="/logout" element={<Logout />} key={6} />,
    <Route path="*" element={<PageNotFound />} key={7} />,
  ];

  const adminRoutes: JSX.Element[] = [
    <Route path="/users" element={<UserManagment />} key={8} />,
  ];

  return (
    <BrowserRouter>
      <div className="page-background min-h-screen pb-16">
        {token != "" ? <NavBar /> : <></>}

        <Routes>
          {routes}
          {token != "" ? (
            userRoutes
          ) : (
            <Route path="*" element={<LoginForm />} />
          )}
          {access_level > 1 ? adminRoutes : <></>}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
