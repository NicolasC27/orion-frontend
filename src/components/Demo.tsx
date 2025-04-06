"use client";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableRowHeight,
  type TableProps,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  CircleAlert,
  CircleX,
  Columns3,
  Ellipsis,
  Filter,
  ListFilter,
  Plus,
  Trash,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Hash,
  FileText,
  Tag,
  AlertCircle,
  User,
  Folder,
  BookMarked,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Eye,
  HelpCircle,
  CirclePlus,
  Timer,
  Loader2,
  ShieldAlert,
  BadgeCheck,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minimize,
  LayoutGrid,
  Maximize,
  Sparkles,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

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
  Username: string
  CreatedAt: string
  Email: string
  PasswordHash: string
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
  totalItems: number
  totalPages: number
  pageSize: number
  currentPage: number
  items: Ticket[]
}

const API_BASE_URL = "http://localhost:8082"

type StatusConfig = {
  color: string;
  icon: JSX.Element;
};

type StatusConfigs = {
  [key: string]: StatusConfig;
};

const statusConfigs: StatusConfigs = {
  "Non validé": {
    color: "bg-indigo-100 hover:bg-indigo-200",
    icon: <CirclePlus className="h-4 w-4 text-indigo-600" />,
  },
  "Demande planifiée": {
    color: "bg-violet-100 hover:bg-violet-200",
    icon: <Timer className="h-4 w-4 text-violet-600" />,
  },
  "En attente": {
    color: "bg-amber-100 hover:bg-amber-200",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
  },
  "En cours": {
    color: "bg-blue-100 hover:bg-blue-200",
    icon: <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />,
  },
  "Bloqué": {
    color: "bg-red-100 hover:bg-red-200",
    icon: <ShieldAlert className="h-4 w-4 text-red-600" />,
  },
  "À valider": {
    color: "bg-purple-100 hover:bg-purple-200",
    icon: <CheckCircle className="h-4 w-4 text-purple-600" />,
  },
  "Résolu": {
    color: "bg-emerald-100 hover:bg-emerald-200",
    icon: <BadgeCheck className="h-4 w-4 text-emerald-600" />,
  }
};

const getStatusConfig = (statusName: string): StatusConfig => {
  return statusConfigs[statusName] || {
    color: "bg-white hover:bg-slate-50/50",
    icon: <AlertCircle className="h-4 w-4 text-slate-500" />
  };
};

type PriorityConfig = {
  color: string;
  icon: JSX.Element;
  bgColor: string;
};

type PriorityConfigs = {
  [key: string]: PriorityConfig;
};

const priorityConfigs: PriorityConfigs = {
  "Immédiat": {
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  "Urgent": {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  "Normal": {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  "Haut": {
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  "Bas": {
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    icon: <Timer className="h-3.5 w-3.5" />,
  }
};

const getPriorityConfig = (priorityName: string): PriorityConfig => {
  return priorityConfigs[priorityName] || {
    color: "text-white",
    bgColor: "bg-gradient-to-r from-slate-400 to-slate-500 border-none shadow-sm shadow-slate-400/20 hover:shadow-md hover:shadow-slate-400/30 hover:-translate-y-0.5",
    icon: <Clock className="h-3.5 w-3.5 text-white/90" />
  };
};

function RowActions({ row }: { row: Row<Ticket> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-ignore-row-click="true">
        <div className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getDensityClass = (rowHeight: "compact" | "default" | "comfortable") => {
  switch (rowHeight) {
    case "compact":
      return "[&_td]:py-1.5 [&_th]:py-1.5 [&_th]:h-8 text-xs";
    case "comfortable":
      return "[&_td]:py-4 [&_th]:py-4 [&_th]:h-14 text-sm";
    default:
      return "[&_td]:py-2.5 [&_th]:py-2.5 [&_th]:h-10 text-xs";
  }
};

// Update layout type
type LayoutMode = "full" | "centered";
type BackgroundStyle = "gradient" | "mesh" | "grid" | "noise" | "minimal" | "geometric";

interface ComponentProps {
  expanded: boolean;
}

function Component({ expanded }: ComponentProps) {
  const id = useId();
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [rowHeight, setRowHeight] = useState<"default" | "compact" | "comfortable">("default");
  const [tableWidth, setTableWidth] = useState<"small" | "normal" | "large">("normal");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("centered");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "Title",
      desc: false,
    },
  ]);

  const [ticketData, setTicketData] = useState<TicketData>({
    totalItems: 0,
    totalPages: 1,
    pageSize: 50,
    currentPage: 1,
    items: []
  });

  const [userCache, setUserCache] = useState<Record<number, User>>({});
  const [projectCache, setProjectCache] = useState<Record<number, Project>>({});
  const [statusCache, setStatusCache] = useState<Record<number, Status>>({});
  const [priorityCache, setPriorityCache] = useState<Record<number, Priority>>({});
  const [categoryCache, setCategoryCache] = useState<Record<number, Category>>({});

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>("gradient");

  useEffect(() => {
    fetchTickets();
  }, [pagination.pageIndex, pagination.pageSize, searchTerm]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/tickets?${queryParams}`);
      const data: TicketData = await response.json();
      setTicketData(data);
      fetchRelatedData(data.items);
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async (tickets: Ticket[]) => {
    const uniqueUserIds = [...new Set(tickets.flatMap(t => [t.UserID, t.AssigneeID]))];
    const uniqueProjectIds = [...new Set(tickets.map(t => t.ProjectID))];
    const uniqueStatusIds = [...new Set(tickets.map(t => t.StatusID))];
    const uniquePriorityIds = [...new Set(tickets.map(t => t.PriorityID))];
    const uniqueCategoryIds = [...new Set(tickets.map(t => t.CategoryID))];

    await Promise.all([
      fetchUsers(uniqueUserIds),
      fetchProjects(uniqueProjectIds),
      fetchStatuses(uniqueStatusIds),
      fetchPriorities(uniquePriorityIds),
      fetchCategories(uniqueCategoryIds),
    ]);
  };

  const fetchUsers = async (ids: number[]) => {
    const newUserIds = ids.filter(id => !userCache[id]);
    if (newUserIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users?ids=${newUserIds.join(',')}`);
        const users: User[] = await response.json();
        setUserCache(prev => ({
          ...prev,
          ...Object.fromEntries(users.map(user => [user.ID, user]))
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    }
  };

  const fetchProjects = async (ids: number[]) => {
    const newProjectIds = ids.filter(id => !projectCache[id]);
    if (newProjectIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects?ids=${newProjectIds.join(',')}`);
        const projects: Project[] = await response.json();
        setProjectCache(prev => ({
          ...prev,
          ...Object.fromEntries(projects.map(project => [project.ID, project]))
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
      }
    }
  };

  const fetchStatuses = async (ids: number[]) => {
    const newStatusIds = ids.filter(id => !statusCache[id]);
    if (newStatusIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/statuses?ids=${newStatusIds.join(',')}`);
        const statuses: Status[] = await response.json();
        setStatusCache(prev => ({
          ...prev,
          ...Object.fromEntries(statuses.map(status => [status.ID, status]))
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des statuts:", error);
      }
    }
  };

  const fetchPriorities = async (ids: number[]) => {
    const newPriorityIds = ids.filter(id => !priorityCache[id]);
    if (newPriorityIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/priorities?ids=${newPriorityIds.join(',')}`);
        const priorities: Priority[] = await response.json();
        setPriorityCache(prev => ({
          ...prev,
          ...Object.fromEntries(priorities.map(priority => [priority.ID, priority]))
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des priorités:", error);
      }
    }
  };

  const fetchCategories = async (ids: number[]) => {
    const newCategoryIds = ids.filter(id => !categoryCache[id]);
    if (newCategoryIds.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories?ids=${newCategoryIds.join(',')}`);
        const categories: Category[] = await response.json();
        setCategoryCache(prev => ({
          ...prev,
          ...Object.fromEntries(categories.map(category => [category.ID, category]))
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    }
  };

  const getCellWidth = (mode: "small" | "normal" | "large", type: "status" | "project" | "category") => {
    const widths = {
      small: {
        status: "w-20", // 80px
        project: "w-24", // 96px
        category: "w-24", // 96px
      },
      normal: {
        status: "w-24", // 96px
        project: "w-32", // 128px
        category: "w-32", // 128px
      },
      large: {
        status: "w-32", // 128px
        project: "w-40", // 160px
        category: "w-40", // 160px
      },
    };
    return widths[mode][type];
  };

  const columns = useMemo<ColumnDef<Ticket>[]>(() => {
    const baseColumns: ColumnDef<Ticket>[] = [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        size: 40,
        header: ({ table }: { table: any }) => (
          <div className={cn(
            "px-1",
            !showCheckboxes && "hidden"
          )}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }: { row: Row<Ticket> }) => (
          <div className={cn(
            "px-1",
            !showCheckboxes && "hidden"
          )}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
      },
      {
        accessorKey: "StatusID",
        header: () => (
          <div className="flex items-center justify-center gap-2 h-full">
            <Tag className="h-4 w-4 text-white" />
            <span>Statut</span>
          </div>
        ),
        cell: ({ row }) => {
          const status = statusCache[row.getValue("StatusID") as number];
          if (!status) return null;
          
          const config = getStatusConfig(status.Name);
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 w-[150px]">
                    <div className={cn(
                      "w-full px-2.5 py-1.5 rounded-md group relative",
                      "transition-all duration-200",
                      status.Name === "Non validé" && "bg-indigo-100 hover:bg-indigo-200",
                      status.Name === "Demande planifiée" && "bg-violet-100 hover:bg-violet-200",
                      status.Name === "En attente" && "bg-amber-100 hover:bg-amber-200",
                      status.Name === "En cours" && "bg-blue-100 hover:bg-blue-200",
                      status.Name === "Bloqué" && "bg-red-100 hover:bg-red-200",
                      status.Name === "À valider" && "bg-purple-100 hover:bg-purple-200",
                      status.Name === "Résolu" && "bg-emerald-100 hover:bg-emerald-200"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200",
                          status.Name === "Non validé" && "bg-indigo-500 group-hover:ring-4 ring-indigo-500/30",
                          status.Name === "Demande planifiée" && "bg-violet-500 group-hover:ring-4 ring-violet-500/30",
                          status.Name === "En attente" && "bg-yellow-500 group-hover:ring-4 ring-yellow-500/30",
                          status.Name === "En cours" && "bg-blue-500 group-hover:ring-4 ring-blue-500/30",
                          status.Name === "Bloqué" && "bg-red-500 group-hover:ring-4 ring-red-500/30",
                          status.Name === "À valider" && "bg-teal-500 group-hover:ring-4 ring-teal-500/30",
                          status.Name === "Résolu" && "bg-emerald-500 group-hover:ring-4 ring-emerald-500/30",
                          (status.Name === "En cours" || status.Name === "Bloqué") && "animate-pulse"
                        )} />
                        <div className="flex items-center gap-1.5">
                          <div className="opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                            {config.icon}
                          </div>
                          <span className={cn(
                            "text-sm font-medium truncate transition-colors duration-200",
                            status.Name === "Non validé" && "text-indigo-600 group-hover:text-indigo-700",
                            status.Name === "Demande planifiée" && "text-violet-600 group-hover:text-violet-700",
                            status.Name === "En attente" && "text-yellow-600 group-hover:text-yellow-700",
                            status.Name === "En cours" && "text-blue-600 group-hover:text-blue-700",
                            status.Name === "Bloqué" && "text-red-600 group-hover:text-red-700",
                            status.Name === "À valider" && "text-teal-600 group-hover:text-teal-700",
                            status.Name === "Résolu" && "text-emerald-600 group-hover:text-emerald-700"
                          )}>
                            {status.Name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2 p-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    status.Name === "Non validé" && "bg-slate-100",
                    status.Name === "Demande planifiée" && "bg-cyan-100",
                    status.Name === "En attente" && "bg-amber-100",
                    status.Name === "En cours" && "bg-blue-100",
                    status.Name === "Bloqué" && "bg-red-100",
                    status.Name === "À valider" && "bg-purple-100",
                    status.Name === "Résolu" && "bg-emerald-100"
                  )}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-medium mb-0.5">{status.Name}</p>
                    <p className="text-xs text-muted-foreground">
                      {status.Name === "Non validé" && "Ticket en attente de validation"}
                      {status.Name === "Demande planifiée" && "Demande planifiée pour traitement"}
                      {status.Name === "En attente" && "En attente de traitement"}
                      {status.Name === "En cours" && "Traitement en cours"}
                      {status.Name === "Bloqué" && "Nécessite une intervention"}
                      {status.Name === "À valider" && "En attente de validation"}
                      {status.Name === "Résolu" && "Ticket résolu avec succès"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        size: 140,
        minSize: 140,
        maxSize: 140,
      },
      {
        accessorKey: "Title",
        header: () => (
          <div className="flex items-center justify-center gap-2 h-full">
            <FileText className="h-4 w-4 text-white" />
            <span>Titre</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="min-w-[500px] text-sm tracking-tight font-medium text-gray-900">
            <span className="text-slate-400 font-mono mr-2">#{row.original.ID}</span>
            {row.getValue("Title")}
          </div>
        ),
        size: 400,
        minSize: 300,
      },
      {
        accessorKey: "PriorityID",
        header: () => (
          <div className="flex items-center justify-center gap-2 h-full">
            <AlertCircle className="h-4 w-4 text-white" />
            <span>Priorité</span>
          </div>
        ),
        cell: ({ row }) => {
          const priority = priorityCache[row.getValue("PriorityID") as number]
          if (!priority) return null;
          
          const config = getPriorityConfig(priority.Name);
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md group transition-all duration-200",
                      config.bgColor,
                      "hover:ring-2 hover:ring-opacity-20",
                      priority.Name === "Immédiat" && "hover:ring-rose-500/20",
                      priority.Name === "Urgent" && "hover:ring-orange-500/20",
                      priority.Name === "Normal" && "hover:ring-blue-500/20",
                      priority.Name === "Haut" && "hover:ring-rose-500/20",
                      priority.Name === "Bas" && "hover:ring-slate-500/20"
                    )}>
                      <div className={cn(
                        "relative flex items-center",
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          priority.Name === "Immédiat" && "bg-rose-500 animate-pulse",
                          priority.Name === "Urgent" && "bg-orange-500",
                          priority.Name === "Normal" && "bg-blue-500",
                          priority.Name === "Haut" && "bg-rose-500",
                          priority.Name === "Bas" && "bg-slate-500"
                        )} />
                        <div className={cn(
                          "ml-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100",
                          config.color
                        )}>
                          {config.icon}
                        </div>
                        <span className={cn(
                          "ml-1.5 text-sm font-medium",
                          config.color
                        )}>
                          {priority.Name}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2 p-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    config.bgColor
                  )}>
                    {config.icon}
                  </div>
                  <div>
                    <p className={cn("font-medium mb-0.5", config.color)}>
                      {priority.Name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {priority.Name === "Immédiat" && "Nécessite une action immédiate"}
                      {priority.Name === "Urgent" && "À traiter en priorité"}
                      {priority.Name === "Normal" && "Priorité standard"}
                      {priority.Name === "Haut" && "Nécessite une intervention"}
                      {priority.Name === "Bas" && "Peut être traité plus tard"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        size: 140,
        minSize: 140,
        maxSize: 140,
      },
      {
        accessorKey: "AssigneeID",
        header: () => (
          <div className="flex items-center justify-center gap-2 h-full">
            <User className="h-4 w-4 text-white" />
            <span>Assigné</span>
          </div>
        ),
        cell: ({ row }) => {
          const assignee = userCache[row.getValue("AssigneeID") as number]
          return assignee ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{assignee.Username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-gray-900">{assignee.Username}</span>
            </div>
          ) : null
        },
        size: 180,
        minSize: 180,
        maxSize: 180,
      },
      {
        accessorKey: "ProjectID",
        header: () => (
          <div className="flex items-center justify-center gap-2 h-full">
            <Folder className="h-4 w-4 text-white" />
            <span>Projet</span>
          </div>
        ),
        cell: ({ row }) => {
          const project = projectCache[row.getValue("ProjectID") as number]
          return project ? (
            <div 
              className={cn(
                "truncate text-sm font-medium text-gray-900",
                getCellWidth(tableWidth, "project")
              )}
              title={project.Name}
            >
              {project.Name}
            </div>
          ) : null
        },
        size: 140,
        minSize: 140,
        maxSize: 140,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <RowActions row={row} />,
        size: 50,
        minSize: 50,
        maxSize: 50,
      },
    ];

    return baseColumns;
  }, [showCheckboxes, tableWidth, statusCache, priorityCache, userCache, projectCache]);

  const table = useReactTable({
    data: ticketData.items,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: showCheckboxes,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: ticketData.totalPages,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCheckboxes) {
        setShowCheckboxes(false);
        table.resetRowSelection();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showCheckboxes, table]);

  // Get unique status values
  const uniqueStatusValues = useMemo(() => {
    const statusColumn = table.getColumn("StatusID");

    if (!statusColumn) return [];

    const values = Array.from(statusColumn.getFacetedUniqueValues().keys());

    return values.sort();
  }, [table.getColumn("StatusID")?.getFacetedUniqueValues()]);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("StatusID");
    if (!statusColumn) return new Map();
    return statusColumn.getFacetedUniqueValues();
  }, [table.getColumn("StatusID")?.getFacetedUniqueValues()]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("StatusID")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("StatusID")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("StatusID")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("StatusID")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className={cn(
      "flex-1 transition-all duration-300 min-h-screen",
      expanded ? "pl-64" : "pl-16"
    )}>
      <div className={cn(
        "fixed inset-0",
        expanded ? "ml-64" : "ml-16"
      )}>
        {/* Style 1: Dégradé Moderne avec Effet Aurora */}
        {backgroundStyle === "gradient" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 via-purple-200/30 to-rose-100/30 dark:from-teal-900/20 dark:via-purple-900/20 dark:to-rose-900/20 opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-indigo-200/20 to-violet-100/20 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-violet-900/10 opacity-50 backdrop-blur-[50px]" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse delay-1000" />
            </div>
          </>
        )}

        {/* Style 2: Motif Mesh Organique */}
        {backgroundStyle === "mesh" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#e5e7eb,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_60%_400px,#ddd6fe,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_80%_600px,#fbcfe8,transparent)]" />
            <div className="absolute inset-0 backdrop-blur-[100px]" />
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50" />
          </>
        )}

        {/* Style 3: Grille Moderne avec Points */}
        {backgroundStyle === "grid" && (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="absolute inset-0">
              <div className="absolute h-14 w-14 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 opacity-20 blur-xl" style={{ left: '20%', top: '20%' }} />
              <div className="absolute h-14 w-14 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 opacity-20 blur-xl" style={{ right: '20%', top: '60%' }} />
            </div>
            <div className="absolute inset-0 backdrop-blur-3xl" />
          </>
        )}

        {/* Style 4: Bruit Texturé */}
        {backgroundStyle === "noise" && (
          <>
            <div className="absolute inset-0 bg-[#fafafa] dark:bg-slate-950" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 via-sky-100/20 to-violet-100/20 dark:from-rose-900/10 dark:via-sky-900/10 dark:to-violet-900/10" />
          </>
        )}

        {/* Style 5: Minimaliste */}
        {backgroundStyle === "minimal" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#e5e7eb0d,transparent)]" />
          </>
        )}

        {/* Style 6: Motifs Géométriques */}
        {backgroundStyle === "geometric" && (
          <>
            <div className="absolute inset-0 bg-white dark:bg-slate-950" />
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#f0f0f008_0deg,#f0f0f004_90deg,#f0f0f008_180deg,#f0f0f004_270deg,#f0f0f008_360deg)]" />
            <div className="absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            </div>
          </>
        )}
      </div>

      {/* Ajout des contrôles de background */}
      <div className="relative z-10 flex items-center gap-2 p-4">
        <Select
          value={backgroundStyle}
          onValueChange={(value: BackgroundStyle) => setBackgroundStyle(value)}
        >
          <SelectTrigger className="h-8 w-[180px] bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Style de fond" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gradient">Dégradé Aurora</SelectItem>
            <SelectItem value="mesh">Mesh Organique</SelectItem>
            <SelectItem value="grid">Grille Moderne</SelectItem>
            <SelectItem value="noise">Bruit Texturé</SelectItem>
            <SelectItem value="minimal">Minimaliste</SelectItem>
            <SelectItem value="geometric">Géométrique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        "relative z-10 min-h-screen px-4 py-8 pb-16",
        layoutMode === "centered" && "container mx-auto max-w-[90rem]",
      )}>
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-200/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tickets</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{ticketData.totalItems}</h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/[0.08] to-transparent">
                <BookMarked className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 mr-1 text-emerald-500" />
              <span className="font-medium text-emerald-600">12% increase</span>
              <span className="text-slate-500 ml-2">from last month</span>
            </div>
          </div>

          <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-200/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {ticketData.items.filter(ticket => statusCache[ticket.StatusID]?.Name === "Résolu").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 mr-1 text-emerald-500" />
              <span className="font-medium text-emerald-600">8% increase</span>
              <span className="text-slate-500 ml-2">from last week</span>
            </div>
          </div>

          <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-200/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {ticketData.items.filter(ticket => statusCache[ticket.StatusID]?.Name === "En cours").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/[0.08] to-transparent">
                <Timer className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <ArrowDown className="w-4 h-4 mr-1 text-rose-500" />
              <span className="font-medium text-rose-600">5% decrease</span>
              <span className="text-slate-500 ml-2">from yesterday</span>
            </div>
          </div>

          <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-200/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Blocked</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {ticketData.items.filter(ticket => statusCache[ticket.StatusID]?.Name === "Bloqué").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/[0.08] to-transparent">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 mr-1 text-amber-500" />
              <span className="font-medium text-amber-600">2 new</span>
              <span className="text-slate-500 ml-2">since last check</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-transparent">
          <div className="flex items-center gap-4 px-6 py-4 bg-transparent backdrop-blur-sm">
            <Badge 
              variant="secondary" 
              className={cn(
                "relative group overflow-hidden",
                "bg-white/80 hover:bg-white/90",
                "border border-slate-200/60",
                "text-slate-600 hover:text-slate-700",
                "shadow-sm hover:shadow-md",
                "transition-all duration-300 ease-in-out",
                "backdrop-blur-sm"
              )}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-500/70 group-hover:text-blue-500 transition-colors duration-300" />
                <span className="relative">
                  {ticketData.totalItems} tickets
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Badge>

            {selectedStatuses.length > 0 && (
              <Badge 
                variant="secondary"
                className={cn(
                  "relative group overflow-hidden",
                  "bg-violet-50/80 hover:bg-violet-50/90",
                  "border border-violet-200/60",
                  "text-violet-600 hover:text-violet-700",
                  "shadow-sm hover:shadow-md",
                  "transition-all duration-300 ease-in-out",
                  "backdrop-blur-sm"
                )}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-violet-500/70 group-hover:text-violet-500 transition-colors duration-300" />
                  <span className="relative">
                    {selectedStatuses.length} filtres actifs
                    <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Badge>
            )}

            {table.getSelectedRowModel().rows.length > 0 && (
              <Badge 
                variant="secondary"
                className={cn(
                  "relative group overflow-hidden",
                  "bg-rose-50/80 hover:bg-rose-50/90",
                  "border border-rose-200/60",
                  "text-rose-600 hover:text-rose-700",
                  "shadow-sm hover:shadow-md",
                  "transition-all duration-300 ease-in-out",
                  "backdrop-blur-sm"
                )}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-500/70 group-hover:text-rose-500 transition-colors duration-300" />
                  <span className="relative">
                    {table.getSelectedRowModel().rows.length} sélectionnés
                    <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Badge>
            )}

            {/* Layout Controls */}
            <div className="flex items-center gap-2 bg-white/80 p-1 rounded-lg ml-auto backdrop-blur-sm hover:bg-white/90 transition-all duration-200">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLayoutMode("full")}
                      className={cn(
                        "h-8 w-8",
                        layoutMode === "full" && "bg-white shadow-sm"
                      )}
                    >
                      <Maximize className="h-4 w-4" />
                      <span className="sr-only">Vue large</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vue large</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLayoutMode("centered")}
                      className={cn(
                        "h-8 w-8",
                        layoutMode === "centered" && "bg-white shadow-sm"
                      )}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only">Vue centrée</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vue centrée</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Density Controls */}
            <div className="flex items-center gap-2 bg-white/80 p-1 rounded-lg backdrop-blur-sm hover:bg-white/90 transition-all duration-200">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRowHeight("compact")}
                      className={cn(
                        "h-8 w-8",
                        rowHeight === "compact" && "bg-white shadow-sm"
                      )}
                    >
                      <Minimize className="h-4 w-4" />
                      <span className="sr-only">Compact view</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vue compacte</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRowHeight("default")}
                      className={cn(
                        "h-8 w-8",
                        rowHeight === "default" && "bg-white shadow-sm"
                      )}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only">Default view</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vue par défaut</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRowHeight("comfortable")}
                      className={cn(
                        "h-8 w-8",
                        rowHeight === "comfortable" && "bg-white shadow-sm"
                      )}
                    >
                      <Maximize className="h-4 w-4" />
                      <span className="sr-only">Comfortable view</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vue confortable</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Selection Mode */}
            <div 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200/60 bg-white/80 hover:bg-white/90 h-9 px-4 py-2 cursor-pointer shadow-sm backdrop-blur-sm transition-all duration-200"
              onClick={() => {
                if (!showCheckboxes) {
                  table.resetRowSelection();
                }
                setShowCheckboxes(!showCheckboxes);
              }}
            >
              <div className="mr-2 flex items-center justify-center">
                <Checkbox checked={showCheckboxes} className="h-4 w-4" />
              </div>
              <span>Selection Mode</span>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="min-w-[300px]">
                <div className="relative">
                  <Input
                    id={`${id}-input`}
                    ref={inputRef}
                    className={cn(
                      "w-full ps-9 py-2 text-sm bg-white/80 border-slate-200/60 hover:bg-white/90 transition-colors duration-200",
                      Boolean(table.getColumn("Title")?.getFilterValue()) && "pe-9",
                    )}
                    value={(table.getColumn("Title")?.getFilterValue() ?? "") as string}
                    onChange={(e) => table.getColumn("Title")?.setFilterValue(e.target.value)}
                    placeholder="Rechercher un ticket..."
                    type="text"
                    aria-label="Rechercher un ticket"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                    <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
                  </div>
                  {Boolean(table.getColumn("Title")?.getFilterValue()) && (
                    <button
                      className="absolute inset-y-0 end-0 flex h-full w-8 items-center justify-center text-muted-foreground/80 hover:text-foreground transition-colors"
                      aria-label="Effacer la recherche"
                      onClick={() => {
                        table.getColumn("Title")?.setFilterValue("");
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }}
                    >
                      <CircleX size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 bg-white/80 hover:bg-white/90 transition-colors duration-200">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Filtres
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1 text-xs">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3" align="start">
                  <div className="space-y-3">
                    <div className="text-xs font-medium">Statut</div>
                    <div className="space-y-2">
                      {uniqueStatusValues.map((value, i) => (
                        <div key={value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${id}-${i}`}
                            checked={selectedStatuses.includes(value)}
                            onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                          />
                          <Label
                            htmlFor={`${id}-${i}`}
                            className="flex grow justify-between items-center text-xs"
                          >
                            {value}
                            <Badge variant="secondary" className="ml-auto text-[10px] px-1">
                              {statusCounts.get(value)}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {table.getSelectedRowModel().rows.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="h-9">
                        <Trash className="mr-2 h-3.5 w-3.5" />
                        Supprimer
                        <Badge variant="destructive" className="ml-2 text-xs">
                          {table.getSelectedRowModel().rows.length}
                        </Badge>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                          aria-hidden="true"
                        >
                          <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                        </div>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            {table.getSelectedRowModel().rows.length} selected{" "}
                            {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          const selectedRows = table.getSelectedRowModel().rows;
                          const updatedData = ticketData.items.filter(
                            (item) => !selectedRows.some((row) => row.original.ID === item.ID),
                          );
                          setTicketData(prev => ({
                            ...prev,
                            items: updatedData
                          }));
                          table.resetRowSelection();
                        }}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button size="sm" className="h-9 bg-white/80 hover:bg-white/90 transition-colors duration-200">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Nouveau ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Table with horizontal scroll */}
          <div className="relative bg-white border-t border-slate-200/60">
            <div className="overflow-x-auto">
              <div style={{ minWidth: layoutMode === "centered" ? "900px" : "1200px" }}>
                <Table className={cn(
                  "w-full [&_tr]:border-0",
                  "[&_td]:px-4 [&_td]:py-4 [&_td]:text-slate-600",
                  "[&_tr.selected]:bg-blue-50/50 [&_tr.selected:hover]:bg-blue-50/70",
                  getDensityClass(rowHeight)
                )}>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-0">
                        {headerGroup.headers.map((header) => (
                          <TableHead 
                            key={header.id} 
                            className={cn(
                              "px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/60",
                              "first:rounded-tl-xl last:rounded-tr-xl",
                              "text-sm font-medium text-slate-600",
                              header.column.getCanSort() && "cursor-pointer hover:text-slate-900 transition-colors"
                            )}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={cn(
                                  "flex items-center gap-2",
                                  header.column.getCanSort() && "select-none"
                                )}
                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                              >
                                {header.column.columnDef.header === "Statut" && (
                                  <Tag className="h-4 w-4 text-indigo-500" />
                                )}
                                {header.column.columnDef.header === "Titre" && (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                                {header.column.columnDef.header === "Priorité" && (
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                                {header.column.columnDef.header === "Assigné" && (
                                  <User className="h-4 w-4 text-purple-500" />
                                )}
                                {header.column.columnDef.header === "Projet" && (
                                  <Folder className="h-4 w-4 text-emerald-500" />
                                )}
                                <span>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {header.column.getCanSort() && (
                                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    {{
                                      asc: <ChevronUp className="h-3.5 w-3.5 text-slate-500" />,
                                      desc: <ChevronDown className="h-3.5 w-3.5 text-slate-500" />,
                                    }[header.column.getIsSorted() as string] ?? (
                                      <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow 
                          key={row.id} 
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "relative transition-all duration-200 bg-white border-b border-slate-100 select-none group",
                            {
                              "hover:bg-gradient-to-r": true,
                              // Dégradés pour le statut (gauche 60%)
                              "hover:from-indigo-200 hover:via-indigo-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "Non validé",
                              "hover:from-violet-200 hover:via-violet-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "Demande planifiée",
                              "hover:from-amber-200 hover:via-amber-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "En attente",
                              "hover:from-blue-200 hover:via-blue-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "En cours",
                              "hover:from-red-200 hover:via-red-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "Bloqué",
                              "hover:from-purple-200 hover:via-purple-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "À valider",
                              "hover:from-emerald-200 hover:via-emerald-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "Résolu",
                              "hover:from-rose-200 hover:via-rose-200 hover:via-60%": statusCache[row.getValue("StatusID") as number]?.Name === "Urgent",
                              // Dégradés pour la priorité (droite 40%)
                              "hover:to-rose-400": priorityCache[row.getValue("PriorityID") as number]?.Name === "Immédiat" || priorityCache[row.getValue("PriorityID") as number]?.Name === "Haut",
                              "hover:to-orange-400": priorityCache[row.getValue("PriorityID") as number]?.Name === "Urgent",
                              "hover:to-blue-400": priorityCache[row.getValue("PriorityID") as number]?.Name === "Normal",
                              "hover:to-slate-400": priorityCache[row.getValue("PriorityID") as number]?.Name === "Bas",
                            },
                            showCheckboxes && "cursor-pointer",
                            row.getIsSelected() && "!bg-blue-50/50 hover:!bg-blue-50/70",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell 
                              key={cell.id} 
                              className={cn(
                                "group relative",
                                {
                                  "text-rose-900": priorityCache[row.getValue("PriorityID") as number]?.Name === "Immédiat" && cell.column.id !== "StatusID",
                                  "text-orange-900": priorityCache[row.getValue("PriorityID") as number]?.Name === "Urgent" && cell.column.id !== "StatusID",
                                  "text-blue-900": priorityCache[row.getValue("PriorityID") as number]?.Name === "Normal" && cell.column.id !== "StatusID",
                                  "text-slate-900": priorityCache[row.getValue("PriorityID") as number]?.Name === "Bas" && cell.column.id !== "StatusID",
                                }
                              )}
                            >
                              {cell.column.id === "StatusID" ? (
                                (() => {
                                  const status = statusCache[cell.row.getValue("StatusID") as number];
                                  if (!status) return null;
                                  
                                  const config = getStatusConfig(status.Name);
                                  return (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-2 w-[150px]">
                                            <div className={cn(
                                              "w-full px-2.5 py-1.5 rounded-md group relative",
                                              "transition-all duration-200",
                                              status.Name === "Non validé" && "bg-indigo-100 hover:bg-indigo-200",
                                              status.Name === "Demande planifiée" && "bg-violet-100 hover:bg-violet-200",
                                              status.Name === "En attente" && "bg-amber-100 hover:bg-amber-200",
                                              status.Name === "En cours" && "bg-blue-100 hover:bg-blue-200",
                                              status.Name === "Bloqué" && "bg-red-100 hover:bg-red-200",
                                              status.Name === "À valider" && "bg-purple-100 hover:bg-purple-200",
                                              status.Name === "Résolu" && "bg-emerald-100 hover:bg-emerald-200"
                                            )}>
                                              <div className="flex items-center gap-2">
                                                <div className={cn(
                                                  "w-2 h-2 rounded-full transition-all duration-200",
                                                  status.Name === "Non validé" && "bg-indigo-500 group-hover:ring-4 ring-indigo-500/30",
                                                  status.Name === "Demande planifiée" && "bg-violet-500 group-hover:ring-4 ring-violet-500/30",
                                                  status.Name === "En attente" && "bg-yellow-500 group-hover:ring-4 ring-yellow-500/30",
                                                  status.Name === "En cours" && "bg-blue-500 group-hover:ring-4 ring-blue-500/30",
                                                  status.Name === "Bloqué" && "bg-red-500 group-hover:ring-4 ring-red-500/30",
                                                  status.Name === "À valider" && "bg-teal-500 group-hover:ring-4 ring-teal-500/30",
                                                  status.Name === "Résolu" && "bg-emerald-500 group-hover:ring-4 ring-emerald-500/30",
                                                  (status.Name === "En cours" || status.Name === "Bloqué") && "animate-pulse"
                                                )} />
                                                <div className="flex items-center gap-1.5">
                                                  <div className="opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                                                    {config.icon}
                                                  </div>
                                                  <span className={cn(
                                                    "text-sm font-medium truncate transition-colors duration-200",
                                                    status.Name === "Non validé" && "text-indigo-600 group-hover:text-indigo-700",
                                                    status.Name === "Demande planifiée" && "text-violet-600 group-hover:text-violet-700",
                                                    status.Name === "En attente" && "text-yellow-600 group-hover:text-yellow-700",
                                                    status.Name === "En cours" && "text-blue-600 group-hover:text-blue-700",
                                                    status.Name === "Bloqué" && "text-red-600 group-hover:text-red-700",
                                                    status.Name === "À valider" && "text-teal-600 group-hover:text-teal-700",
                                                    status.Name === "Résolu" && "text-emerald-600 group-hover:text-emerald-700"
                                                  )}>
                                                    {status.Name}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="flex items-center gap-2 p-3">
                                          <div className={cn(
                                            "p-2 rounded-full",
                                            status.Name === "Non validé" && "bg-slate-100",
                                            status.Name === "Demande planifiée" && "bg-cyan-100",
                                            status.Name === "En attente" && "bg-amber-100",
                                            status.Name === "En cours" && "bg-blue-100",
                                            status.Name === "Bloqué" && "bg-red-100",
                                            status.Name === "À valider" && "bg-purple-100",
                                            status.Name === "Résolu" && "bg-emerald-100"
                                          )}>
                                            {config.icon}
                                          </div>
                                          <div>
                                            <p className="font-medium mb-0.5">{status.Name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {status.Name === "Non validé" && "Ticket en attente de validation"}
                                              {status.Name === "Demande planifiée" && "Demande planifiée pour traitement"}
                                              {status.Name === "En attente" && "En attente de traitement"}
                                              {status.Name === "En cours" && "Traitement en cours"}
                                              {status.Name === "Bloqué" && "Nécessite une intervention"}
                                              {status.Name === "À valider" && "En attente de validation"}
                                              {status.Name === "Résolu" && "Ticket résolu avec succès"}
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })()
                              ) : cell.column.id === "Title" ? (
                                <div className="min-w-[500px] text-sm tracking-tight font-medium text-gray-900">
                                  <span className="text-slate-400 font-mono mr-2">#{row.original.ID}</span>
                                  {row.getValue("Title")}
                                </div>
                              ) : (
                                flexRender(cell.column.columnDef.cell, cell.getContext())
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                            <div className="rounded-full bg-slate-100/80 p-3.5 shadow-sm">
                              <AlertCircle className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium">Aucun résultat</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination with sticky positioning */}
          <div className="sticky left-0 mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 min-w-[70px] text-xs bg-white shadow-sm transition-all duration-200 hover:bg-slate-50/80">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Éléments par page</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={cn(
                  "h-8 text-xs bg-white shadow-sm transition-all duration-200",
                  "hover:bg-slate-50/80",
                  "disabled:opacity-50 disabled:hover:bg-white"
                )}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={cn(
                  "h-8 text-xs bg-white shadow-sm transition-all duration-200",
                  "hover:bg-slate-50/80",
                  "disabled:opacity-50 disabled:hover:bg-white"
                )}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;