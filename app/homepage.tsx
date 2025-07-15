"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Users, BarChart3, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-float-delay" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block p-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 mb-6"
            >
              <div className="bg-slate-950 rounded-full px-6 py-2">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  ניהול עסקי מהדור הבא
                </span>
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                נהל את העסק שלך
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                כמו שמעולם לא עשית
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl lg:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              פלטפורמת CRM ו-ERP מהפכנית המשלבת ניהול לקוחות, 
              עיבוד תשלומים ותפעול מאובטח במערכת אחת רבת עוצמה.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                התחל תקופת ניסיון חינם
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm"
              >
                צפה בהדגמה
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              תכונות רבות עוצמה
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              כל מה שאתה צריך כדי לנהל את העסק שלך ביעילות ובאבטחה
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group h-full">
                  <CardContent className="p-8">
                    <div className="mb-6 p-3 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 w-fit group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-cyan-600/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              מוכן לשנות את העסק שלך?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              הצטרף לאלפי עסקים שכבר משתמשים בפלטפורמה שלנו כדי לייעל תהליכים ולהגדיל צמיחה.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              התחל עכשיו
              <Rocket className="ml-3 h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Users,
    title: "ניהול לקוחות",
    description: "מערכת CRM מקיפה לניהול כל הלקוחות שלך, מעקב אחר אינטראקציות ובניית קשרים חזקים יותר."
  },
  {
    icon: BarChart3,
    title: "מערכת כרטיסי שירות",
    description: "מערכת כרטיסי שירות מתקדמת עם ניהול עדיפויות, מעקב הקצאות ועדכוני סטטוס בזמן אמת."
  },
  {
    icon: Shield,
    title: "תשלומים מאובטחים",
    description: "עיבוד תשלומים משולב עם Payplus, הכולל עסקאות מאובטחות והתאמות אוטומטיות."
  },
  {
    icon: Lock,
    title: "אבטחת Webhook",
    description: "טיפול ב-webhook ברמה ארגונית עם אימות קריפטוגרפי ורישום מקיף."
  },
  {
    icon: Zap,
    title: "עדכונים בזמן אמת",
    description: "התראות ועדכונים חיים בכל המודולים לנראות מיידית של התפעול שלך."
  },
  {
    icon: Rocket,
    title: "ביצועים גבוהים",
    description: "נבנה עם Next.js 15 וטכנולוגיות מודרניות לביצועים מהירים כברק ומדרגיות."
  }
];
