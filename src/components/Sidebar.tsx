'use client'

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HomeIcon, TicketIcon, FolderIcon, BarChartIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon, SunIcon, MoonIcon, MenuIcon, ChevronLeftIcon, BellIcon } from "lucide-react"

const texts = {
  appName: "TicketDashboard",
  appType: "DOCS",
  search: "Rechercher...",
  logout: "Déconnexion",
  notifications: "Notifications",
  settings: "Paramètres",
}

const menuItems = [
  { icon: HomeIcon, label: "Accueil" },
  { 
    icon: TicketIcon, 
    label: "Tickets", 
    subItems: ["Tous les tickets", "Mes tickets", "Tickets archivés"],
    badge: 3
  },
  { 
    icon: FolderIcon, 
    label: "Projets",
    subItems: ["Actifs", "Terminés", "En attente"]
  },
  { icon: BarChartIcon, label: "Rapports" },
]

export function Sidebar() {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeItem, setActiveItem] = useState("Accueil")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()
  const [unreadNotifications, setUnreadNotifications] = useState(3)

  const toggleSubMenu = useCallback((label: string) => {
    if (!isCollapsed) {
      setOpenSubMenu(openSubMenu === label ? null : label)
    }
  }, [isCollapsed, openSubMenu])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
    setOpenSubMenu(null)
  }, [])

  const memoizedMenuItems = useMemo(() => menuItems, [])

  // @ts-ignore
  return (
    <TooltipProvider>
      <motion.div
          className="h-screen fixed left-0 top-0 bg-background text-foreground overflow-hidden shadow-lg flex flex-col w-64"
          animate={{width: isCollapsed ? 80 : 256}}
          transition={{duration: 0.3}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-1 rounded">
                  <TicketIcon className="h-6 w-6"/>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ticket<span
                      className="font-normal">Dashboard</span></h2>
                  <span
                      className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">DOCS</span>
                </div>
              </div>
          )}
          <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="p-0 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isCollapsed ? <ChevronRightIcon className="h-5 w-5"/> : <ChevronLeftIcon className="h-5 w-5"/>}
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-144px)]">
          <div className="p-4">
            {!isCollapsed && (
                <div className="relative mb-6">
                  <SearchIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4"/>
                  <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
            )}
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                    <li key={item.label}>
                      <motion.div
                          initial={{opacity: 0, x: -20}}
                          animate={{opacity: 1, x: 0}}
                          transition={{delay: index * 0.1}}
                      >
                        <Button
                            variant="ghost"
                            className={`w-full justify-between text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors ${
                                activeItem === item.label ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''
                            } ${isCollapsed ? 'px-0 justify-center' : ''}`}
                            onClick={() => {
                              setActiveItem(item.label)
                              toggleSubMenu(item.label)
                            }}
                        >
                          <span className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`}/>
                            {!isCollapsed && item.label}
                          </span>
                          {!isCollapsed && (
                              <div className="flex items-center">
                                {item.badge && (
                                    <Badge variant="secondary" className="mr-2">
                                      {item.badge}
                                    </Badge>
                                )}
                                {item.subItems && (
                                    openSubMenu === item.label ? <ChevronDownIcon className="h-4 w-4"/> :
                                        <ChevronRightIcon className="h-4 w-4"/>
                                )}
                              </div>
                          )}
                        </Button>
                        <AnimatePresence>
                          {!isCollapsed && item.subItems && openSubMenu === item.label && (
                              <motion.ul
                                  initial={{opacity: 0, height: 0}}
                                  animate={{opacity: 1, height: "auto"}}
                                  exit={{opacity: 0, height: 0}}
                                  className="ml-6 mt-2 space-y-2"
                              >
                                {item.subItems.map((subItem, subIndex) => (
                                    <motion.li
                                        key={subItem}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: subIndex * 0.1}}
                                    >
                                      <Button
                                          variant="ghost"
                                          className={`w-full justify-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors ${
                                              activeItem === subItem ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''
                                          }`}
                                          onClick={() => setActiveItem(subItem)}
                                      >
                                        {subItem}
                                      </Button>
                                    </motion.li>
                                ))}
                              </motion.ul>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </li>
                ))}
              </ul>
            </nav>
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src="/avatars/01.png" alt="John Doe"/>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                </div>
              </div>
          )}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4' : 'justify-between'}`}>
            <Button
                variant="ghost"
                size="sm"
                className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                    isCollapsed ? 'w-10 h-10 p-0' : 'justify-start'
                }`}
            >
              <LogOutIcon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`}/>
              {!isCollapsed && "Déconnexion"}
            </Button>
            {!isCollapsed ? (
                <Switch
                    checked={theme === "dark"}
                    onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} className="ml-2"
                >
                  <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                  <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                </Switch>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-10 h-10 p-0"
                >
                  {theme === "dark" ? (
                      <SunIcon className="h-5 w-5"/>
                  ) : (
                      <MoonIcon className="h-5 w-5"/>
                  )}
                </Button>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}