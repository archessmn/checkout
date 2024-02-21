"use client";

import { signIn } from "next-auth/react";

export function SignIn() {
  // signIn("kanidm");

  return (
    <>
      <p>Auth needed</p>
      <button onClick={() => signIn("kanidm")}>Sign In</button>
    </>
  );
}
