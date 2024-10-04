import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarIcon, ChevronDownIcon, GridIcon, ListIcon, PlusIcon, SearchIcon, SlidersIcon, BellIcon, MoonIcon, SunIcon } from "lucide-react"
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
import MinimalLoader from "./minimal-loader"

// Define types based on your Golang struct
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

interface TicketData {
    totalItems: number
    totalPages: number
    pageSize: number
    currentPage: number
    items: Ticket[]
}

interface User {
    ID: number
    Name: string
    Avatar: string
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

export default function TicketListPage() {
    const [ticketData, setTicketData] = React.useState<TicketData>({
        totalItems: 0,
        totalPages: 1,
        pageSize: 50,
        currentPage: 1,
        items: []
    })
    const [loading, setLoading] = React.useState(true)
    const [showPagination, setShowPagination] = React.useState(false)
    const { setTheme, theme } = useTheme()
    const [searchTerm, setSearchTerm] = React.useState("")
    const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")
    const [activeFilters, setActiveFilters] = React.useState<string[]>([])
    const [selectedAssignee, setSelectedAssignee] = React.useState<number | null>(null)

    // Caches for related data
    const [projectCache, setProjectCache] = React.useState<Record<number, Project>>({})
    const [statusCache, setStatusCache] = React.useState<Record<number, Status>>({})
    const [priorityCache, setPriorityCache] = React.useState<Record<number, Priority>>({})
    const [categoryCache, setCategoryCache] = React.useState<Record<number, Category>>({})

    React.useEffect(() => {
        fetchTickets()
    }, [ticketData.currentPage, searchTerm, activeFilters, selectedAssignee])

    const fetchTickets = async () => {
        setLoading(true)
        setShowPagination(false)
        try {
            const queryParams = new URLSearchParams({
                page: ticketData.currentPage.toString(),
                per_page: ticketData.pageSize.toString(),
                search: searchTerm,
                filters: JSON.stringify(activeFilters),
                assignee: selectedAssignee?.toString() || '',
            })
            const response = await fetch(`/api/tickets?${queryParams}`)
            const data: TicketData = await response.json()
            setTicketData(data)
            fetchRelatedData(data.items)
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets:", error)
        } finally {
            setLoading(false)
            setShowPagination(true)
        }
    }

    const fetchRelatedData = async (tickets: Ticket[]) => {
        const uniqueUserIds = [...new Set(tickets.flatMap(t => [t.UserID, t.AssigneeID]))]
        const uniqueProjectIds = [...new Set(tickets.map(t => t.ProjectID))]
        const uniqueStatusIds = [...new Set(tickets.map(t => t.StatusID))]
        const uniquePriorityIds = [...new Set(tickets.map(t => t.PriorityID))]
        const uniqueCategoryIds = [...new Set(tickets.map(t => t.CategoryID))]

        await Promise.all([
            fetchUsers(uniqueUserIds),
            fetchProjects(uniqueProjectIds),
            fetchStatuses(uniqueStatusIds),
            fetchPriorities(uniquePriorityIds),
            fetchCategories(uniqueCategoryIds),
        ])
    }

    const fetchUsers = async (ids: number[]) => {
        const newUserIds = ids.filter(id => !userCache[id])
        if (newUserIds.length > 0) {
            try {
                const response = await fetch(`/api/users?ids=${newUserIds.join(',')}`)
                const users: User[] = await response.json()
                setUserCache(prev => ({
                    ...prev,
                    ...Object.fromEntries(users.map(user => [user.ID, user]))
                }))
            } catch (error) {
                console.error("Erreur lors de la récupération des informations utilisateur:", error)
            }
        }
    }

    const fetchProjects = async (ids: number[]) => {
        // Similar implementation to fetchUsers
    }

    const fetchStatuses = async (ids: number[]) => {
        // Similar implementation to fetchUsers
    }

    const fetchPriorities = async (ids: number[]) => {
        // Similar implementation to fetchUsers
    }

    const fetchCategories = async (ids: number[]) => {
        // Similar implementation to fetchUsers
    }

    const getStatusBadge = (statusId: number) => {
        const status = statusCache[statusId]
        const statusColors: Record<string, string> = {
            "En attente": "bg-yellow-200 text-yellow-800",
            "En cours": "bg-blue-200 text-blue-800",
            "Terminé": "bg-green-200 text-green-800",
        }
        return <Badge className={statusColors[status?.Name] || "bg-gray-200 text-gray-800"}>{status?.Name || "Inconnu"}</Badge>
    }

    const getPriorityColor = (priorityId: number) => {
        const priority = priorityCache[priorityId]
        const priorityColors: Record<string, string> = {
            "Basse": "bg-green-200 text-green-800",
            "Moyenne": "bg-yellow-200 text-yellow-800",
            "Haute": "bg-red-200 text-red-800",
        }
        return priorityColors[priority?.Name] || "bg-gray-200 text-gray-800"
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
                                const assignee = userCache[ticket.AssigneeID]
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
                                                    <AvatarFallback>{assignee?.Name?.charAt(0) || "?"}</AvatarFallback>
                                                </Avatar>
                                                {assignee?.Name || "Non assigné"}
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
                        const assignee = userCache[ticket.AssigneeID]
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
                                            <AvatarImage src={assignee?.Avatar || `/placeholder.svg?height=32&width=32`} alt={assignee?.Name} />
                                            <AvatarFallback>{assignee?.Name?.charAt(0) || "?"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{assignee?.Name || "Non assigné"}</span>
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
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Tickets</h1>
                    <div className="flex items-center space-x-2">
                        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </Button>
                        <Button>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Nouveau ticket
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Rechercher des tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <SlidersIcon className="h-4 w-4 mr-2" />
                                    Filtres
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={activeFilters.includes("priority")}
                                    onCheckedChange={() => {
                                        setActiveFilters(prev =>
                                            prev.includes("priority")
                                                ? prev.filter(f => f !== "priority")
                                                : [...prev, "priority"]
                                        )
                                    }}
                                >
                                    Priorité
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={activeFilters.includes("status")}
                                    onCheckedChange={() => {
                                        setActiveFilters(prev =>
                                            prev.includes("status")
                                                ? prev.filter(f => f !== "status")
                                                : [...prev, "status"]
                                        )
                                    }}
                                >
                                    Statut
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={activeFilters.includes("assignee")}
                                    onCheckedChange={() => {
                                        setActiveFilters(prev =>
                                            prev.includes("assignee")
                                                ? prev.filter(f => f !== "assignee")
                                                : [...prev, "assignee"]
                                        )
                                    }}
                                >
                                    Assigné à
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select
                            value={selectedAssignee?.toString() || ""}
                            onValueChange={(value) => setSelectedAssignee(value === "" ? null : parseInt(value))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrer par assigné" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Tous les assignés</SelectItem>
                                {Object.values(userCache).map((user) => (
                                    <SelectItem key={user.ID} value={user.ID.toString()}>
                                        {user.Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                        >
                            {viewMode === "list" ? (
                                <GridIcon className="h-4 w-4" />
                            ) : (
                                <ListIcon className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {renderTickets(ticketData.items)}

                <AnimatePresence>
                    {showPagination && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8 flex justify-between items-center"
                        >
                            <Select
                                value={ticketData.pageSize.toString()}
                                onValueChange={(value) => {
                                    setTicketData(prev => ({ ...prev, pageSize: parseInt(value), currentPage: 1 }))
                                    fetchTickets()
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Éléments par page" />
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
                                        setTicketData(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))
                                        fetchTickets()
                                    }}
                                    disabled={ticketData.currentPage === 1}
                                >
                                    Précédent
                                </Button>
                                {Array.from({ length: ticketData.totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={ticketData.currentPage === page ? "default" : "outline"}
                                        className="mx-1"
                                        onClick={() => {
                                            setTicketData(prev => ({ ...prev, currentPage: page }))
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
                                        setTicketData(prev => ({ ...prev, currentPage: Math.min(ticketData.totalPages, prev.currentPage + 1) }))
                                        fetchTickets()
                                    }}
                                    disabled={ticketData.currentPage === ticketData.totalPages}
                                >
                                    Suivant
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    )
}