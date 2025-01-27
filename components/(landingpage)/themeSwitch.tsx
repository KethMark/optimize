"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <RadioGroup
      value={theme}
      onValueChange={(value) => {
        setTheme(value);
      }}
      className="flex gap-1"
    >
      <RadioGroupItem
        aria-label="Switch to System Mode"
        icon={LaptopMinimal}
        value="system"
        id="system"
      />

      <RadioGroupItem
        aria-label="Switch to Light Mode"
        icon={Sun}
        value="light"
        id="light"
      />

      <RadioGroupItem
        aria-label="Switch to Dark Mode"
        icon={Moon}
        value="dark"
        id="dark"
      />
    </RadioGroup>
  );
};

export default ThemeSwitch;
