import { useEffect, useState } from "react";

export type SettingsType = {
  darkMode: boolean;
  notifications: boolean;
  autoPlay: boolean;
  videoQuality: string;
  language: string;
};

const defaultSettings: SettingsType = {
  darkMode: false,
  notifications: true,
  autoPlay: true,
  videoQuality: "720p",
  language: "en",
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  // تحميل الإعدادات من localStorage عند أول تشغيل
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      const parsed: SettingsType = JSON.parse(saved);
      setSettings(parsed);

      // تطبيق وضع المظلم فوراً
      if (parsed.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // تحديث أي إعداد
  const updateSetting = (key: keyof SettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));

    // تطبيق مباشر لوضع المظلم
    if (key === "darkMode") {
      if (value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return { settings, updateSetting };
};