'use client'

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarIcon, ChevronDownIcon, GridIcon, ListIcon, PlusIcon, SearchIcon, SlidersIcon, BellIcon, MoonIcon, SunIcon, XIcon, CheckCircleIcon, ClockIcon, ActivityIcon, AlertTriangleIcon, StarIcon, TrashIcon, UserIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoadingSpinner from "@/components/ui/loading-spinner";
import MinimalLoader from "@/components/ui/minimal-loader";

interface Ticket {
  ID: number
  ProjectID: number
  UserID: number
  StatusID: number
  PriorityID: number
  CategoryID: number
  Title: string
  AssigneeID: number
  Description: string
  CreatedAt: string
  UpdatedAt: string
}

interface User {
  ID: number
  Username: string,
  CreatedAt: string,
  Email: string,
  PasswordHash: string,
  UpdatedAt: string
}

interface Project {
  ID: number
  Name: string
}

interface Status {
  ID: number
  Name: string
}

interface Priority {
  ID: number
  Name: string
}

interface Category {
  ID: number
  Name: string
}


type TicketData = {

  totalItems: number,
  totalPages: number,
  pageSize: number,
  currentPage: number,
  "items": Ticket[]
}

type SearchCriteria = {
  status: string
  priority: string
  assignee: string
  tag: string
  dateFrom: string
  dateTo: string
}

type Favorite = {
  id: string
  name: string
  criteria: SearchCriteria
}

type ColumnVisibility = {
  id: boolean
  title: boolean
  status: boolean
  priority: boolean
  assignee: boolean
  dueDate: boolean
  tags: boolean
}

const API_BASE_URL = "http://localhost:8082"
export function TicketListPage() {
  const [ticketData, setTicketData] = React.useState<TicketData>({
    totalItems: 0,
    totalPages: 1,
    pageSize: 50,
    currentPage: 1,
    items: []
  })

  const [userCache, setUserCache] = React.useState<Record<number, User>>({})
  const [projectCache, setProjectCache] = React.useState<Record<number, Project>>({})
  const [statusCache, setStatusCache] = React.useState<Record<number, Status>>({})
  const [priorityCache, setPriorityCache] = React.useState<Record<number, Priority>>({})
  const [categoryCache, setCategoryCache] = React.useState<Record<number, Category>>({})


  const [loading, setLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(5)
  const [searchTerm, setSearchTerm] = React.useState("")

  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")
  const [activeFilters, setActiveFilters] = React.useState<string[]>([])
  const { setTheme, theme } = useTheme()
  const [advancedSearchOpen, setAdvancedSearchOpen] = React.useState(false)
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = React.useState<SearchCriteria>({
    status: "",
    priority: "",
    assignee: "",
    tag: "",
    dateFrom: "",
    dateTo: "",
  })
  const [favorites, setFavorites] = React.useState<Favorite[]>([])
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibility>({
    id: true,
    title: true,
    status: true,
    priority: true,
    assignee: true,
    dueDate: true,
    tags: true,
  })
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = React.useState(false)
  const [newTicket, setNewTicket] = React.useState<Partial<Ticket>>({
    Title: "",
    Status: "À faire",
    Priority: "Moyenne",
    Assignee: "",
    DueDate: "",
    tags: [],
  })

  React.useEffect(() => {
    fetchTickets()
  }, [currentPage, itemsPerPage, searchTerm, activeFilters, selectedAssignee])


  const fetchTickets = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: ticketData.currentPage.toString(),
        limit: itemsPerPage.toString(),
        filters: JSON.stringify(activeFilters),
        assignee: selectedAssignee || '',
      })
      const response = await fetch(`${API_BASE_URL}/tickets?${queryParams}`)
      const data:TicketData = await response.json()
      console.log("Received ticket:", data);
      setTicketData(data)
      fetchRelatedData(data.items)
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets:", error)
    } finally {
      setLoading(false)
    }
  }


  const fetchRelatedData = async (tickets: Ticket[]) => {
    const uniqueUserIds = [...new Set(tickets.flatMap(t => [t.UserID]))]
    // const uniqueProjectIds = [...new Set(tickets.map(t => t.ProjectID))]
    // const uniqueStatusIds = [...new Set(tickets.map(t => t.StatusID))]
    // const uniquePriorityIds = [...new Set(tickets.map(t => t.PriorityID))]
    // const uniqueCategoryIds = [...new Set(tickets.map(t => t.CategoryID))]

    await Promise.all([
      fetchUsers(uniqueUserIds),
      // fetchProjects(uniqueProjectIds),
      // fetchStatuses(uniqueStatusIds),
      // fetchPriorities(uniquePriorityIds),
      // fetchCategories(uniqueCategoryIds),
    ])
  }

  const fetchUsers = async (ids: number[]) => {
    const newUserIds = ids.filter(id => !userCache[id])
    if (newUserIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users?ids=${newUserIds.join(',')}`)
        const users: User[] = await response.json()
        setUserCache(prev => ({
          ...prev,
          ...Object.fromEntries(users.map(user => [user.ID, user]))
        }))
        console.log("users:")
        console.log(users)
      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur:", error)
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Basse": return "bg-green-100 text-green-800"
      case "Moyenne": return "bg-yellow-100 text-yellow-800"
      case "Élevée": return "bg-red-100 text-red-800"
      case "Critique": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "À faire": return <Badge variant="secondary" className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> À faire</Badge>
      case "En cours": return <Badge variant="default" className="flex items-center gap-1"><ActivityIcon className="w-3 h-3" /> En cours</Badge>
      case "En révision": return <Badge variant="outline" className="flex items-center gap-1"><AlertTriangleIcon className="w-3 h-3" /> En révision</Badge>
      case "Terminé": return <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Terminé</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const addFilter = (filter: string) => {
    setActiveFilters((prev) => {
      const newSet = new Set([...prev, filter]);
      return Array.from(newSet);
    });
  }

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  const handleAdvancedSearch = () => {
    const newFilters = Object.entries(advancedSearchCriteria)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`)
    setActiveFilters((prev) => {
      return [...new Set([...prev, ...newFilters])];
    })
    setAdvancedSearchOpen(false)
  }

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const filteredTickets = React.useMemo(() => {
    return ticketData.items.filter((ticket) => {
      const matchesSearch =
          ticket.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.ID.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters = activeFilters.every((filter) => {
        const [key, value] = filter.split(": ")
        switch (key) {
          case "status":
            return ticket.Status === value
          case "priority":
            return ticket.Priority === value
          case "assignee":
            return "";
            // return ticket.Assignee.toLowerCase().includes(value.toLowerCase())
          case "tag":
            return "";
            //  return ticket.Tags.some((tag) => tag.toLowerCase().includes(value.toLowerCase()))
          default:
            return true
        }
      })

      const matchesAssignee = selectedAssignee ? ticket.Assignee === selectedAssignee : true

      return matchesSearch && matchesFilters && matchesAssignee
    })
  }, [ticketData.items, searchTerm, activeFilters, selectedAssignee])

  const saveFavorite = () => {
    const favoriteName = prompt("Entrez un nom pour ce favori :")
    if (favoriteName) {
      const newFavorite: Favorite = {
        id: Date.now().toString(),
        name: favoriteName,
        criteria: { ...advancedSearchCriteria }
      }
      setFavorites(prev => [...prev, newFavorite])
    }
  }

  const applyFavorite = (favorite: Favorite) => {
    setAdvancedSearchCriteria(favorite.criteria)
    handleAdvancedSearch()
  }

  const deleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id))
  }

  const toggleAssigneeFilter = (assignee: string) => {
    if (selectedAssignee === assignee) {
      setSelectedAssignee(null)
    } else {
      setSelectedAssignee(assignee)
    }
  }



  const renderTickets = (tickets: Ticket[]) => (
      <div className="relative">
        {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="w-[120px]">Statut</TableHead>
                    <TableHead className="w-[120px]">Priorité</TableHead>
                    <TableHead className="w-[200px]">Assigné à</TableHead>
                    <TableHead className="w-[150px]">Projet</TableHead>
                    <TableHead className="w-[150px]">Catégorie</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => {
                    const assignee = userCache[ticket.UserID]
                    const priority = priorityCache[ticket.PriorityID]
                    const project = projectCache[ticket.ProjectID]
                    const category = categoryCache[ticket.CategoryID]
                    return (
                        <TableRow key={ticket.ID}>
                          <TableCell className="font-medium">{ticket.ID}</TableCell>
                          <TableCell>{ticket.Title}</TableCell>
                          <TableCell>{getStatusBadge(ticket.StatusID)}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(ticket.PriorityID)}>{priority?.Name || "Inconnu"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={assignee?.Avatar || `/placeholder.svg?height=24&width=24`} alt={assignee?.Name} />
                                <AvatarFallback>{assignee?.Username?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              {assignee?.Username || "Non assigné"}
                            </div>
                          </TableCell>
                          <TableCell>{project?.Name || "Inconnu"}</TableCell>
                          <TableCell>{category?.Name || "Inconnu"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Ouvrir le menu</span>
                                  <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                <DropdownMenuItem>Modifier</DropdownMenuItem>
                                <DropdownMenuItem>Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => {
                const assignee = userCache[ticket.UserID]
                const priority = priorityCache[ticket.PriorityID]
                const project = projectCache[ticket.ProjectID]
                const category = categoryCache[ticket.CategoryID]
                return (
                    <Card key={ticket.ID} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span className="text-lg font-semibold truncate">{ticket.Title}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem>Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          {getStatusBadge(ticket.StatusID)}
                          <Badge className={getPriorityColor(ticket.PriorityID)}>{priority?.Name || "Inconnu"}</Badge>
                        </div>
                        <div className="flex items-center mb-4">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={assignee?.Avatar || `/placeholder.svg?height=32&width=32`} alt={assignee?.Username} />
                            <AvatarFallback>{assignee?.Username?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{assignee?.Username || "Non assigné"}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <span className="font-semibold mr-2">Projet:</span> {project?.Name || "Inconnu"}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <span className="font-semibold mr-2">Catégorie:</span> {category?.Name || "Inconnue"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold">Créé le:</span> {new Date(ticket.CreatedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
        )}
      </div>
  )

  return (
      <TooltipProvider>
        <MinimalLoader isLoading={loading} />

        <div className={`flex-1 ml-64 transition-all duration-300`}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Tickets</h1>
              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} variant="outline" size="icon">
                      {theme === "dark" ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Changer le thème</p>
                  </TooltipContent>
                </Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <BellIcon className="h-5 w-5"/>
                      <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">Vous avez 3 nouvelles notifications.</p>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Nouveau</Badge>
                          <span className="text-sm">Un nouveau ticket a été assigné</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Mise à jour</Badge>
                          <span className="text-sm">Le statut d'un ticket a changé</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Rappel</Badge>
                          <span className="text-sm">Un ticket approche de sa date d'échéance</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button>
                      <PlusIcon className="h-5 w-5 mr-2"/>
                      Nouveau ticket
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Créer un nouveau ticket</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des tickets</CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  {/*<div className="text-2xl font-bold">{tickets.length}</div>*/}
                  <p className="text-xs text-muted-foreground">
                    +2.1% par rapport à la semaine dernière
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En cours</CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  {/*<div className="text-2xl font-bold">{tickets.filter(t => t.status === "En cours").length}</div>*/}
                  <p className="text-xs text-muted-foreground">
                    +18.1% par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Priorité élevée</CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  {/*<div*/}
                  {/*    className="text-2xl font-bold">{tickets.filter(t => t.priority === "Élevée" || t.priority === "Critique").length}</div>*/}
                  <p className="text-xs text-muted-foreground">
                    +5.4% par rapport à hier
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <UserIcon className="h-4 w-4 mr-2"/>
                        Assigné à
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Filtrer par assigné</DropdownMenuLabel>
                      <DropdownMenuSeparator/>
                      {/*{Array.from(new Set(tickets.map(t => t.assignee))).map((assignee) => (*/}
                      {/*    <DropdownMenuCheckboxItem*/}
                      {/*        key={assignee}*/}
                      {/*        checked={selectedAssignee === assignee}*/}
                      {/*        onCheckedChange={() => toggleAssigneeFilter(assignee)}*/}
                      {/*    >*/}
                      {/*      {assignee}*/}
                      {/*    </DropdownMenuCheckboxItem>*/}
                      {/*))}*/}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrer par personne assignée</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <StarIcon className="h-4 w-4 mr-2"/>
                    Favoris
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Recherches sa

                    uvegardées</DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  {favorites.map((favorite) => (
                      <DropdownMenuItem key={favorite.id} className="flex justify-between items-center">
                        <span onClick={() => applyFavorite(favorite)}>{favorite.name}</span>
                        <TrashIcon
                            className="h-4 w-4 text-red-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFavorite(favorite.id)
                            }}
                        />
                      </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem onClick={saveFavorite}>
                    <PlusIcon className="h-4 w-4 mr-2"/>
                    Sauvegarder la recherche actuelle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="w-full md:w-auto flex-grow relative">

                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input
                    className="pl-10 pr-10 py-2 w-full"
                    placeholder="Rechercher un ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Popover open={advancedSearchOpen} onOpenChange={setAdvancedSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                    >
                      <SlidersIcon className="h-5 w-5"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Recherche avancée</h4>
                        <p className="text-sm text-muted-foreground">Affinez votre recherche avec des critères
                          spécifiques.</p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="status">Statut</Label>
                          <Select
                              value={advancedSearchCriteria.status}
                              onValueChange={(value) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                status: value
                              })}
                          >
                            <SelectTrigger id="status" className="col-span-2">
                              <SelectValue placeholder="Sélectionner"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="À faire">À faire</SelectItem>
                              <SelectItem value="En cours">En cours</SelectItem>
                              <SelectItem value="En révision">En révision</SelectItem>
                              <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="priority">Priorité</Label>
                          <Select
                              value={advancedSearchCriteria.priority}
                              onValueChange={(value) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                priority: value
                              })}
                          >
                            <SelectTrigger id="priority" className="col-span-2">
                              <SelectValue placeholder="Sélectionner"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Basse">Basse</SelectItem>
                              <SelectItem value="Moyenne">Moyenne</SelectItem>
                              <SelectItem value="Élevée">Élevée</SelectItem>
                              <SelectItem value="Critique">Critique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="assignee">Assigné à</Label>
                          <Input
                              id="assignee"
                              value={advancedSearchCriteria.assignee}
                              onChange={(e) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                assignee: e.target.value
                              })}
                              className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="tag">Tag</Label>
                          <Input
                              id="tag"
                              value={advancedSearchCriteria.tag}
                              onChange={(e) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                tag: e.target.value
                              })}
                              className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="dateFrom">Date de</Label>
                          <Input
                              id="dateFrom"
                              type="date"
                              value={advancedSearchCriteria.dateFrom}
                              onChange={(e) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                dateFrom: e.target.value
                              })}
                              className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="dateTo">Date à</Label>
                          <Input
                              id="dateTo"
                              type="date"
                              value={advancedSearchCriteria.dateTo}
                              onChange={(e) => setAdvancedSearchCriteria({
                                ...advancedSearchCriteria,
                                dateTo: e.target.value
                              })}
                              className="col-span-2"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAdvancedSearch}>Appliquer les filtres</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <SlidersIcon className="h-4 w-4 mr-2"/>
                          Colonnes
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Afficher les colonnes</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.id}
                            onCheckedChange={() => toggleColumnVisibility('id')}
                        >
                          ID
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.title}
                            onCheckedChange={() => toggleColumnVisibility('title')}
                        >
                          Titre
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.status}
                            onCheckedChange={() => toggleColumnVisibility('status')}
                        >
                          Statut
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.priority}
                            onCheckedChange={() => toggleColumnVisibility('priority')}
                        >
                          Priorité
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.assignee}
                            onCheckedChange={() => toggleColumnVisibility('assignee')}
                        >
                          Assigné à
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.dueDate}
                            onCheckedChange={() => toggleColumnVisibility('dueDate')}
                        >
                          Échéance
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.tags}
                            onCheckedChange={() => toggleColumnVisibility('tags')}
                        >
                          Tags
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gérer les colonnes affichées</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
                      {viewMode === "list" ? <GridIcon className="h-4 w-4"/> : <ListIcon className="h-4 w-4"/>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Changer le mode d'affichage</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary"
                         className="cursor-pointer px-2 py-1 hover:bg-gray-200 transition-colors duration-200"
                         onClick={() => removeFilter(filter)}>
                    {filter} <XIcon className="h-3 w-3 ml-1 inline-block" onClick={() => removeFilter(filter)}/>
                  </Badge>
              ))}
            </div>

            <Tabs defaultValue="all" className="mb-8">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="todo">À faire</TabsTrigger>
                <TabsTrigger value="in-progress">En cours</TabsTrigger>
                <TabsTrigger value="review">En révision</TabsTrigger>
                <TabsTrigger value="done">Terminé</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {renderTickets(ticketData.items)}
              </TabsContent>
              {/*<TabsContent value="todo">*/}
              {/*  {renderTickets(filteredTickets.filter(ticket => ticket.status === "À faire"))}*/}
              {/*</TabsContent>*/}
              {/*<TabsContent value="in-progress">*/}
              {/*  {renderTickets(filteredTickets.filter(ticket => ticket.status === "En cours"))}*/}
              {/*</TabsContent>*/}
              {/*<TabsContent value="review">*/}
              {/*  {renderTickets(filteredTickets.filter(ticket => ticket.status === "En révision"))}*/}
              {/*</TabsContent>*/}
              {/*<TabsContent value="done">*/}
              {/*  {renderTickets(filteredTickets.filter(ticket => ticket.status === "Terminé"))}*/}
              {/*</TabsContent>*/}
            </Tabs>

            <div className="mt-8 flex justify-between items-center">
              <Select
                  value={ticketData.pageSize.toString()}
                  onValueChange={(value) => {
                    setTicketData(prev => ({...prev, pageSize: parseInt(value), currentPage: 1}))
                    fetchTickets()
                  }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Éléments par page"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 par page</SelectItem>
                  <SelectItem value="20">20 par page</SelectItem>
                  <SelectItem value="50">50 par page</SelectItem>
                  <SelectItem value="100">100 par page</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex">
                <Button
                    variant="outline"
                    className="mx-1"
                    onClick={() => {
                      setTicketData(prev => ({...prev, currentPage: Math.max(1, prev.currentPage - 1)}))
                      fetchTickets()
                    }}
                    disabled={ticketData.currentPage === 1}
                >
                  Précédent
                </Button>
                {Array.from({length: ticketData.totalPages}, (_, i) => i + 1).map((page) => (
                    <Button
                        key={page}
                        variant={ticketData.currentPage === page ? "default" : "outline"}
                        className="mx-1"
                        onClick={() => {
                          setTicketData(prev => ({...prev, currentPage: page}))
                          fetchTickets()
                        }}
                    >
                      {page}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    className="mx-1"
                    onClick={() => {
                      setTicketData(prev => ({
                        ...prev,
                        currentPage: Math.min(ticketData.totalPages, prev.currentPage + 1)
                      }))
                      fetchTickets()
                    }}
                    disabled={ticketData.currentPage === ticketData.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
  )
}