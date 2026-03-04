import React, { useState, useContext, createContext, JSX } from "react";

interface ProvideAuthInterface {
  uname: string;
  token: string;
  access_level: number;
  errors: any[];
  isLoading: boolean;
  login: (username: string, password: string) => void;
  register: (
    employee_id: string,
    full_name: string,
    email: string,
    password: string,
  ) => void;
  logout: () => void;
}

const defaultAuth: ProvideAuthInterface = {
  uname: "",
  access_level: 1,
  token: "",
  errors: [],
  isLoading: false,
  login: (username: string, password: string) => {},
  register: (
    employee_id: string,
    full_name: string,
    email: string,
    password: string,
  ) => {},
  logout: () => {},
};

const authContext = createContext<ProvideAuthInterface>(defaultAuth);

export function ProvideAuth({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const auth: ProvideAuthInterface = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth(): ProvideAuthInterface {
  const [uname, setUname] = useState<string>("");
  const [access_level, setAccessLevel] = useState<number>(1);
  const [token, setToken] = useState<string>("");
  const [errors, setErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function login(employee_id: string, password: string) {
    setIsLoading(true);
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    headers.set("Accept", "application/json");
    headers.set("Authorization", "Basic Og==");

    const AuthRequest: RequestInfo = new Request("/api/token", {
      method: "POST",
      headers: headers,
      body: `grant_type=password&username=${employee_id}&password=${password}`,
    });

    fetch(AuthRequest).then((auth_res) => {
      if (auth_res.ok) {
        auth_res.json().then((auth_json) => {
          setToken(auth_json.access_token);

          const meHeaders: Headers = new Headers();
          meHeaders.set("Content-Type", "application/json");
          meHeaders.set("Accept", "application/json");
          meHeaders.set("Authorization", `Bearer ${auth_json.access_token}`);

          const MeRequest: RequestInfo = new Request("/api/users/me/", {
            method: "GET",
            headers: meHeaders,
          });
          fetch(MeRequest).then((me_res) => {
            setIsLoading(false);
            if (me_res.ok) {
              me_res.json().then((me_json) => {
                setUname(me_json.full_name);
                setAccessLevel(me_json.access_level);
              });
            } else {
              me_res.json().then((me_err) => {
                setErrors([...errors, me_err.errors]);
              });
            }
          });
        });
      } else {
        auth_res.json().then((me_err) => {
          alert("Login with the spefied credentials failed!");
          setErrors(me_err.errors);
        });
      }
    });
  }

  function register(
    employee_id: string,
    full_name: string,
    email: string,
    password: string,
  ) {
    setIsLoading(true);
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("Authorization", "Basic Og==");

    const AuthRequest: RequestInfo = new Request("/api/users/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        employee_id: employee_id,
        full_name: full_name,
        email: email,
        unhashed_password: password,
      }),
    });

    fetch(AuthRequest).then((auth_res) => {
      setIsLoading(false);
      if (auth_res.ok) {
        auth_res.json().then((auth_json) => {
          alert(`Registed User "${full_name}"`);
        });
      } else {
        auth_res.json().then((me_err) => {
          setErrors(me_err.errors);
          if (auth_res.status == 412) {
            alert("Employee ID is already taken");
          } else {
            alert("Failed to create new user");
          }
        });
      }
    });
  }

  function logout() {
    setToken("");
  }

  return {
    uname,
    access_level,
    token,
    errors,
    isLoading,
    login,
    register,
    logout,
  };
}
