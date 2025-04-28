import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaCamera, FaChevronDown, FaChevronRight, FaInfoCircle, FaImage, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

// Mock data for IC database
const IC_DATABASE = {
  "555": {
    name: "555 Timer IC",
    description: "The 555 timer IC is an integrated circuit used in a variety of timer, pulse generation, and oscillator applications.",
    packages: ["DIP-8", "SOIC-8"],
    pinout: {
      "1": { name: "GND", description: "Ground (0V)" },
      "2": { name: "TRIG", description: "Trigger input" },
      "3": { name: "OUT", description: "Output" },
      "4": { name: "RESET", description: "Reset (active low)" },
      "5": { name: "CTRL", description: "Control voltage" },
      "6": { name: "THR", description: "Threshold input" },
      "7": { name: "DIS", description: "Discharge" },
      "8": { name: "VCC", description: "Supply voltage" }
    }
  },
  "741": {
    name: "741 Op-Amp IC",
    description: "The 741 is a general-purpose operational amplifier.",
    packages: ["DIP-8", "SOIC-8"],
    pinout: {
      "1": { name: "OFFSET NULL", description: "Offset null" },
      "2": { name: "IN-", description: "Inverting input" },
      "3": { name: "IN+", description: "Non-inverting input" },
      "4": { name: "V-", description: "Negative supply" },
      "5": { name: "OFFSET NULL", description: "Offset null" },
      "6": { name: "OUT", description: "Output" },
      "7": { name: "V+", description: "Positive supply" },
      "8": { name: "NC", description: "No connection" }
    }
  },
  "7404": {
    name: "7404 Hex Inverter (NOT Gate)",
    description: "The 7404 contains six independent NOT gates (inverters).",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1A", description: "Input 1" },
      "2": { name: "1Y", description: "Output 1" },
      "3": { name: "2A", description: "Input 2" },
      "4": { name: "2Y", description: "Output 2" },
      "5": { name: "3A", description: "Input 3" },
      "6": { name: "3Y", description: "Output 3" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "4Y", description: "Output 4" },
      "9": { name: "4A", description: "Input 4" },
      "10": { name: "5Y", description: "Output 5" },
      "11": { name: "5A", description: "Input 5" },
      "12": { name: "6Y", description: "Output 6" },
      "13": { name: "6A", description: "Input 6" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "7408": {
    name: "7408 Quad 2-input AND Gate",
    description: "The 7408 contains four independent 2-input AND gates.",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1A", description: "Input 1A" },
      "2": { name: "1B", description: "Input 1B" },
      "3": { name: "1Y", description: "Output 1" },
      "4": { name: "2A", description: "Input 2A" },
      "5": { name: "2B", description: "Input 2B" },
      "6": { name: "2Y", description: "Output 2" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "3Y", description: "Output 3" },
      "9": { name: "3A", description: "Input 3A" },
      "10": { name: "3B", description: "Input 3B" },
      "11": { name: "4Y", description: "Output 4" },
      "12": { name: "4A", description: "Input 4A" },
      "13": { name: "4B", description: "Input 4B" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "7432": {
    name: "7432 Quad 2-input OR Gate",
    description: "The 7432 contains four independent 2-input OR gates.",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1A", description: "Input 1A" },
      "2": { name: "1B", description: "Input 1B" },
      "3": { name: "1Y", description: "Output 1" },
      "4": { name: "2A", description: "Input 2A" },
      "5": { name: "2B", description: "Input 2B" },
      "6": { name: "2Y", description: "Output 2" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "3Y", description: "Output 3" },
      "9": { name: "3A", description: "Input 3A" },
      "10": { name: "3B", description: "Input 3B" },
      "11": { name: "4Y", description: "Output 4" },
      "12": { name: "4A", description: "Input 4A" },
      "13": { name: "4B", description: "Input 4B" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "7400": {
    name: "7400 Quad 2-input NAND Gate",
    description: "The 7400 contains four independent 2-input NAND gates.",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1A", description: "Input 1A" },
      "2": { name: "1B", description: "Input 1B" },
      "3": { name: "1Y", description: "Output 1" },
      "4": { name: "2A", description: "Input 2A" },
      "5": { name: "2B", description: "Input 2B" },
      "6": { name: "2Y", description: "Output 2" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "3Y", description: "Output 3" },
      "9": { name: "3A", description: "Input 3A" },
      "10": { name: "3B", description: "Input 3B" },
      "11": { name: "4Y", description: "Output 4" },
      "12": { name: "4A", description: "Input 4A" },
      "13": { name: "4B", description: "Input 4B" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "7402": {
    name: "7402 Quad 2-input NOR Gate",
    description: "The 7402 contains four independent 2-input NOR gates.",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1Y", description: "Output 1" },
      "2": { name: "1A", description: "Input 1A" },
      "3": { name: "1B", description: "Input 1B" },
      "4": { name: "2Y", description: "Output 2" },
      "5": { name: "2A", description: "Input 2A" },
      "6": { name: "2B", description: "Input 2B" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "3A", description: "Input 3A" },
      "9": { name: "3B", description: "Input 3B" },
      "10": { name: "3Y", description: "Output 3" },
      "11": { name: "4A", description: "Input 4A" },
      "12": { name: "4B", description: "Input 4B" },
      "13": { name: "4Y", description: "Output 4" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "7486": {
    name: "7486 Quad 2-input XOR Gate",
    description: "The 7486 contains four independent 2-input XOR gates.",
    packages: ["DIP-14", "SOIC-14"],
    pinout: {
      "1": { name: "1A", description: "Input 1A" },
      "2": { name: "1B", description: "Input 1B" },
      "3": { name: "1Y", description: "Output 1" },
      "4": { name: "2A", description: "Input 2A" },
      "5": { name: "2B", description: "Input 2B" },
      "6": { name: "2Y", description: "Output 2" },
      "7": { name: "GND", description: "Ground (0V)" },
      "8": { name: "3Y", description: "Output 3" },
      "9": { name: "3A", description: "Input 3A" },
      "10": { name: "3B", description: "Input 3B" },
      "11": { name: "4Y", description: "Output 4" },
      "12": { name: "4A", description: "Input 4A" },
      "13": { name: "4B", description: "Input 4B" },
      "14": { name: "VCC", description: "Supply voltage" }
    }
  },
  "lm358": {
    name: "LM358 Dual Op-Amp",
    description: "The LM358 consists of two independent, high gain, internally frequency compensated operational amplifiers.",
    packages: ["DIP-8", "SOIC-8"],
    pinout: {
      "1": { name: "OUT1", description: "Output 1" },
      "2": { name: "IN1-", description: "Inverting input 1" },
      "3": { name: "IN1+", description: "Non-inverting input 1" },
      "4": { name: "GND", description: "Ground (0V)" },
      "5": { name: "IN2+", description: "Non-inverting input 2" },
      "6": { name: "IN2-", description: "Inverting input 2" },
      "7": { name: "OUT2", description: "Output 2" },
      "8": { name: "VCC", description: "Supply voltage" }
    }
  },
  "atmega328p": {
    name: "ATmega328P Microcontroller",
    description: "8-bit AVR microcontroller commonly used in Arduino boards.",
    packages: ["DIP-28", "TQFP-32"],
    pinout: {
      "1": { name: "PC6/RESET", description: "Reset pin / Digital pin" },
      "2": { name: "PD0/RX", description: "Digital pin / UART RX" },
      "3": { name: "PD1/TX", description: "Digital pin / UART TX" },
      "7": { name: "VCC", description: "Supply voltage" },
      "8": { name: "GND", description: "Ground (0V)" },
      "9": { name: "PB6/XTAL1", description: "Crystal oscillator pin 1" },
      "10": { name: "PB7/XTAL2", description: "Crystal oscillator pin 2" },
      "19": { name: "AVCC", description: "Analog supply voltage" },
      "20": { name: "AREF", description: "Analog reference" },
      "23": { name: "PC0/A0", description: "Analog input A0" },
      "24": { name: "PC1/A1", description: "Analog input A1" },
      "25": { name: "PC2/A2", description: "Analog input A2" },
      "26": { name: "PC3/A3", description: "Analog input A3" },
      "27": { name: "PC4/A4/SDA", description: "Analog input A4 / I2C data" },
      "28": { name: "PC5/A5/SCL", description: "Analog input A5 / I2C clock" }
    }
  }
};

// Common categories for search
const IC_CATEGORIES = [
  "Timer",
  "Op-Amp",
  "Logic Gate",
  "Microcontroller",
  "Voltage Regulator",
  "Motor Driver",
  "Clock Generator",
  "ADC/DAC",
  "Amplifier",
  "Shift Register"
];

function ICFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIC, setSelectedIC] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const [focusedPin, setFocusedPin] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for passed search query from Home page
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      // Optionally trigger search automatically
      const foundIC = Object.entries(IC_DATABASE).find(([id, ic]) => {
        const query = location.state.searchQuery.toLowerCase();
        return id.toLowerCase().includes(query) || ic.name.toLowerCase().includes(query);
      });

      if (foundIC) {
        handleSelectIC(foundIC[0]);
      }
    }
  }, [location.state]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset selection when search changes
    setSelectedIC(null);
  };

  // Handle IC selection
  const handleSelectIC = (icId) => {
    setSelectedIC(IC_DATABASE[icId]);
    // Set default package
    if (IC_DATABASE[icId].packages && IC_DATABASE[icId].packages.length > 0) {
      setSelectedPackage(IC_DATABASE[icId].packages[0]);
    }
  };

  // Toggle camera mode
  const toggleCamera = () => {
    setShowCamera(!showCamera);
  };

  // Open file selector for image upload
  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  // Process uploaded image
  const processImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Here you would integrate with Gemini API for image analysis
    // For now, just show a placeholder message
    alert("Image processing with Gemini would happen here!");

    // Reset the input so the same file can be selected again
    e.target.value = null;
  };

  // Filter ICs based on search query
  const filteredICs = Object.entries(IC_DATABASE)
    .filter(([id, ic]) => {
      const query = searchQuery.toLowerCase();
      return (
        id.toLowerCase().includes(query) ||
        ic.name.toLowerCase().includes(query) ||
        ic.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full p-3 pl-10 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
          placeholder="Search for ICs by name or number..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-500" size={16} />

        <div className="absolute right-2 top-2 flex">
          <button
            onClick={handleImageUpload}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaImage size={16} />
          </button>
          <button
            onClick={toggleCamera}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaCamera size={16} />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={processImage}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Camera View (placeholder) */}
      {showCamera && (
        <div className="mb-4 rounded-lg bg-gray-200 dark:bg-gray-700 h-56 flex items-center justify-center relative">
          <p className="text-center text-gray-500">Camera access would be implemented here</p>
          <button
            onClick={() => setShowCamera(false)}
            className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white"
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {/* IC Categories */}
      <div className="mb- pb-2 overflow-x-auto">
        <div className="flex space-x-2 pb-1">
          {IC_CATEGORIES.map((category) => (
            <button
              key={category}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg whitespace-nowrap text-sm"
              onClick={() => setSearchQuery(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* IC List or IC Details */}
      {!selectedIC ? (
        <div className="space-y-2">
          {filteredICs.length > 0 ? (
            filteredICs.map(([id, ic]) => (
              <div
                key={id}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer"
                onClick={() => handleSelectIC(id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">{id}</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{ic.name}</span>
                  </div>
                  <FaChevronRight size={14} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {ic.description}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No ICs found. Try a different search term.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          {/* Back button */}
          <button
            className="mb-3 flex items-center text-blue-600 dark:text-blue-400"
            onClick={() => setSelectedIC(null)}
          >
            <FaChevronDown className="transform rotate-90 mr-1" size={14} />
            <span>Back to search</span>
          </button>

          {/* IC Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold">{selectedIC.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {selectedIC.description}
            </p>
          </div>

          {/* Package Selector */}
          {selectedIC.packages && selectedIC.packages.length > 0 && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Package:</label>
              <div className="flex space-x-2">
                {selectedIC.packages.map((pkg) => (
                  <button
                    key={pkg}
                    className={`px-3 py-1 rounded-lg border ${selectedPackage === pkg
                      ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200"
                      : "border-gray-300 dark:border-gray-700"
                      }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pinout Visualization */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Pinout Diagram</h3>
            <div className="flex justify-center">
              {selectedPackage && selectedPackage.includes("DIP") ? (
                <DipPackageVisualizer
                  pinout={selectedIC.pinout}
                  focusedPin={focusedPin}
                  setFocusedPin={setFocusedPin}
                />
              ) : (
                <SoicPackageVisualizer
                  pinout={selectedIC.pinout}
                  focusedPin={focusedPin}
                  setFocusedPin={setFocusedPin}
                />
              )}
            </div>
          </div>

          {/* Pin Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">Pin Information</h3>
            <div className="space-y-2">
              {Object.entries(selectedIC.pinout).map(([pin, info]) => (
                <div
                  key={pin}
                  className={`p-2 rounded-lg border ${focusedPin === pin
                    ? "bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-700"
                    : "border-gray-200 dark:border-gray-700"
                    }`}
                  onMouseEnter={() => setFocusedPin(pin)}
                  onMouseLeave={() => setFocusedPin(null)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">Pin {pin}</span>
                    <span className="font-bold">{info.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Datasheet Link (placeholder) */}
          <div className="mt-4 text-center">
            <button className="text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 mx-auto">
              <FaInfoCircle size={14} />
              <span>View Full Datasheet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// DIP Package Visualizer Component
function DipPackageVisualizer({ pinout, focusedPin, setFocusedPin }) {
  const pinCount = Object.keys(pinout).length;
  const pinsPerSide = Math.ceil(pinCount / 2);

  return (
    <div className="relative w-48 h-56">
      {/* IC Body */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-40 bg-gray-800 dark:bg-gray-900 rounded-lg">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-800 dark:bg-gray-900 rounded-full -mt-1"></div>
      </div>

      {/* Left side pins */}
      <div className="absolute left-4 top-4 space-y-3">
        {Array.from({ length: pinsPerSide }).map((_, index) => {
          const pinNumber = (index + 1).toString();
          const isHighlighted = focusedPin === pinNumber;

          return (
            <div
              key={`left-${index}`}
              className="relative"
              onMouseEnter={() => setFocusedPin(pinNumber)}
              onMouseLeave={() => setFocusedPin(null)}
            >
              <div
                className={`w-12 h-1.5 ${isHighlighted ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
              ></div>
              <div className="absolute -top-1.5 -left-4 text-xs font-medium">
                {pinNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right side pins */}
      <div className="absolute right-4 top-4 space-y-3">
        {Array.from({ length: pinsPerSide }).map((_, index) => {
          const pinNumber = (pinCount - index).toString();
          const isHighlighted = focusedPin === pinNumber;

          return (
            <div
              key={`right-${index}`}
              className="relative"
              onMouseEnter={() => setFocusedPin(pinNumber)}
              onMouseLeave={() => setFocusedPin(null)}
            >
              <div
                className={`w-12 h-1.5 ${isHighlighted ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
              ></div>
              <div className="absolute -top-1.5 -right-4 text-xs font-medium">
                {pinNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SOIC Package Visualizer Component
function SoicPackageVisualizer({ pinout, focusedPin, setFocusedPin }) {
  const pinCount = Object.keys(pinout).length;
  const pinsPerSide = Math.ceil(pinCount / 2);

  return (
    <div className="relative w-48 h-40">
      {/* IC Body */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-800 dark:bg-gray-900 rounded">
        {/* Dot marker */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Left side pins */}
      <div className="absolute left-4 top-6 space-y-2">
        {Array.from({ length: pinsPerSide }).map((_, index) => {
          const pinNumber = (index + 1).toString();
          const isHighlighted = focusedPin === pinNumber;

          return (
            <div
              key={`left-${index}`}
              className="relative"
              onMouseEnter={() => setFocusedPin(pinNumber)}
              onMouseLeave={() => setFocusedPin(null)}
            >
              <div
                className={`w-10 h-1 ${isHighlighted ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
              ></div>
              <div className="absolute -top-1.5 -left-4 text-xs font-medium">
                {pinNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right side pins */}
      <div className="absolute right-4 top-6 space-y-2">
        {Array.from({ length: pinsPerSide }).map((_, index) => {
          const pinNumber = (pinCount - index).toString();
          const isHighlighted = focusedPin === pinNumber;

          return (
            <div
              key={`right-${index}`}
              className="relative"
              onMouseEnter={() => setFocusedPin(pinNumber)}
              onMouseLeave={() => setFocusedPin(null)}
            >
              <div
                className={`w-10 h-1 ${isHighlighted ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
              ></div>
              <div className="absolute -top-1.5 -right-4 text-xs font-medium">
                {pinNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ICFinder;