import { useState, useRef } from 'react';
import { FaSearch, FaCamera, FaImage, FaTimes, FaCalculator, FaMicrochip, FaBook, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TOOLS = [
  {
    id: 'resistor-tool',
    title: 'Resistor Tool',
    description: 'Decode resistor color codes and find values',
    icon: FaMicrochip,
    path: '/resistor-tool',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'ic-finder',
    title: 'IC Finder',
    description: 'Identify and learn about integrated circuits',
    icon: FaMicrochip,
    path: '/ic-finder',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'calculators',
    title: 'Calculators',
    description: 'Circuit calculators for various components',
    icon: FaCalculator,
    path: '/calculators',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'datasheets',
    title: 'Datasheets',
    description: 'Access component datasheets',
    icon: FaFileAlt,
    path: '/datasheets',
    color: 'bg-purple-100 text-purple-600'
  },
  // {
  //   id: 'tutorials',
  //   title: 'Tutorials',
  //   description: 'Learn electronics concepts',
  //   icon: FaBook,
  //   path: '/tutorials',
  //   color: 'bg-red-100 text-red-600'
  // }
];

const SAMPLE_TAGS = [
  // 'Resistor color code',
  // 'Calculators',
  // 'Scan IC',
  'Ohm\'s Law',
  '555 Timer',
  'Op-Amp',
  'Logic Gates'
];

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();

    // Check for specific tool keywords
    if (lowerQuery.includes('resistor') || lowerQuery.includes('color code')) {
      navigate('/resistor-tool');
    } else if (lowerQuery.includes('ic') || lowerQuery.includes('integrated circuit') || /\b(74[a-z]*\d+|ne555|lm[0-9]+)\b/i.test(lowerQuery)) {
      navigate('/ic-finder', { state: { searchQuery: query } });
    } else if (lowerQuery.includes('calc') || lowerQuery.includes('ohm')) {
      navigate('/calculators');
    } else if (lowerQuery.includes('datasheet')) {
      navigate('/datasheets');
    } else if (lowerQuery.includes('tutorial') || lowerQuery.includes('learn')) {
      navigate('/tutorials');
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const processUploadedImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      processImageWithGemini(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setUploadedImage(imageData);
      processImageWithGemini(imageData);
      stopCamera();
    }
  };

  const processImageWithGemini = async (imageBase64) => {
    setIsProcessing(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this electronic component image and identify what it is. Provide details about its function, specifications, and common uses. If it's a resistor, identify the color bands. If it's an IC, identify the part number and type. Format your response as JSON with fields: type, name, description, specifications."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 512,
          }
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const responseText = data.candidates[0].content.parts[0].text;
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            setAnalysisResult(result);

            // Navigate based on component type
            if (result.type.toLowerCase().includes('resistor')) {
              navigate('/resistor-tool');
            } else if (result.type.toLowerCase().includes('ic') || result.type.toLowerCase().includes('integrated circuit')) {
              navigate('/ic-finder', { state: { searchQuery: result.name || result.specifications?.partNumber } });
            }
          } else {
            setAnalysisResult({ description: responseText });
          }
        } catch (parseError) {
          setAnalysisResult({ description: responseText });
        }
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to analyze component. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      {/* Search Section */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            className="w-full p-4 pl-12 pr-24 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-lg"
            placeholder="Search components, tools, calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <FaSearch className="absolute left-4 top-5 text-gray-500" size={20} />

          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={handleImageUpload}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaImage size={20} />
            </button>
            <button
              onClick={showCamera ? stopCamera : startCamera}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaCamera size={20} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={processUploadedImage}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Camera View */}
      {showCamera && (
        <div className="mb-6 relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-gray-100"
            playsInline
          />
          <button
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Capture
          </button>
          <button
            onClick={stopCamera}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <FaTimes size={16} />
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Uploaded Image Preview */}
      {uploadedImage && !showCamera && (
        <div className="mb-6 relative">
          <img
            src={uploadedImage}
            alt="Uploaded component"
            className="w-full rounded-lg object-contain max-h-48 bg-gray-50"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-white">Analyzing...</div>
            </div>
          )}
          <button
            onClick={() => {
              setUploadedImage(null);
              setAnalysisResult(null);
            }}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <FaTimes size={16} />
          </button>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Component Analysis</h3>
          {analysisResult.type && <p><strong>Type:</strong> {analysisResult.type}</p>}
          {analysisResult.name && <p><strong>Name:</strong> {analysisResult.name}</p>}
          {analysisResult.description && <p><strong>Description:</strong> {analysisResult.description}</p>}
          {analysisResult.specifications && (
            <div className="mt-2">
              <strong>Specifications:</strong>
              <pre className="mt-1 text-sm overflow-x-auto">{JSON.stringify(analysisResult.specifications, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.path)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className={`p-3 rounded-lg inline-block mb-2 ${tool.color}`}>
              <tool.icon size={24} />
            </div>
            <h3 className="font-bold mb-1">{tool.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;