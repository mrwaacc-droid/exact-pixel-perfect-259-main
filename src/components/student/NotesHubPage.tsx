import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Trash2,
  Download,
  Share2,
  Tag,
  Calendar,
  BookOpen,
  Filter,
  MoreVertical,
  Edit,
  Archive,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Note {
  id: string;
  title: string;
  body: string;
  courseTitle: string;
  lessonTitle: string;
  createdAt: string;
  tags: string[];
  isBoardExport: boolean;
}

export function NotesHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "recent" | "archived">("all");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Quadratic Equations: Key Concepts",
      body: "Quadratic form: ax² + bx + c = 0 where a ≠ 0\nFactoring method: Find two numbers that multiply to c and add to b",
      courseTitle: "Mathematics Form 2",
      lessonTitle: "Quadratic Equations",
      createdAt: "2 hours ago",
      tags: ["math", "quadratics", "equations"],
      isBoardExport: false,
    },
    {
      id: "2",
      title: "Board Export: Worked Example",
      body: "x² - 5x + 6 = 0\nFactored: (x - 2)(x - 3) = 0\nSolutions: x = 2 or x = 3",
      courseTitle: "Mathematics Form 2",
      lessonTitle: "Quadratic Equations",
      createdAt: "2 hours ago",
      tags: ["math", "examples", "board"],
      isBoardExport: true,
    },
  ]);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (confirm("Delete this note?")) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleArchive = (id: string) => {
    // Archive note
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes Hub</h1>
              <p className="text-gray-600 mt-1">
                {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link to="/classroom">
              <Button className="bg-[#7D2233] hover:bg-[#521326]">
                <Plus size={16} />
                New Note
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D2233]"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "recent", "archived"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === filter
                      ? "bg-[#7D2233] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Filter size={16} className="inline mr-2" />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600 mb-6">
                Start taking notes during your lessons or export your board
              </p>
              <Link to="/classroom">
                <Button className="bg-[#7D2233] hover:bg-[#521326]">Start a Lesson</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#7D2233] transition-colors">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              {note.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {note.createdAt}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <Download size={16} className="text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <Share2 size={16} className="text-gray-600" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical size={16} className="text-gray-600" />
                            </button>
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Edit size={14} />
                                Edit
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Archive size={14} />
                                Archive
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{note.body}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {note.isBoardExport && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <BookOpen size={12} />
                            Board Export
                          </span>
                        )}
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="text-gray-300 flex-shrink-0 mt-1" size={20} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Collections Preview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Organize by Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Mathematics Form 2", "Physics Basics", "Chemistry Revision"].map((course) => (
              <Card key={course} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course}</h3>
                      <p className="text-sm text-gray-600 mt-1">12 notes</p>
                    </div>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
