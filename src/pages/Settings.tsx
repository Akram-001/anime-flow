import { Layout } from "@/components/Layout";
import { 
  Settings as SettingsIcon, Moon, Sun, Volume2, Download, 
  Bell, Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";

export const Settings = () => {
  const { settings, updateSetting } = useSettings();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <SettingsIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Settings
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <Card className="glass border-primary/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(v) => updateSetting("darkMode", v)}
                />
              </div>
            </Card>

            {/* Video Settings */}
            <Card className="glass border-primary/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Video & Audio
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Play Next Episode</p>
                  <p className="text-sm text-muted-foreground">Automatically play next episode</p>
                </div>
                <Switch
                  checked={settings.autoPlay}
                  onCheckedChange={(v) => updateSetting("autoPlay", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Video Quality</p>
                  <p className="text-sm text-muted-foreground">Choose default playback quality</p>
                </div>
                <Select
                  value={settings.videoQuality}
                  onValueChange={(v) => updateSetting("videoQuality", v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080p">1080p HD</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="glass border-primary/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about new episodes</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(v) => updateSetting("notifications", v)}
                />
              </div>
            </Card>

            {/* Language */}
            <Card className="glass border-primary/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language & Region
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">App Language</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
                <Select
                  value={settings.language}
                  onValueChange={(v) => updateSetting("language", v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};