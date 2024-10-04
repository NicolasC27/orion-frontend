"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, GitPullRequestIcon, MessageSquareIcon, UserIcon, AlertCircle, FileIcon, ActivityIcon, XIcon, LayoutIcon, SearchIcon, TicketIcon, Sun, Moon, EyeIcon, ClockIcon, TagIcon, TimerIcon, PaperclipIcon, KeyboardIcon, BarChartIcon, ImageIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Viewer {
  id: string;
  name: string;
  avatar: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TimelineEvent {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'tag_added' | 'tag_removed' | 'file_added';
  content: string;
  timestamp: Date;
  user: {
    name: string;
    avatar: string;
  };
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
}

const TicketDetailPage = () => {
  const [progress, setProgress] = React.useState(33)
  const [isWatching, setIsWatching] = React.useState(false)
  const [activeModal, setActiveModal] = React.useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [viewers, setViewers] = React.useState<Viewer[]>([
    { id: "1", name: "Alice Smith", avatar: "/avatars/01.png" },
    { id: "2", name: "Bob Johnson", avatar: "/avatars/02.png" },
    { id: "3", name: "Charlie Brown", avatar: "/avatars/03.png" },
  ])
  const [lastViewed, setLastViewed] = React.useState(new Date())
  const [tags, setTags] = React.useState<Tag[]>([
    { id: "1", name: "UI", color: "bg-blue-500" },
    { id: "2", name: "Bug", color: "bg-red-500" },
    { id: "3", name: "Feature", color: "bg-green-500" },
  ])
  const [selectedTags, setSelectedTags] = React.useState<string[]>(["1"])
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([
    {
      id: "1",
      type: "comment",
      content: "Nouveau commentaire ajouté",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: { name: "Alice Smith", avatar: "/avatars/01.png" },
    },
    {
      id: "2",
      type: "status_change",
      content: "Statut changé à 'En cours'",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: { name: "Bob Johnson", avatar: "/avatars/02.png" },
    },
    {
      id: "3",
      type: "assignment",
      content: "Assigné à John Doe",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: { name: "Charlie Brown", avatar: "/avatars/03.png" },
    },
    {
      id: "4",
      type: "file_added",
      content: "Nouvelle maquette ajoutée",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: { name: "David Wilson", avatar: "/avatars/04.png" },
    },
  ])
  const [estimatedTime, setEstimatedTime] = React.useState(8)
  const [timeSpent, setTimeSpent] = React.useState(3)
  const [commentTemplates, setCommentTemplates] = React.useState([
    "Merci pour votre rapport. Pouvez-vous fournir plus de détails ?",
    "Ce problème a été résolu dans la dernière mise à jour.",
    "Je vais examiner ce problème et revenir vers vous rapidement.",
  ])
  const [currentCommentTemplate, setCurrentCommentTemplate] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([
    { id: "1", name: "maquette_v1.png", type: "image", url: "/placeholder.svg?height=200&width=300" },
    { id: "2", name: "specifications.pdf", type: "document", url: "#" },
  ])
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    }, 10000)

    const viewersInterval = setInterval(() => {
      const randomAction = Math.random()
      if (randomAction < 0.3 && viewers.length > 1) {
        setViewers(prev => prev.filter((_, index) => index !== Math.floor(Math.random() * prev.length)))
      } else if (randomAction < 0.6 && viewers.length < 5) {
        const newId = String(viewers.length + 1)
        setViewers(prev => [...prev, { id: newId, name: `User ${newId}`, avatar: `/avatars/0${newId}.png` }])
      }
    }, 5000)

    return () => {
      clearInterval(typingInterval)
      clearInterval(viewersInterval)
    }
  }, [viewers])

  const openModal = (modalName: string) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return `${diffInSeconds} secondes`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} heures`
    return `${Math.floor(diffInSeconds / 86400)} jours`
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newAttachment: Attachment = {
        id: String(attachments.length + 1),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
      }
      setAttachments(prev => [...prev, newAttachment])
      setTimelineEvents(prev => [
        {
          id: String(prev.length + 1),
          type: 'file_added',
          content: `Nouveau fichier ajouté: ${file.name}`,
          timestamp: new Date(),
          user: { name: "John Doe", avatar: "/avatars/01.png" },
        },
        ...prev,
      ])
    }
  }

  const Modal = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <AnimatePresence>
      {activeModal === title && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg z-50 overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
      <TooltipProvider>
        <div className="flex-1 ml-64 transition-all duration-300">

          <header
              className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ticket #1234</h1>
                  <Badge variant="secondary"
                         className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                    En cours
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    <Input
                        type="text"
                        placeholder="Rechercher un ticket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300"
                    />
                  </div>
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="bg-gray-100 dark:bg-gray-800"
                  >
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                    <Moon
                        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                    <span className="sr-only">Changer le thème</span>
                  </Button>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="outline" className="bg-gray-100 dark:bg-gray-800">
                        <UserIcon className="mr-2 h-4 w-4"/>
                        John Doe
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src="/avatars/01.png"/>
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">John Doe</h4>
                          <p className="text-sm">Designer principal</p>
                          <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">Tickets assignés:</span>
                            <Badge variant="secondary" className="ml-2">12</Badge>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Refonte de l'interface
                utilisateur</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Créé le: 1 juillet 2023</span>
                <span>•</span>
                <span>Dernière mise à jour: il y a 2 heures</span>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4"/>
                  <div className="flex -space-x-1 overflow-hidden">
                    {viewers.map((viewer) => (
                        <Tooltip key={viewer.id}>
                          <TooltipTrigger>
                            <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-white">
                              <AvatarImage src={viewer.avatar} alt={viewer.name}/>
                              <AvatarFallback>{viewer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{viewer.name}</p>
                          </TooltipContent>
                        </Tooltip>
                    ))}
                  </div>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1"/>
                  <span>Vu il y a {formatTimeAgo(lastViewed)}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Statut</CardTitle>
                  <Badge variant="secondary"
                         className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">En
                    cours</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress}%</div>
                  <Progress value={progress} className="mt-2"/>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Priorité</CardTitle>
                  <Badge variant="destructive">Élevée</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Critique</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Défini par le chef de projet
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigné à</CardTitle>
                  <UserIcon className="h-4 w-4 text-gray-500"/>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">John Doe</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Designer principal
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Date d'échéance</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-gray-500"/>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15 juil</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    5 jours restants
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card
                  className="md:col-span-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Aperçu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Refonte de l'interface utilisateur du tableau de bord pour améliorer l'expérience utilisateur et
                    s'aligner sur nos nouvelles directives de marque. Cela comprend la mise à jour du schéma de
                    couleurs, de la typographie et de la mise en page globale pour créer un design plus moderne et
                    intuitif.
                  </p>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <TimerIcon className="h-5 w-5 text-gray-500"/>
                      <span className="text-sm font-medium">Temps estimé: {estimatedTime}h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-500"/>
                      <span className="text-sm font-medium">Temps passé: {timeSpent}h</span>
                    </div>
                  </div>
                  <Progress value={(timeSpent / estimatedTime) * 100} className="mb-4"/>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            className={`cursor-pointer ${selectedTags.includes(tag.id) ? tag.color + ' text-white' : ''}`}
                            onClick={() => handleTagSelect(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => openModal("Pull Requests associées")} className="w-full justify-start">
                    <GitPullRequestIcon className="mr-2 h-4 w-4"/>
                    Pull Requests associées
                  </Button>
                  <Button onClick={() => openModal("Activité")} className="w-full justify-start">
                    <ActivityIcon className="mr-2 h-4 w-4"/>
                    Activité
                  </Button>
                  <Button onClick={() => openModal("Fichiers")} className="w-full justify-start">
                    <FileIcon className="mr-2 h-4 w-4"/>
                    Fichiers
                  </Button>
                  <Button onClick={() => openModal("Raccourcis clavier")} className="w-full justify-start">
                    <KeyboardIcon className="mr-2 h-4 w-4"/>
                    Raccourcis clavier
                  </Button>
                  <Button onClick={() => openModal("Métriques")} className="w-full justify-start">
                    <BarChartIcon className="mr-2 h-4 w-4"/>
                    Métriques
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="comments" className="mb-8">
              <TabsList>
                <TabsTrigger value="comments">Commentaires</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="attachments">Pièces jointes</TabsTrigger>
              </TabsList>
              <TabsContent value="comments">
                <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Commentaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="/avatars/01.png"/>
                          <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Alice Smith</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Pouvons-nous planifier une réunion pour discuter de la nouvelle direction du design ?
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 2 heures</p>
                        </div>
                      </div>
                      <Separator/>
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="/avatars/02.png"/>
                          <AvatarFallback>BJ</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Bob Johnson</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            J'ai préparé quelques maquettes initiales. Je les partagerai lors de notre prochaine
                            réunion.
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 5 heures</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <form className="w-full space-y-2">
                      <Textarea
                          placeholder="Tapez votre commentaire ici."
                          className="w-full"
                          value={currentCommentTemplate}
                          onChange={(e) => setCurrentCommentTemplate(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        {isTyping && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Quelqu'un est en train d'écrire...
                            </p>
                        )}
                        <div className="flex space-x-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Templates
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <Command>
                                <CommandInput placeholder="Rechercher un template..."/>
                                <CommandList>
                                  <CommandEmpty>Aucun template trouvé.</CommandEmpty>
                                  <CommandGroup heading="Templates">
                                    {commentTemplates.map((template, index) => (
                                        <CommandItem
                                            key={index}
                                            onSelect={() => setCurrentCommentTemplate(template)}
                                        >
                                          {template}
                                        </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm" className="cursor-pointer">
                              <PaperclipIcon className="h-4 w-4 mr-2"/>
                              Joindre un fichier
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                          </label>
                          <Button type="submit">Envoyer</Button>
                        </div>
                      </div>
                    </form>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="timeline">
                <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {timelineEvents.map((event, index) => (
                          <div key={event.id} className="mb-4 last:mb-0">
                            <div className="flex items-center mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={event.user.avatar} alt={event.user.name}/>
                                <AvatarFallback>{event.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="text-sm font-medium">{event.user.name}</p>
                                <p className="text-xs text-gray-500">{formatTimeAgo(event.timestamp)}</p>
                              </div>
                            </div>
                            <div className="pl-11">
                              <p className="text-sm">{event.content}</p>
                            </div>
                            {index < timelineEvents.length - 1 && (
                                <div className="absolute left-4 top-4 bottom-0 w-px bg-gray-200 dark:bg-gray-700"/>
                            )}
                          </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="attachments">
                <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Pièces jointes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {attachments.map(attachment => (
                          <div key={attachment.id} className="relative group">
                            {attachment.type === 'image' ? (
                                <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            ) : (
                                <div
                                    className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <FileIcon className="h-12 w-12 text-gray-400"/>
                                </div>
                            )}
                            <div
                                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <Button variant="secondary" size="sm">
                                Télécharger
                              </Button>
                            </div>
                            <p className="mt-2 text-sm font-medium truncate">{attachment.name}</p>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          <Modal title="Pull Requests associées">
            <div className="space-y-4">
              <div className="flex items-center">
                <GitPullRequestIcon className="mr-2 h-4 w-4 text-green-500"/>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Mise à jour de la palette de couleurs</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">#123 ouvert il y a 2 jours</p>
                </div>
              </div>
              <div className="flex items-center">
                <GitPullRequestIcon className="mr-2 h-4 w-4 text-yellow-500"/>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Refactorisation du composant de navigation</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">#124 ouvert il y a 1 jour</p>
                </div>
              </div>
            </div>
          </Modal>

          <Modal title="Activité">
            <div className="space-y-4">
              <div className="flex items-center">
                <MessageSquareIcon className="mr-2 h-4 w-4 text-blue-500"/>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Nouveau commentaire ajouté</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4 text-green-500"/>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Assigné changé pour John Doe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Il y a 1 jour</p>
                </div>
              </div>
              <div className="flex items-center">
                <GitPullRequestIcon className="mr-2 h-4 w-4 text-purple-500"/>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Pull request #124 lié</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Il y a 1 jour</p>
                </div>
              </div>
            </div>
          </Modal>

          <Modal title="Fichiers">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-blue-500"/>
                  <span className="text-sm">maquette_design.fig</span>
                </div>
                <Button variant="ghost" size="sm">Télécharger</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-green-500"/>
                  <span className="text-sm">exigences.docx</span>
                </div>
                <Button variant="ghost" size="sm">Télécharger</Button>
              </div>
            </div>
          </Modal>

          <Modal title="Raccourcis clavier">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Commenter</span>
                <kbd
                    className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl
                  + Enter</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Changer le statut</span>
                <kbd
                    className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Alt
                  + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Assigner à moi</span>
                <kbd
                    className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Alt
                  + A</kbd>
              </div>
            </div>
          </Modal>

          <Modal title="Métriques">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Interactions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-2xl font-bold">{timelineEvents.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total des événements</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-2xl font-bold">{timelineEvents.filter(e => e.type === 'comment').length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Commentaires</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Temps</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold">{timeSpent}h / {estimatedTime}h</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Temps passé / Temps estimé</p>
                  <Progress value={(timeSpent / estimatedTime) * 100} className="mt-2"/>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Activité récente</h3>
                <div className="space-y-2">
                  {timelineEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <ActivityIcon className="h-4 w-4 text-gray-500"/>
                        <span className="text-sm">{event.content}</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </TooltipProvider>
  )
}

export default TicketDetailPage