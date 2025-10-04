import React, { createContext, useContext, useState } from "react";

type SettingsType = {
  darkMode: boolean;
  autoPlay: boolean;
  videoQuality: string;
  notifications: boolean;
  language: string;
};

type SettingsContextType = {
  settings: SettingsType;
  updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
};

const defaultSettings: SettingsType = {
  darkMode: false,
  autoPlay: true,
  videoQuality: "1080p",
  notifications: true,
  language: "en",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      <div className={settings.darkMode ? "dark" : ""}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};