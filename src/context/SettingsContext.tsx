import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "en" | "ar" | string;

interface SettingsContextValue {
  theme: Theme;
  language: Language;
  notifications: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Language) => void;
  toggleNotifications: () => void;
}

const SETTINGS_KEY = "animeflow_settings_v1";

const defaultValue: SettingsContextValue = {
  theme: "light",
  language: "en",
  notifications: true,
  setTheme: () => {},
  toggleTheme: () => {},
  setLanguage: () => {},
  toggleNotifications: () => {},
};

const SettingsContext = createContext<SettingsContextValue>(defaultValue);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(defaultValue.theme);
  const [language, setLanguageState] = useState<Language>(defaultValue.language);
  const [notifications, setNotifications] = useState<boolean>(defaultValue.notifications);

  // load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.language) setLanguageState(parsed.language);
        if (typeof parsed.notifications === "boolean") setNotifications(parsed.notifications);
      }
    } catch (e) {
      console.warn("Settings: could not read from localStorage", e);
    }
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme, language, notifications }));
    } catch (e) {
      console.warn("Settings: could not save to localStorage", e);
    }
  }, [theme, language, notifications]);

  // Side effects: apply theme + lang/dir on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");

    html.lang = language ?? "en";
    html.dir = language === "ar" ? "rtl" : "ltr";
  }, [theme, language]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((p) => (p === "dark" ? "light" : "dark"));
  const setLanguage = (l: Language) => setLanguageState(l);
  const toggleNotifications = () => setNotifications((p) => !p);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        notifications,
        setTheme,
        toggleTheme,
        setLanguage,
        toggleNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);