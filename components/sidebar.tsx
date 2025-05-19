"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Bell,
  Menu,
  X,
  Calendar,
  GraduationCap,
  Handshake,
  Tags,
  ChevronDown,
  ChevronRight,
  GraduationCapIcon,
  UsersRoundIcon,
  BanknoteIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { toast } from "react-toastify"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Logo } from "@/components/logo"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [trainingServicesOpen, setTrainingServicesOpen] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (
      pathname === "/events" ||
      pathname === "/trainers" ||
      pathname === "/partners" ||
      pathname === "/event-categories" ||
      pathname === "/class"
    ) {
      setTrainingServicesOpen(true)
    }
    if (
      pathname === "/payment" ||
      pathname === "/payment/verified"
    ) {
      setPaymentOpen(true)
    }
  }, [pathname])

  const mainRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Pengaturan",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  const paymentRoutes = [
    {
      label: "Pembayaran",
      icon: BanknoteIcon,
      href: "/payment",
      active: pathname === "/payment",
    },
    {
      label: "Pembayaran Diterima",
      icon: BanknoteIcon,
      href: "/payment/verified",
      active: pathname === "/payment/verified",
    },
  ]

  const trainingServicesRoutes = [
    {
      label: "Event",
      icon: Calendar,
      href: "/events",
      active: pathname === "/events",
    },
    {
      label: "Pelatih",
      icon: GraduationCap,
      href: "/trainers",
      active: pathname === "/trainers",
    },
    {
      label: "Mitra",
      icon: Handshake,
      href: "/partners",
      active: pathname === "/partners",
    },
    {
      label: "Kategori Event",
      icon: Tags,
      href: "/event-categories",
      active: pathname === "/event-categories",
    },
    {
      label: "Kelas",
      icon: UsersRoundIcon,
      href: "/class",
      active: pathname === "/class",
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to logout:", error)
      toast.error("Gagal logout. Silakan coba lagi.")
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b flex items-center justify-between">
        <Logo size="md" />
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 px-3 py-6">
        <nav className="space-y-1">
          {mainRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all hover:bg-accent ${
                route.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => isMobile && setMobileMenuOpen(false)}
            >
              <route.icon className={`h-4 w-4 ${route.active ? "text-primary" : ""}`} />
              {route.label}
            </Link>
          ))}

          {/* Collapsible Pembayaran */}
          <Collapsible open={paymentOpen} onOpenChange={setPaymentOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all hover:bg-accent ${
                  paymentRoutes.some((route) => route.active)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BanknoteIcon className={`h-4 w-4 ${paymentRoutes.some((route) => route.active) ? "text-primary" : ""}`} />
                  <span>Pembayaran</span>
                </div>
                {paymentOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1 mt-1">
              {paymentRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent ${
                    route.active
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  <route.icon className={`h-4 w-4 ${route.active ? "text-primary" : ""}`} />
                  {route.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Layanan Pelatihan */}
          <Collapsible open={trainingServicesOpen} onOpenChange={setTrainingServicesOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <button
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all hover:bg-accent ${
                  trainingServicesRoutes.some((route) => route.active)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`h-4 w-4 ${trainingServicesRoutes.some((route) => route.active) ? "text-primary" : ""}`} />
                  <span>Layanan Pelatihan</span>
                </div>
                {trainingServicesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1 mt-1">
              {trainingServicesRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent ${
                    route.active
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  <route.icon className={`h-4 w-4 ${route.active ? "text-primary" : ""}`} />
                  {route.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Tema</span>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Notifikasi</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Event baru dijadwalkan</DropdownMenuItem>
              <DropdownMenuItem>Pelatih baru terdaftar</DropdownMenuItem>
              <DropdownMenuItem>Permintaan kemitraan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg border bg-card/50">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">Akun</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r bg-background">
        {SidebarContent()}
      </aside>

      {/* Sidebar for Mobile */}
      {isMobile && mobileMenuOpen && (
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="p-0 w-4/5 h-screen max-w-xs bg-background">
            {SidebarContent()}
          </DialogContent>
        </Dialog>
      )}

      {/* Button to open menu on Mobile */}
      {isMobile && !mobileMenuOpen && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}
