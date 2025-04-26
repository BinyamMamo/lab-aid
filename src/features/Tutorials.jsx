import { useState } from 'react';
import { FaSearch, FaPlay, FaBook, FaArrowRight, FaStar, FaChevronDown, FaClock } from 'react-icons/fa';

// Mock data for tutorials
const TUTORIALS_LIST = [
  {
    id: "resistor-basics",
    title: "Resistor Basics: How to Read and Use Them",
    category: "Basics",
    duration: "5 min read",
    difficulty: "Beginner",
    starred: true,
    type: "article"
  },
  {
    id: "oscilloscope-tutorial",
    title: "Using an Oscilloscope in Circuit Analysis",
    category: "Lab Equipment",
    duration: "8 min video",
    difficulty: "Intermediate",
    starred: false,
    type: "video"
  },
  {
    id: "breadboard-wiring",
    title: "Breadboard Wiring Techniques",
    category: "Basics",
    duration: "4 min read",
    difficulty: "Beginner",
    starred: true,
    type: "article"
  },
  {
    id: "op-amp-circuits",
    title: "Common Op-Amp Circuit Configurations",
    category: "Components",
    duration: "10 min read",
    difficulty: "Intermediate",
    starred: false,
    type: "article"
  },
  {
    id: "multimeter-guide",
    title: "Complete Guide to Using a Multimeter",
    category: "Lab Equipment",
    duration: "12 min video",
    difficulty: "Beginner",
    starred: false,
    type: "video"
  },
  {
    id: "555-timer-projects",
    title: "5 Beginner Projects with 555 Timer IC",
    category: "Projects",
    duration: "15 min read",
    difficulty: "Beginner",
    starred: true,
    type: "article"
  },
  {
    id: "led-circuits",
    title: "LED Circuit Design: Current Limiting and More",
    category: "Components",
    duration: "7 min read",
    difficulty: "Beginner",
    starred: false,
    type: "article"
  },
  {
    id: "troubleshooting",
    title: "Circuit Troubleshooting Techniques",
    category: "Advanced",
    duration: "9 min video",
    difficulty: "Advanced",
    starred: false,
    type: "video"
  }
];

const TUTORIAL_CATEGORIES = [
  "All",
  "Basics",
  "Components",
  "Lab Equipment",
  "Projects",
  "Advanced"
];

const DIFFICULTY_LEVELS = [
  "All Levels",
  "Beginner",
  "Intermediate",
  "Advanced"
];

function Tutorials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All Levels");
  const [starredItems, setStarredItems] = useState(
    TUTORIALS_LIST.filter(item => item.starred).map(item => item.id)
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle starred status
  const toggleStar = (id) => {
    if (starredItems.includes(id)) {
      setStarredItems(starredItems.filter(itemId => itemId !== id));
    } else {
      setStarredItems([...starredItems, id]);
    }
  };

  // Filter tutorials based on search query, tab, category, and difficulty
  const filteredTutorials = TUTORIALS_LIST.filter(tutorial => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!tutorial.title.toLowerCase().includes(query) &&
        !tutorial.category.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Apply tab filter
    if (activeTab === "starred" && !starredItems.includes(tutorial.id)) {
      return false;
    }

    // Apply category filter
    if (activeCategory !== "All" && tutorial.category !== activeCategory) {
      return false;
    }

    // Apply difficulty filter
    if (difficultyFilter !== "All Levels" && tutorial.difficulty !== difficultyFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tutorials & Guides</h2>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
          placeholder="Search tutorials..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-500" size={16} />
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "all"
            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
            : "text-gray-500 dark:text-gray-400"
            }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-1 ${activeTab === "starred"
            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
            : "text-gray-500 dark:text-gray-400"
            }`}
          onClick={() => setActiveTab("starred")}
        >
          <FaStar size={14} />
          <span>Saved</span>
        </button>
      </div>

      {/* Categories */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 pb-1">
          {TUTORIAL_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm ${activeCategory === category
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-200 dark:bg-gray-700"
                }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="relative mb-4">
        <select
          className="w-full rounded-lg border border-gray-300 p-2 pr-8 bg-white dark:bg-gray-800 dark:border-gray-700 appearance-none"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          {DIFFICULTY_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <FaChevronDown className="absolute right-2 top-3 text-gray-500" size={16} />
      </div>

      {/* Tutorials List */}
      {filteredTutorials.length > 0 ? (
        <div className="space-y-3">
          {filteredTutorials.map(tutorial => (
            <div
              key={tutorial.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="flex items-center mb-2">
                <div className={`mr-3 p-2 rounded ${tutorial.type === 'video'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                  {tutorial.type === 'video' ? <FaPlay size={16} /> : <FaBook size={16} />}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{tutorial.title}</h3>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <span>{tutorial.category}</span>
                    <span className="mx-1">•</span>
                    <span>{tutorial.duration}</span>
                    <span className="mx-1">•</span>
                    <span>{tutorial.difficulty}</span>
                  </div>
                </div>

                <button
                  className={`p-2 rounded-full ${starredItems.includes(tutorial.id)
                    ? "text-yellow-500"
                    : "text-gray-400 dark:text-gray-600"
                    }`}
                  onClick={() => toggleStar(tutorial.id)}
                >
                  <FaStar size={16} />
                </button>
              </div>

              <button className="w-full mt-1 text-blue-600 dark:text-blue-400 text-sm text-right flex items-center justify-end">
                <span>Read more</span>
                <FaArrowRight size={14} className="ml-1" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <EmptyIcon size={48} className="mx-auto mb-2 opacity-30" />
          <p>No tutorials found matching your criteria.</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}

// Empty state icon
function EmptyIcon({ className, size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

export default Tutorials;