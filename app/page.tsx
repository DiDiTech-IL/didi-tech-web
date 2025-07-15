"use client"

import RTLWrapper from "@/components/RTLWrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Logo from "@/public/תכל’ס.png"
import {
  Code,
  Database,
  Route,
  Shield
} from "lucide-react"
import Image from "next/image"

const practicalFeatures = [
  {
    icon: Code,
    title: "אפליקציות אינטרנט",
    description:
      "אפליקציות אינטרנט מוכנות לייצור הבנויות עם טכנולוגיות מוכחות. ללא frameworks ניסיוניים - רק פתרונות אמינים שעובדים.",
    tech: ["Next.js", "React", "TypeScript"],
  },

  {
    icon: Database,
    title: "מערכות צד שרת",
    description: "APIs ומסדי נתונים מדרגיים המתוכננים לשימוש בעולם האמיתי. נבנו להתמודד עם צמיחה מהיום הראשון.",
    tech: ["Node.js", "PostgreSQL", "Redis"],
  },
  {
    icon: Route,
    title: "אינטגרציות והטמעת שירותים",
    description: "אנחנו מלווים אתכם בתהליך ההטמעה של המערכת, כך שלא תבזבזו זמן בעבודה סיזיפית",

  },
]


export default function Home() {
  return (
    <RTLWrapper className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 font-rubik">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 leading-10">
              <Image src={Logo} alt="תכל'ס.Dev" height={40} className="rounded-lg" />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-slate-600 hover:text-sky-600 font-medium">
                שירותים
              </a>
              <a href="#work" className="text-slate-600 hover:text-sky-600 font-medium">
                העבודות שלנו
              </a>
              <a href="#contact" className="text-slate-600 hover:text-sky-600 font-medium">
                צור קשר
              </a>
            </nav>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6 bg-sky-100 text-sky-800 border-sky-200">
            <Shield className="w-3 h-3 mr-1" />
            פתרונות פיתוח מעשיים
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 font-heebo mb-6 leading-tight">
            פרויקט מורכב?
            <br />
            <span className="text-sky-600 font-extrabold">פתרון תכל&apos;ס.</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-assistant leading-relaxed">
            אנחנו בונים אפליקציות שעובדות באמת בעולם האמיתי. ללא הנדסת יתר, ללא מורכבות מיותרת -
            רק תוכנה אמינה שפותרת את הבעיות העסקיות שלכם ביעילות.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heebo font-bold text-slate-900 mb-4">מה אנחנו באמת בונים</h2>
            <p className="text-xl text-slate-600 font-assistant max-w-2xl mx-auto">
              אפליקציות אמיתיות במקסימום פרקטיקה. אנחנו מתמקדים בפתרונות שעובדים, לא רק בטכנולוגיות שנשמעות
              מרשימות.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {practicalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-sky-100 p-3 rounded-lg flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.tech && feature.tech.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section id="contact" className="py-20 bg-sky-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-heebo font-bold mb-6">מוכנים לבנות משהו שעובד?</h2>
          <p className="text-xl text-sky-100 font-rubik mb-10 max-w-3xl mx-auto">
            בואו נדבר על הפרויקט שלכם. ללא התחייבות - רק שיחה מעשית על מה שאתם צריכים.
          </p>

          <div className="mt-12 text-sky-100 text-base">
            <p>📧 support@tachles.dev | 📱 זמינים לשיחות בעברית ואנגלית</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0 leading-10">
              <Image
                src={Logo}
                alt="תכל'ס.Dev"
                height={32}
                className="rounded-lg"
                style={{ filter: "brightness(0.3) invert(1)" }}
              />
            </div>

            <div className="text-slate-400 text-sm font-rubik">© 2025 תכל&apos;ס.Dev - פיתוח אפליקציות מעשי</div>
          </div>
        </div>
      </footer>
    </RTLWrapper>
  )
}
