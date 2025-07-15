"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Database,
  Shield,
  Globe,
  Server,
  BarChart3,
  Save,
  RefreshCw,
  CheckCircle,
  Layout,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  defaultUserRole: string;
  sessionTimeout: string;
  maxFileUploadSize: string;
  timezone: string;
  language: string;
}

interface DashboardSettings {
  showWelcomeMessage: boolean;
  defaultDashboardView: string;
  enableNotifications: boolean;
  enableDarkMode: boolean;
  showQuickActions: boolean;
  enableAnimations: boolean;
  autoRefreshInterval: string;
  maxRecentItems: string;
  compactMode: boolean;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  passwordMinLength: string;
  passwordComplexity: boolean;
  loginAttempts: string;
  sessionSecurity: boolean;
  apiRateLimit: string;
  ipWhitelist: string;
  auditLogging: boolean;
}

interface IntegrationSettings {
  emailProvider: string;
  smsProvider: string;
  analyticsEnabled: boolean;
  backupEnabled: boolean;
  webhooksEnabled: boolean;
  apiDocsEnabled: boolean;
  healthChecksEnabled: boolean;
}

export default function PlatformSettings() {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('platform');
  const [loading, setLoading] = useState(false);
  
  const [platformConfig, setPlatformConfig] = useState<PlatformSettings>({
    siteName: 'Tachles.dev',
    siteDescription: 'פלטפורמה מתקדמת לניהול עסקי',
    supportEmail: 'support@tachles.dev',
    maintenanceMode: false,
    registrationEnabled: true,
    defaultUserRole: 'user',
    sessionTimeout: '30',
    maxFileUploadSize: '10',
    timezone: 'Asia/Jerusalem',
    language: 'he'
  });
  
  const [dashboardConfig, setDashboardConfig] = useState<DashboardSettings>({
    showWelcomeMessage: true,
    defaultDashboardView: 'overview',
    enableNotifications: true,
    enableDarkMode: false,
    showQuickActions: true,
    enableAnimations: true,
    autoRefreshInterval: '30',
    maxRecentItems: '10',
    compactMode: false
  });
  
  const [securityConfig, setSecurityConfig] = useState<SecuritySettings>({
    twoFactorRequired: false,
    passwordMinLength: '8',
    passwordComplexity: true,
    loginAttempts: '5',
    sessionSecurity: true,
    apiRateLimit: '1000',
    ipWhitelist: '',
    auditLogging: true
  });
  
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationSettings>({
    emailProvider: 'smtp',
    smsProvider: 'twilio',
    analyticsEnabled: true,
    backupEnabled: true,
    webhooksEnabled: true,
    apiDocsEnabled: true,
    healthChecksEnabled: true
  });

  const handleSavePlatform = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "הגדרות פלטפורמה נשמרו",
        description: "כל ההגדרות עודכנו בהצלחה",
      });
    } catch {
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הגדרות הפלטפורמה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDashboard = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "הגדרות לוח בקרה נשמרו",
        description: "הגדרות הממשק עודכנו בהצלחה",
      });
    } catch {
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הגדרות לוח הבקרה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "הגדרות אבטחה נשמרו",
        description: "הגדרות האבטחה עודכנו בהצלחה",
      });
    } catch {
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הגדרות האבטחה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "הגדרות אינטגרציות נשמרו",
        description: "הגדרות החיבורים עודכנו בהצלחה",
      });
    } catch {
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הגדרות האינטגרציות",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              הגדרות מערכת
            </h1>
          </div>
          <p className="text-gray-600">נהל את הגדרות הפלטפורמה, לוח הבקרה והאבטחה</p>
        </motion.div>

        {/* System Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">סטטוס מערכת</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">פעילה</span>
                  </div>
                </div>
                <Server className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">משתמשים פעילים</p>
                  <p className="text-2xl font-bold text-blue-600">247</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">זיכרון בשימוש</p>
                  <p className="text-2xl font-bold text-orange-600">68%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">גיבוי אחרון</p>
                  <p className="text-sm text-gray-600">לפני 2 שעות</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="platform" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                פלטפורמה
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                לוח בקרה
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                אבטחה
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                אינטגרציות
              </TabsTrigger>
            </TabsList>

            {/* Platform Settings */}
            <TabsContent value="platform" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    הגדרות פלטפורמה כלליות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName">שם האתר</Label>
                      <Input
                        id="siteName"
                        value={platformConfig.siteName}
                        onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supportEmail">אימייל תמיכה</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={platformConfig.supportEmail}
                        onChange={(e) => setPlatformConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">תיאור האתר</Label>
                    <Textarea
                      id="siteDescription"
                      value={platformConfig.siteDescription}
                      onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="timezone">אזור זמן</Label>
                      <Select value={platformConfig.timezone} onValueChange={(value) => setPlatformConfig(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Jerusalem">ירושלים (GMT+2)</SelectItem>
                          <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                          <SelectItem value="America/New_York">ניו יורק (EST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">שפה ברירת מחדל</Label>
                      <Select value={platformConfig.language} onValueChange={(value) => setPlatformConfig(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="he">עברית</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="defaultUserRole">תפקיד ברירת מחדל</Label>
                      <Select value={platformConfig.defaultUserRole} onValueChange={(value) => setPlatformConfig(prev => ({ ...prev, defaultUserRole: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">משתמש</SelectItem>
                          <SelectItem value="manager">מנהל</SelectItem>
                          <SelectItem value="admin">מנהל מערכת</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">הגדרות מערכת</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">מצב תחזוקה</Label>
                        <p className="text-sm text-muted-foreground">מונע גישה למשתמשים רגילים</p>
                      </div>
                      <Switch
                        checked={platformConfig.maintenanceMode}
                        onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">הרשמה פתוחה</Label>
                        <p className="text-sm text-muted-foreground">אפשר למשתמשים חדשים להירשם</p>
                      </div>
                      <Switch
                        checked={platformConfig.registrationEnabled}
                        onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, registrationEnabled: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sessionTimeout">פסק זמן התחברות (דקות)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={platformConfig.sessionTimeout}
                          onChange={(e) => setPlatformConfig(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxFileUploadSize">גודל קובץ מקסימלי (MB)</Label>
                        <Input
                          id="maxFileUploadSize"
                          type="number"
                          value={platformConfig.maxFileUploadSize}
                          onChange={(e) => setPlatformConfig(prev => ({ ...prev, maxFileUploadSize: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSavePlatform} disabled={loading} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "שומר..." : "שמור הגדרות פלטפורמה"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Settings */}
            <TabsContent value="dashboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    הגדרות לוח בקרה וממשק
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">תצוגה כללית</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">הצג הודעת ברוכים הבאים</Label>
                        <p className="text-sm text-muted-foreground">הודעה מותאמת למשתמשים חדשים</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.showWelcomeMessage}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, showWelcomeMessage: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">הצג פעולות מהירות</Label>
                        <p className="text-sm text-muted-foreground">כפתורי גישה מהירה בדף הבית</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.showQuickActions}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, showQuickActions: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">מצב קומפקטי</Label>
                        <p className="text-sm text-muted-foreground">תצוגה דחוסה יותר</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.compactMode}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, compactMode: checked }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="defaultDashboardView">תצוגת ברירת מחדל</Label>
                      <Select value={dashboardConfig.defaultDashboardView} onValueChange={(value) => setDashboardConfig(prev => ({ ...prev, defaultDashboardView: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overview">סקירה כללית</SelectItem>
                          <SelectItem value="analytics">אנליטיקס</SelectItem>
                          <SelectItem value="recent">פעילות אחרונה</SelectItem>
                          <SelectItem value="projects">פרויקטים</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">התנהגות ממשק</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">התראות בזמן אמת</Label>
                        <p className="text-sm text-muted-foreground">התראות מיידיות על אירועים</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.enableNotifications}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, enableNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">מצב כהה</Label>
                        <p className="text-sm text-muted-foreground">ערכת צבעים כהה</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.enableDarkMode}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, enableDarkMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">אנימציות</Label>
                        <p className="text-sm text-muted-foreground">אפקטים חזותיים ומעברים</p>
                      </div>
                      <Switch
                        checked={dashboardConfig.enableAnimations}
                        onCheckedChange={(checked) => setDashboardConfig(prev => ({ ...prev, enableAnimations: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="autoRefreshInterval">רענון אוטומטי (שניות)</Label>
                        <Input
                          id="autoRefreshInterval"
                          type="number"
                          value={dashboardConfig.autoRefreshInterval}
                          onChange={(e) => setDashboardConfig(prev => ({ ...prev, autoRefreshInterval: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxRecentItems">מספר פריטים אחרונים</Label>
                        <Input
                          id="maxRecentItems"
                          type="number"
                          value={dashboardConfig.maxRecentItems}
                          onChange={(e) => setDashboardConfig(prev => ({ ...prev, maxRecentItems: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveDashboard} disabled={loading} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "שומר..." : "שמור הגדרות לוח בקרה"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    הגדרות אבטחה ופרטיות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">אבטחת משתמשים</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">אימות דו-שלבי חובה</Label>
                        <p className="text-sm text-muted-foreground">דרוש מכל המשתמשים</p>
                      </div>
                      <Switch
                        checked={securityConfig.twoFactorRequired}
                        onCheckedChange={(checked) => setSecurityConfig(prev => ({ ...prev, twoFactorRequired: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">סיסמאות מורכבות</Label>
                        <p className="text-sm text-muted-foreground">דרוש אותיות, מספרים וסימנים</p>
                      </div>
                      <Switch
                        checked={securityConfig.passwordComplexity}
                        onCheckedChange={(checked) => setSecurityConfig(prev => ({ ...prev, passwordComplexity: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="passwordMinLength">אורך מינימלי לסיסמה</Label>
                        <Input
                          id="passwordMinLength"
                          type="number"
                          value={securityConfig.passwordMinLength}
                          onChange={(e) => setSecurityConfig(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="loginAttempts">ניסיונות התחברות מקסימליים</Label>
                        <Input
                          id="loginAttempts"
                          type="number"
                          value={securityConfig.loginAttempts}
                          onChange={(e) => setSecurityConfig(prev => ({ ...prev, loginAttempts: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">אבטחת API ומערכת</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">אבטחת סשן מתקדמת</Label>
                        <p className="text-sm text-muted-foreground">בדיקות נוספות לזיהוי</p>
                      </div>
                      <Switch
                        checked={securityConfig.sessionSecurity}
                        onCheckedChange={(checked) => setSecurityConfig(prev => ({ ...prev, sessionSecurity: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">רישום ביקורת</Label>
                        <p className="text-sm text-muted-foreground">שמור לוגים של כל הפעולות</p>
                      </div>
                      <Switch
                        checked={securityConfig.auditLogging}
                        onCheckedChange={(checked) => setSecurityConfig(prev => ({ ...prev, auditLogging: checked }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiRateLimit">הגבלת קצב API (בקשות לשעה)</Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={securityConfig.apiRateLimit}
                        onChange={(e) => setSecurityConfig(prev => ({ ...prev, apiRateLimit: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ipWhitelist">רשימת IP מורשים (אופציונלי)</Label>
                      <Textarea
                        id="ipWhitelist"
                        value={securityConfig.ipWhitelist}
                        onChange={(e) => setSecurityConfig(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                        placeholder="192.168.1.1, 10.0.0.0/24"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSecurity} disabled={loading} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "שומר..." : "שמור הגדרות אבטחה"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Settings */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    אינטגרציות וחיבורים חיצוניים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ספקי שירות</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emailProvider">ספק אימייל</Label>
                        <Select value={integrationConfig.emailProvider} onValueChange={(value) => setIntegrationConfig(prev => ({ ...prev, emailProvider: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smtp">SMTP מותאם</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                            <SelectItem value="ses">Amazon SES</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="smsProvider">ספק SMS</Label>
                        <Select value={integrationConfig.smsProvider} onValueChange={(value) => setIntegrationConfig(prev => ({ ...prev, smsProvider: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="nexmo">Nexmo</SelectItem>
                            <SelectItem value="aws-sns">AWS SNS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">תכונות מערכת</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">אנליטיקס</Label>
                          <p className="text-sm text-muted-foreground">מעקב שימוש ונתונים</p>
                        </div>
                        <Switch
                          checked={integrationConfig.analyticsEnabled}
                          onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, analyticsEnabled: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">גיבוי אוטומטי</Label>
                          <p className="text-sm text-muted-foreground">גיבוי יומי לענן</p>
                        </div>
                        <Switch
                          checked={integrationConfig.backupEnabled}
                          onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, backupEnabled: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Webhooks</Label>
                          <p className="text-sm text-muted-foreground">התראות לשירותים חיצוניים</p>
                        </div>
                        <Switch
                          checked={integrationConfig.webhooksEnabled}
                          onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, webhooksEnabled: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">תיעוד API</Label>
                          <p className="text-sm text-muted-foreground">ממשק למפתחים</p>
                        </div>
                        <Switch
                          checked={integrationConfig.apiDocsEnabled}
                          onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, apiDocsEnabled: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">בדיקות תקינות</Label>
                          <p className="text-sm text-muted-foreground">מוניטורינג של המערכת</p>
                        </div>
                        <Switch
                          checked={integrationConfig.healthChecksEnabled}
                          onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, healthChecksEnabled: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">פעולות מערכת</h3>
                    <div className="flex gap-4 flex-wrap">
                      <Button variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        בדוק חיבורים
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        גבה נתונים עכשיו
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        צור דוח מערכת
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleSaveIntegrations} disabled={loading} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "שומר..." : "שמור הגדרות אינטגרציות"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
