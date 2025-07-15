"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Receipt,
  Search,
  Settings,
  TicketIcon,
  Users,
  Webhook,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import Logo from "@/public/תכל’ס.png";
import Image from "next/image";
interface NavigationLayoutProps {
  children: React.ReactNode;
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t('nav.overview'),
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: t('nav.products'),
      href: '/dashboard/products',
      icon: FolderOpen,
      current: pathname.startsWith('/dashboard/products'),
    },
    {
      name: t('nav.clients'),
      href: '/dashboard/clients',
      icon: Users,
      current: pathname.startsWith('/dashboard/clients'),
    },
    {
      name: t('nav.invoices'),
      href: '/dashboard/invoices',
      icon: Receipt,
      current: pathname.startsWith('/dashboard/invoices'),
    },
    {
      name: t('nav.payments'),
      href: '/dashboard/payments',
      icon: CreditCard,
      current: pathname.startsWith('/dashboard/payments'),
    },
    {
      name: t('nav.timeTracking'),
      href: '/dashboard/time-tracking',
      icon: Clock,
      current: pathname.startsWith('/dashboard/time-tracking'),
    },
    {
      name: t('nav.tickets'),
      href: '/dashboard/tickets',
      icon: TicketIcon,
      current: pathname.startsWith('/dashboard/tickets'),
    },
    {
      name: t('nav.webhooks'),
      href: '/dashboard/webhooks',
      icon: Webhook,
      current: pathname.startsWith('/dashboard/webhooks'),
    },
    {
      name: t('nav.settings'),
      href: '/dashboard/settings',
      icon: Settings,
      current: pathname.startsWith('/dashboard/settings'),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
        }}
        className="hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <motion.div
            initial={false}
            animate={{
              opacity: sidebarOpen ? 1 : 0,
            }}
            className="flex items-center"
          >
            {sidebarOpen && (
              <Image src={Logo} alt="תכל'ס.Dev" height={32} className="rounded-lg ml-2" />

            )}
          </motion.div>
          {!sidebarOpen && (
            <Image src={Logo} alt="תכל'ס.Dev" height={32} className="rounded-lg ml-2" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer
                    ${item.current
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: sidebarOpen ? 1 : 0,
                      x: sidebarOpen ? 0 : -10,
                    }}
                    className="mr-3 font-rubik flex items-center justify-between w-full"
                  >
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </motion.div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/20" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Tachles.dev
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <div
                      className={`
                        flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer
                        ${item.current
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder={t('nav.search')}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
                מחובר
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  כניסה
                </SignInButton>
                לא מחובר
              </SignedOut>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
