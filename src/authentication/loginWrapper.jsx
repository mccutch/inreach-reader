import React, { useState } from "react";
import { getToken } from "./myJWT";
import { StandardModal } from "../components/reactComponents";

const DEMO_USERNAME = process.env.REACT_APP_DEMO_USERNAME;
const DEMO_PW = process.env.REACT_APP_DEMOUSER_PW;

export function LoginForm({ onSuccess, hideModal }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [loginFailed, setLoginFailed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (username && password) {
      getJWT({
        username: username,
        password: password,
      });
    }
  }

  function getJWT(data) {
    getToken({
      data: data,
      onSuccess: onSuccess,
      onFailure: setLoginFailed(true),
    });
  }

  const title = <div>Login</div>;
  //TODO implement password recovery
  const form = (
    <div>
      {loginFailed && (
        <p>
          Login failed.{" "}
          <a href="/account/password_reset/">Forgot your password?</a>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username or Email"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="form-control m-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className="form-control m-2"
        />
        <button type="submit" className="btn btn-success m-2">
          Login
        </button>
      </form>
    </div>
  );

  return <StandardModal hideModal={hideModal} title={title} body={form} />;
}

export function demoLogin({ onSuccess, onFailure }) {
  let data = {
    username: DEMO_USERNAME,
    password: DEMO_PW,
  };
  getToken({ data: data, onSuccess: onSuccess, onFailure: onFailure });
}
