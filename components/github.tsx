"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import { Icon } from "./ui/icon";

export const GithubProvider = () => {
  const [isLoading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={isLoading}
      onClick={async () => {
        setLoading(true);
        try {
          await signIn("github", {
            callbackUrl: "/session",
          });
        } catch (error) {
          console.error("Error during sign-in:", error);
          setLoading(false);
        }
      }}
    >
      <Icon.Github className="mr-2 h-4 w-4" />
      Login with GitHub
    </Button>
  );
};
