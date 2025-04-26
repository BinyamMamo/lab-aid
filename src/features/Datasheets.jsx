import { useState, useRef } from 'react';
import { FaSearch, FaDownload, FaStar, FaClock, FaBook, FaChevronDown } from 'react-icons/fa';

// Mock data for datasheets
const DATASHEET_LIST = [
  {
    id: "ne555",
    name: "NE555 Timer IC",
    manufacturer: "Texas Instruments",
    category: "Timer",
    starred: true,
    recentlyViewed: true,
    fileSize: "1.2 MB"
  },
  {
    id: "lm741",
    name: "LM741 Operational Amplifier",
    manufacturer: "Texas Instruments",
    category: "Op-Amp",
    starred: false,
    recentlyViewed: true,
    fileSize: "843 KB"
  },
  {
    id: "atmega328p",
    name: "ATmega328P Microcontroller",
    manufacturer: "Microchip",
    category: "Microcontroller",
    starred: true,
    recentlyViewed: false,
    fileSize: "3.8 MB"
  },
  {
    id: "lm358",
    name: "LM358 Dual Op-Amp",
    manufacturer: "Texas Instruments",
    category: "Op-Amp",
    starred: false,
    recentlyViewed: false,
    fileSize: "912 KB"
  },
  {
    id: "7404",
    name: "7404 Hex Inverter",
    manufacturer: "Texas Instruments",
    category: "Logic",
    starred: false,
    recentlyViewed: true,
    fileSize: "652 KB"
  },
  {
    id: "2n2222",
    name: "2N2222 NPN Transistor",
    manufacturer: "ON Semiconductor",
    category: "Transistor",
    starred: true,
    recentlyViewed: false,
    fileSize: "421 KB"
  },
  {
    id: "l7805",
    name: "L7805 Voltage Regulator",
    manufacturer: "STMicroelectronics",
    category: "Regulator",
    starred: false,
    recentlyViewed: false,
    fileSize: "756 KB"
  },
  {
    id: "lm386",
    name: "LM386 Audio Amplifier",
    manufacturer: "Texas Instruments",
    category: "Amplifier",
    starred: false,
    recentlyViewed: false,
    fileSize: "1.1 MB"
  }
];

const DATASHEET_CATEGORIES = [
  "All",
  "Timer",
  "Op-Amp",
  "Microcontroller",
  "Logic",
  "Transistor",
  "Regulator",
  "Amplifier"
];

function Datasheets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [starredItems, setStarredItems] = useState(
    DATASHEET_LIST.filter(item => item.starred).map(item => item.id)
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

  // Filter datasheets based on search query, tab, and category
  const filteredDatasheets = DATASHEET_LIST.filter(datasheet => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!datasheet.name.toLowerCase().includes(query) &&
        !datasheet.manufacturer.toLowerCase().includes(query) &&
        !datasheet.category.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Apply tab filter
    if (activeTab === "starred" && !starredItems.includes(datasheet.id)) {
      return false;
    }

    if (activeTab === "recent" && !datasheet.recentlyViewed) {
      return false;
    }

    // Apply category filter
    if (activeCategory !== "All" && datasheet.category !== activeCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Datasheets</h2>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
          placeholder="Search for components..."
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
          <span>Starred</span>
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-1 ${activeTab === "recent"
            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
            : "text-gray-500 dark:text-gray-400"
            }`}
          onClick={() => setActiveTab("recent")}
        >
          <FaClock size={14} />
          <span>Recent</span>
        </button>
      </div>

      {/* Categories */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 pb-1">
          {DATASHEET_CATEGORIES.map((category) => (
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

      {/* Datasheet List */}
      {filteredDatasheets.length > 0 ? (
        <div className="space-y-2">
          {filteredDatasheets.map(datasheet => (
            <div
              key={datasheet.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center"
            >
              <div className="mr-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <FaBook size={18} className="text-gray-600 dark:text-gray-400" />
              </div>

              <div className="flex-1">
                <div className="font-medium">{datasheet.name}</div>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <span>{datasheet.manufacturer}</span>
                  <span className="mx-1">•</span>
                  <span>{datasheet.category}</span>
                  <span className="mx-1">•</span>
                  <span>{datasheet.fileSize}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  className={`p-2 rounded-full ${starredItems.includes(datasheet.id)
                    ? "text-yellow-500"
                    : "text-gray-400 dark:text-gray-600"
                    }`}
                  onClick={() => toggleStar(datasheet.id)}
                >
                  <FaStar size={16} />
                </button>

                <button className="p-2 text-blue-600 dark:text-blue-400 rounded-full">
                  <FaDownload size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <SearchIcon size={48} className="mx-auto mb-2 opacity-30" />
          <p>No datasheets found matching your criteria.</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}

// Search Icon for empty state
function SearchIcon({ className, size }) {
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
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

export default Datasheets;