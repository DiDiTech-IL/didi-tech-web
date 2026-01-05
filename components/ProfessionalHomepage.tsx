"use client"

import ProjectsShowcase from "@/components/ProjectsShowcase"
import { Button } from "@/components/ui/button"
import Logo from "@/public/תכל’ס.png"
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion"
import { ArrowLeft, Mail, MessageCircle, PhoneCall, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

type IntroPhase = "floating" | "condense" | "title"

export default function ProfessionalHomepage() {
    const { scrollY } = useScroll()
    const [introPhase, setIntroPhase] = useState<IntroPhase>("floating")
    const [activeSnapshotIndex, setActiveSnapshotIndex] = useState<number>(0)
    const introTimersRef = useRef<number[]>([])

    const progressionRef = useRef<HTMLDivElement | null>(null)
    const progressionInView = useInView(progressionRef, { once: true, margin: "-20% 0px" })
    const progressionTimersRef = useRef<number[]>([])

    const contactSnapshots = useMemo(
        () => [
            {
                key: "phone",
                icon: PhoneCall,
                title: "שיחת טלפון",
                tone: "הכי קל ליצור קשר",
                message: "שלום, רציתי לדבר איתך על אתר לעסק שלי",
                className: "top-[18%] left-[8%]",
                accent: "from-amber-400 to-orange-500",
            },
            {
                key: "whatsapp",
                icon: MessageCircle,
                title: "וואטסאפ",
                tone: "איתך לאורך כל הדרך",
                message: "איפה אנחנו עומדים? מה הצפי שלנו?",
                className: "top-[28%] right-[24%]",
                accent: "from-emerald-400 to-teal-500",
            },
            {
                key: "email",
                icon: Mail,
                title: "אימייל",
                tone: "כל מה שמסביב",
                message: "אשמח לקבוע הדרכה למשתמשים שלי על המערכת החדשה",
                className: "top-[54%] right-[10%]",
                accent: "from-violet-500 to-purple-600",
            },
        ],
        []
    )

    const clearIntroTimers = () => {
        introTimersRef.current.forEach((t) => window.clearTimeout(t))
        introTimersRef.current = []
    }

    const clearProgressionTimers = () => {
        progressionTimersRef.current.forEach((t) => window.clearTimeout(t))
        progressionTimersRef.current = []
    }

    useEffect(() => {
        if (typeof window === "undefined") return
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
        if (reduceMotion) {
            setIntroPhase("title")
            return
        }

        clearIntroTimers()
        setIntroPhase("floating")
        setActiveSnapshotIndex(0)

        // Sequence (longer message duration):
        // phone -> email -> whatsapp -> condense -> title
        const snapshotDurationMs = 2600
        const t0 = 0
        const t1 = t0 + snapshotDurationMs
        const t2 = t1 + snapshotDurationMs
        const tCondense = t2 + snapshotDurationMs + 600
        const tTitle = tCondense + 1100

        introTimersRef.current.push(
            window.setTimeout(() => setActiveSnapshotIndex(0), t0),
            window.setTimeout(() => setActiveSnapshotIndex(1), t1),
            window.setTimeout(() => setActiveSnapshotIndex(2), t2),
            window.setTimeout(() => {
                setActiveSnapshotIndex(-1)
                setIntroPhase("condense")
            }, tCondense),
            window.setTimeout(() => setIntroPhase("title"), tTitle)
        )

        return () => {
            clearIntroTimers()
        }
    }, [])

    useEffect(() => {
        if (!progressionInView) return
        clearProgressionTimers()

        return () => clearProgressionTimers()
    }, [progressionInView])

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest <= 24) return
        if (introPhase === "title") return

        // User scrolled: skip intro quickly.
        clearIntroTimers()
        setActiveSnapshotIndex(-1)
        setIntroPhase("condense")
        introTimersRef.current.push(window.setTimeout(() => setIntroPhase("title"), 650))
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-heebo selection:bg-blue-800 selection:text-white overflow-x-hidden">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                <div className="container mx-auto px-6 pr-0 h-18 flex items-center justify-between w-full max-w-6xl">
                    <Link href="#top" aria-label="חזרה לראש העמוד" className="inline-flex items-center">
                        <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center">
                            <Image src={Logo} alt="תכל'ס.Dev" height={44} />
                        </motion.div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        {[
                            { href: "#methodology", label: "מה תקבלו" },
                            { href: "#process", label: "תהליך עבודה" },
                            { href: "#projects", label: "פרויקטים" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-full text-slate-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <Button asChild className="hidden md:flex bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-white rounded-full px-6 font-semibold shadow-lg shadow-blue-800/25 hover:shadow-blue-700/30 transition-all duration-300">
                        <Link href="#contact">צור קשר</Link>
                    </Button>
                </div>
            </header>

            <main id="top" className="pt-20">
                {/* Hero */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-40 blur-3xl animate-pulse" />
                        <div className="absolute top-40 left-[5%] w-96 h-96 rounded-full bg-gradient-to-br from-blue-200 to-cyan-300 opacity-30 blur-3xl" />
                        <div className="absolute bottom-20 right-[20%] w-80 h-80 rounded-full bg-gradient-to-br from-violet-200 to-purple-300 opacity-35 blur-3xl" />
                        <div className="absolute bottom-40 left-[15%] w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 opacity-30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                    </div>

                    {/* Intro overlay: snapshots -> loader -> title */}
                    <AnimatePresence>
                        {introPhase !== "title" && (
                            <motion.div
                                key="intro-overlay"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="absolute inset-0 z-10 pointer-events-none"
                            >
                                <AnimatePresence mode="wait">
                                    {introPhase === "floating" && activeSnapshotIndex >= 0 ? (() => {
                                        const snap = contactSnapshots[activeSnapshotIndex]
                                        if (!snap) return null
                                        const Icon = snap.icon

                                        return (
                                            <motion.div
                                                key={snap.key}
                                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: [0, -10, 0],
                                                    scale: 1,
                                                    transition: {
                                                        opacity: { duration: 0.25, ease: "easeOut" },
                                                        scale: { duration: 0.25, ease: "easeOut" },
                                                        y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                                                    },
                                                }}
                                                exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 1, ease: "easeIn" } }}
                                                className={`absolute ${snap.className} w-[320px] max-w-[85vw]`}
                                            >
                                                <div className="rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden">
                                                    <div className={`h-2 bg-gradient-to-r ${snap.accent}`} />
                                                    <div className="p-5">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3 text-slate-700">
                                                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${snap.accent} flex items-center justify-center shadow-lg`}>
                                                                    <Icon className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-900">{snap.title}</div>
                                                                    <div className="text-xs text-slate-500">{snap.tone}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">עכשיו</div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <div className="inline-flex rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700 leading-relaxed">
                                                                {snap.message}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })() : null}

                                    {introPhase === "condense" ? (
                                        <motion.div
                                            key="intro-loader"
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="rounded-3xl bg-white/90 border border-white/60 backdrop-blur-xl shadow-2xl shadow-slate-900/10 px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    {[0, 1, 2].map((i) => (
                                                        <motion.span
                                                            key={i}
                                                            className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-800 to-blue-600"
                                                            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="container mx-auto px-6 max-w-5xl py-20">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: introPhase === "title" ? 1 : 0, y: introPhase === "title" ? 0 : 18 }}
                            transition={{ duration: 0.55, ease: "easeOut" }}
                            className="text-center"
                        >
                            {/* Floating badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 text-sm font-medium mb-8 shadow-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>פיתוח מותאם אישית לעסק שלך</span>
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
                                <span className="text-slate-800">בונים</span>{" "}
                                <span className="text-blue-800 relative inline-block">
                                    {"תכל'ס"}
                                    <motion.div
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 rounded-full opacity-50 -z-10"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                                    />
                                </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">.</span>
                            </h1>

                            <p className="mt-8 text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                                בניית אתרים ומערכות מקוונות בדיוק לפי מה שאתם צריכים.
                            </p>

                            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" className="h-16 px-10 bg-gradient-to-r from-blue-800 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600 font-bold text-lg rounded-2xl shadow-xl shadow-blue-800/30 hover:shadow-blue-700/40 hover:scale-105 transition-all duration-300 group">
                                    <Link href="#contact" className="flex items-center gap-2">
                                        בוא נדבר
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-16 px-10 border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <Link href="#projects">ראה פרויקטים</Link>
                                </Button>
                            </div>


                        </motion.div>
                    </div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2"
                        >
                            <div className="w-1.5 h-3 rounded-full bg-slate-400" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Methodology / What you get */}
                <section id="methodology" className="py-28 relative">
                    {/* Section background accent */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl opacity-60" />
                    </div>

                    <div className="container mx-auto px-6 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">איך זה עובד</h2>
                            <p className="text-lg text-slate-600">שלושה שלבים. פשוט.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    num: "01",
                                    title: "מגדירים מה צריך",
                                    desc: "שיחה אחת. נבין בדיוק מה אתם צריכים ומה לא.",
                                    color: "from-amber-400 to-orange-500",
                                },
                                {
                                    num: "02",
                                    title: "בונים ומראים",
                                    desc: "עבודה בשקיפות. אתם רואים התקדמות ונותנים פידבק.",
                                    color: "from-emerald-400 to-teal-500",
                                },
                                {
                                    num: "03",
                                    title: "מוסרים ותומכים",
                                    desc: "מסירה מסודרת + תמיכה טכנית כשצריך.",
                                    color: "from-blue-500 to-cyan-500",
                                },
                            ].map((row, idx) => (
                                <motion.div
                                    key={row.num}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative"
                                >
                                    <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br ${row.color} opacity-20 blur-xl" />
                                    <div className="relative bg-white rounded-2xl border border-slate-200 p-6">
                                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${row.color} text-white font-bold text-lg mb-4 shadow-lg`}>
                                            {row.num}
                                        </div>
                                        <h3 className="font-bold text-xl text-slate-900 mb-2">{row.title}</h3>
                                        <p className="text-slate-600 leading-relaxed">{row.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* Projects Showcase */}
                <section id="projects" className=" relative">
                    {/* Background accent */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
                    <div className="container mx-auto px-6 max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-lg font-semibold mb-4">
                                💼 פרויקטים
                            </span>
                        </motion.div>
                        <ProjectsShowcase variant="homepage" showHeader={false} />
                    </div>
                </section>

                {/* Trust / Contact */}
                <section id="contact" className="py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-20 left-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl" />
                        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/5 blur-3xl" />
                    </div>
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >

                            <h2 className="text-4xl md:text-5xl font-black mb-12">עבודה מקצועית ומדויקת זה שם המשחק</h2>
                        </motion.div>
                        <div className="grid md:grid-cols-3 gap-6 text-right">
                            <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/50">
                                <h3 className="text-xl font-bold mb-3 text-slate-200">כתובת אחת</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    אין מסביב. אין סוכן AI שעונה במקומי. אתם מדברים איתי ישירות..
                                </p>
                            </div>
                            <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/50">
                                <h3 className="text-xl font-bold mb-3 text-slate-200">שקיפות</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    אתם יודעים מה קורה, מה הושלם, אם יש תקלות ואם חסר לי מכם דברים. בלי סיפורים ובלי “יהיה בסדר”.
                                </p>
                            </div>
                            <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/50">
                                <h3 className="text-xl font-bold mb-3 text-slate-200">אחריות אחרי השקה</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    אני לא נעלם ביום שאחרי. אנחנו נתאם ציפיות מראש על תמיכה, תיקונים, ושיפורים.
                                </p>
                            </div>
                        </div>

                        <div className="mt-16 pt-16 border-t border-slate-800">
                            <h3 className="text-2xl font-bold mb-6">לתיאום שיחת ייעוץ קצרה</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button asChild size="lg" className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg rounded-md">
                                    <a href="mailto:support@tachles.dev?subject=%D7%AA%D7%99%D7%90%D7%95%D7%9D%20%D7%A9%D7%99%D7%97%D7%94%20-%20Tachles.dev">שלח מייל</a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-10 border-slate-600 text-black hover:bg-slate-800 hover:text-white font-bold text-lg rounded-md">
                                    <Link href="#projects">ראה פרויקטים</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gradient-to-r from-slate-50 to-white py-16 border-t border-slate-100">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl">
                        <div className="flex items-center gap-3">
                            <Image src={Logo} alt="תכל'ס.Dev" height={36} className="rounded-lg" />
                            <span className="text-slate-400 font-medium">|</span>
                            <span className="text-slate-600 font-medium">בניית מערכות מותאמות אישית</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} כל הזכויות שמורות.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    )
}
