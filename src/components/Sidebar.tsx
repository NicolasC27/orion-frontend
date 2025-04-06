"use client"

import * as React from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronRight,
  Home,
  Settings,
  User,
  Menu as MenuIcon,
  Search,
  Bell,
  MessageSquare,
  BarChart3,
  Folder,
  LogOut,
  ChevronDown,
  PanelLeft,
  Ticket,
  Sun,
  Moon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

// Custom hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const MOBILE_BREAKPOINT = 768
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Context for sidebar state management
type SidebarContextType = {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

export const SidebarProvider = ({ children, defaultExpanded = true }: SidebarProviderProps) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setExpanded(prev => !prev)
    }
  }, [isMobile])

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider 
      value={{ 
        expanded, 
        setExpanded, 
        toggleSidebar, 
        isMobile, 
        mobileOpen, 
        setMobileOpen 
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

// Sidebar components
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface MotionAsideProps extends HTMLMotionProps<"aside"> {
  children: React.ReactNode
  className?: string
}

const SidebarComponent = ({ children, className, ...props }: SidebarProps) => {
  const { expanded, isMobile, mobileOpen, setMobileOpen } = useSidebarContext()
  
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-[49] bg-background/60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed inset-y-0 left-0 z-[60] w-72 bg-white dark:bg-gray-950 border-r border-border/40 shadow-xl",
                className
              )}
              {...(props as MotionAsideProps)}
            >
              <div className="flex h-full flex-col">
                {children}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    )
  }
  
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[40] h-screen bg-white dark:bg-gray-950 border-r border-border/40 transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      <div className="flex h-full flex-col">
        {children}
      </div>
    </aside>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const SidebarHeader = ({ children, className, ...props }: SidebarHeaderProps) => {
  const { expanded, toggleSidebar } = useSidebarContext()
  
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-2 border-b border-border/40 px-4 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-full hover:bg-accent/30 transition-all duration-200"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-1 rounded-md shadow-md">
                  <Ticket className="h-6 w-6"/>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Ticket<span className="font-normal">Dashboard</span>
                  </h2>
                  <span className="text-xs uppercase tracking-wider text-blue-500 dark:text-blue-400 font-semibold">
                    DOCS
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

interface SidebarSearchProps extends React.ComponentProps<typeof Input> {}

const SidebarSearch = ({ className, ...props }: SidebarSearchProps) => {
  const { expanded } = useSidebarContext()
  
  return expanded ? (
    <div className="px-4 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          className={cn(
            "h-9 pl-9 bg-accent/20 border-border/50 focus-visible:ring-accent/30 transition-all duration-200",
            className
          )}
          {...props}
        />
      </div>
    </div>
  ) : (
    <div className="px-3 py-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-full hover:bg-accent/30 transition-all duration-200"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
}

const SidebarSection = ({ title, children, className, ...props }: SidebarSectionProps) => {
  const { expanded } = useSidebarContext()
  
  return (
    <div className={cn("py-2", className)} {...props}>
      {title && expanded && (
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType
  title: string
  active?: boolean
  badge?: string | number
  subItems?: Array<{ title: string; href: string }>
}

const sidebarItemVariants = cva(
  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "hover:bg-accent/20 hover:text-accent-foreground",
        active: "bg-gradient-to-r from-accent/30 to-accent/10 text-accent-foreground font-medium shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const SidebarItem = ({ 
  icon: Icon, 
  title, 
  active, 
  badge, 
  subItems,
  className, 
  ...props 
}: SidebarItemProps) => {
  const { expanded } = useSidebarContext()
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="px-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                sidebarItemVariants({ variant: active ? "active" : "default" }),
                className
              )}
              onClick={() => subItems && expanded && setOpen(!open)}
              {...props}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform", 
                active && "text-primary"
              )} />
              
              {expanded && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-1 items-center justify-between"
                >
                  <span>{title}</span>
                  
                  {badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-1.5 text-xs font-medium text-primary-foreground shadow-sm">
                      {badge}
                    </span>
                  )}
                  
                  {subItems && (
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200", 
                        open && "rotate-180"
                      )} 
                    />
                  )}
                </motion.div>
              )}
            </div>
          </TooltipTrigger>
          
          {!expanded && (
            <TooltipContent 
              side="right" 
              className="flex items-center gap-2 bg-popover/90 backdrop-blur-sm border-border/40"
            >
              {title}
              {badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-1.5 text-xs font-medium text-primary-foreground">
                  {badge}
                </span>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {expanded && subItems && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="ml-8 mt-1 flex flex-col gap-1 overflow-hidden border-l border-border/40 pl-2"
            >
              {subItems.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/20 hover:text-accent-foreground transition-all duration-200"
                >
                  {item.title}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const SidebarFooter = ({ children, className, ...props }: SidebarFooterProps) => {
  return (
    <div
      className={cn(
        "mt-auto border-t border-border/40 p-4 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// User dropdown component for the sidebar footer
const UserDropdown = () => {
  const { expanded } = useSidebarContext()
  const { theme, setTheme } = useTheme()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent/20 transition-all duration-200",
          expanded ? "justify-between" : "justify-center"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <User className="h-4 w-4" />
            </div>
            
            {expanded && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">john.doe@example.com</span>
              </div>
            )}
          </div>
          
          {expanded && <ChevronRight className="h-4 w-4" />}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-popover/90 backdrop-blur-sm border-border/40 shadow-lg"
      >
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <Separator className="my-1 bg-border/40" />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Sidebar() {
  return (
    <SidebarProvider defaultExpanded={true}>
      <SidebarComponent>
        <SidebarHeader />
        <SidebarSearch />
        
        <div className="flex-1 overflow-auto">
          <SidebarSection>
            <SidebarItem icon={Home} title="Accueil" active />
            <SidebarItem 
              icon={Ticket} 
              title="Tickets" 
              badge={3}
              subItems={[
                { title: "Tous les tickets", href: "#" },
                { title: "Mes tickets", href: "#" },
                { title: "Tickets archivés", href: "#" },
              ]}
            />
            <SidebarItem 
              icon={Folder} 
              title="Projets"
              subItems={[
                { title: "Actifs", href: "#" },
                { title: "Terminés", href: "#" },
                { title: "En attente", href: "#" },
              ]}
            />
            <SidebarItem icon={BarChart3} title="Rapports" />
          </SidebarSection>
        </div>
        
        <SidebarFooter>
          <UserDropdown />
        </SidebarFooter>
      </SidebarComponent>
    </SidebarProvider>
  )
}

export default Sidebar;