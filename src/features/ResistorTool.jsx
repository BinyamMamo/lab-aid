import { useState, useRef } from 'react';
import { FaCamera, FaImage, FaRedo, FaSpinner } from 'react-icons/fa';

// Color constants for resistor bands
const COLORS = {
  black: { value: 0, multiplier: 1, tolerance: null, color: "bg-black", textColor: "text-white" },
  brown: { value: 1, multiplier: 10, tolerance: 1, color: "bg-amber-800", textColor: "text-white" },
  red: { value: 2, multiplier: 100, tolerance: 2, color: "bg-red-600", textColor: "text-white" },
  orange: { value: 3, multiplier: 1000, color: "bg-orange-500", textColor: "text-white" },
  yellow: { value: 4, multiplier: 10000, color: "bg-yellow-400", textColor: "text-gray-900" },
  green: { value: 5, multiplier: 100000, tolerance: 0.5, color: "bg-green-600", textColor: "text-white" },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25, color: "bg-blue-600", textColor: "text-white" },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1, color: "bg-purple-600", textColor: "text-white" },
  grey: { value: 8, multiplier: 100000000, tolerance: 0.05, color: "bg-gray-500", textColor: "text-white" },
  white: { value: 9, multiplier: 1000000000, color: "bg-white", textColor: "text-black" },
  gold: { multiplier: 0.1, tolerance: 5, color: "bg-yellow-600", textColor: "text-white" },
  silver: { multiplier: 0.01, tolerance: 10, color: "bg-gray-300", textColor: "text-black" }
};

function ResistorTool() {
  const [bands, setBands] = useState({
    band1: "brown",
    band2: "black",
    band3: "red",
    band4: "gold",
    band5: "brown",
  });
  const [resistorType, setResistorType] = useState("4band");
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Calculate resistor value based on band colors
  const calculateResistorValue = () => {
    if (resistorType === "4band") {
      const firstDigit = COLORS[bands.band1].value;
      const secondDigit = COLORS[bands.band2].value;
      const multiplier = COLORS[bands.band3].multiplier;
      const tolerance = COLORS[bands.band4].tolerance;

      const value = (firstDigit * 10 + secondDigit) * multiplier;
      return {
        value,
        tolerance: tolerance ? `±${tolerance}%` : "±20%",
        formatted: formatResistorValue(value)
      };
    } else if (resistorType === "5band") {
      const firstDigit = COLORS[bands.band1].value;
      const secondDigit = COLORS[bands.band2].value;
      const thirdDigit = COLORS[bands.band3].value;
      const multiplier = COLORS[bands.band4].multiplier;
      const tolerance = COLORS[bands.band5]?.tolerance;

      const value = (firstDigit * 100 + secondDigit * 10 + thirdDigit) * multiplier;
      return {
        value,
        tolerance: tolerance ? `±${tolerance}%` : "±20%",
        formatted: formatResistorValue(value)
      };
    }
  };

  // Format resistor value to human readable format
  const formatResistorValue = (value) => {
    if (value >= 1000000) {
      const megaValue = value / 1000000;
      return `${Number.isInteger(megaValue) ? megaValue : megaValue.toFixed(2)}MΩ`;
    } else if (value >= 1000) {
      const kiloValue = value / 1000;
      return `${Number.isInteger(kiloValue) ? kiloValue : kiloValue.toFixed(2)}kΩ`;
    } else {
      return `${value}Ω`;
    }
  };

  // Process image with Gemini API
  const processImageWithGemini = async (imageBase64) => {
    setIsProcessing(true);
    setError(null);

    try {
      // For Vite, use import.meta.env
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
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
                text: "Analyze this resistor image and identify the band colors. Return ONLY a JSON object with format: {\"band1\": \"color\", \"band2\": \"color\", \"band3\": \"color\", \"band4\": \"color\", \"band5\": \"color\"} or null for any band that doesn't exist. Use only these color names: black, brown, red, orange, yellow, green, blue, violet, grey, white, gold, silver"
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
            maxOutputTokens: 256,
          }
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const responseText = data.candidates[0].content.parts[0].text;
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const colors = JSON.parse(jsonMatch[0]);

          // Update bands based on detected colors
          const newBands = { ...bands };
          let detectedType = '4band';

          if (colors.band5 && colors.band5 !== null) {
            detectedType = '5band';
          }

          setResistorType(detectedType);

          Object.keys(colors).forEach(band => {
            if (colors[band] && COLORS[colors[band]]) {
              newBands[band] = colors[band];
            }
          });

          setBands(newBands);
        } else {
          throw new Error("Could not parse color detection response");
        }
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to detect resistor colors. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setError(null);
  };

  const resetValues = () => {
    setBands({
      band1: "brown",
      band2: "black",
      band3: "red",
      band4: "gold",
      band5: "brown",
    });
    setError(null);
    setUploadedImage(null);
  };

  const resistorValue = calculateResistorValue();

  return (
    <div className=" px-2">
      {/* Header with Tools and Band Selector */}
      <div className="w-full flex items-center justify-between gap-3 my-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setResistorType("4band")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${resistorType === "4band"
              ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            4Band
          </button>
          <button
            onClick={() => setResistorType("5band")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${resistorType === "5band"
              ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            5Band
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={showCamera ? stopCamera : startCamera}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${showCamera ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <FaCamera size={16} />
            {showCamera ? 'Stop' : 'Camera'}
          </button>

          <button
            onClick={handleImageUpload}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FaImage size={16} />
            Upload
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={processUploadedImage}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Camera View */}
      {showCamera && (
        <div className="mb-6 relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-gray-100 dark:bg-gray-800"
            playsInline
          />
          <button
            onClick={captureImage}
            disabled={isProcessing}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Capture'}
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Uploaded Image Preview */}
      {uploadedImage && !showCamera && (
        <div className="mb-4 relative">
          <img
            src={uploadedImage}
            alt="Uploaded resistor"
            className="w-full rounded-lg object-contain max-h-48 bg-gray-50 dark:bg-gray-800"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-3 text-white">
                <FaSpinner className="animate-spin" />
                <span>Analyzing resistor...</span>
              </div>
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={clearUploadedImage}
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            >
              <FaRedo size={12} />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg z-10 mb-6 rounded-2xl overflow-hidden">
        {/* Result Display */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{resistorValue.formatted}</div>
          <div className="text-lg text-gray-600 dark:text-gray-300">{resistorValue.tolerance}</div>
        </div>

        {/* Resistor Visual */}
        <div className="p-6 flex justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-16 w-72 bg-amber-200 dark:bg-amber-600 rounded-full relative shadow-lg">
            <div className={`absolute left-8 top-0 bottom-0 w-5 ${COLORS[bands.band1].color} rounded-l-full`}></div>
            <div className={`absolute left-16 top-0 bottom-0 w-5 ${COLORS[bands.band2].color}`}></div>
            {resistorType === "4band" ? (
              <>
                <div className={`absolute left-24 top-0 bottom-0 w-5 ${COLORS[bands.band3].color}`}></div>
                <div className={`absolute right-12 top-0 bottom-0 w-5 ${COLORS[bands.band4].color} rounded-r-full`}></div>
              </>
            ) : (
              <>
                <div className={`absolute left-24 top-0 bottom-0 w-5 ${COLORS[bands.band3].color}`}></div>
                <div className={`absolute left-32 top-0 bottom-0 w-5 ${COLORS[bands.band4].color}`}></div>
                  <div className={`absolute right-12 top-0 bottom-0 w-5 ${bands.band5 ? COLORS[bands.band5].color : 'bg-gray-300 dark:bg-gray-600 opacity-50'} rounded-r-full`}></div>
              </>
            )}
            {/* Wire leads */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-8 w-8 h-1 bg-gray-400 dark:bg-gray-500"></div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-8 h-1 bg-gray-400 dark:bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Color Selection Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <h3 className="p-3 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300">Select Band Colors</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-xs sm:text-sm">
              <th className="px-2 py-3 text-center font-medium w-1/12">Color</th>
              <th className="px-2 py-3 text-center font-medium w-1/6">1st</th>
              <th className="px-2 py-3 text-center font-medium w-1/6">2nd</th>
              <th className="px-2 py-3 text-center font-medium w-1/6">{resistorType === '4band' ? 'Mult' : '3rd'}</th>
              {resistorType === '5band' && <th className="px-2 py-3 text-center font-medium w-1/6">Mult</th>}
              <th className="px-2 py-3 text-center font-medium w-1/6">Tol</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(COLORS).map(([color, data]) => (
              <tr key={color} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-2">
                  <div className={`w-8 h-4 rounded ${data.color} mx-auto`} title={color}></div>
                </td>
                <td className="px-2 py-2 text-center">
                  {data.value !== undefined && (
                    <button
                      onClick={() => setBands({ ...bands, band1: color })}
                      className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${bands.band1 === color
                        ? `${data.color} ${data.textColor || ''} font-medium`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {data.value}
                    </button>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  {data.value !== undefined && (
                    <button
                      onClick={() => setBands({ ...bands, band2: color })}
                      className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${bands.band2 === color
                        ? `${data.color} ${data.textColor || ''} font-medium`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {data.value}
                    </button>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  {resistorType === '4band' ? (
                    data.multiplier !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, band3: color })}
                        className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${bands.band3 === color
                          ? `${data.color} ${data.textColor || ''} font-medium`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        ×{data.multiplier < 1 ? data.multiplier : formatMultiplier(data.multiplier)}
                      </button>
                    )
                  ) : (
                    data.value !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, band3: color })}
                        className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${bands.band3 === color
                          ? `${data.color} ${data.textColor || ''} font-medium`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        {data.value}
                      </button>
                    )
                  )}
                </td>
                {resistorType === '5band' && (
                  <td className="px-2 py-2 text-center">
                    {data.multiplier !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, band4: color })}
                        className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${bands.band4 === color
                          ? `${data.color} ${data.textColor || ''} font-medium`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        ×{data.multiplier < 1 ? data.multiplier : formatMultiplier(data.multiplier)}
                      </button>
                    )}
                  </td>
                )}
                <td className="px-2 py-2 text-center">
                  {data.tolerance !== undefined && (
                    <button
                      onClick={() => setBands({ ...bands, [resistorType === '4band' ? 'band4' : 'band5']: color })}
                      className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors ${(resistorType === '4band' ? bands.band4 : bands.band5) === color
                        ? `${data.color} ${data.textColor || ''} font-medium`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      ±{data.tolerance}%
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Direction Hint */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center pb-4">
        Tip: Start from the side with bands grouped closer together
      </div>
    </div>
  );
}

// Helper function to format multipliers
function formatMultiplier(multiplier) {
  if (multiplier >= 1000000000) return '1G';
  if (multiplier >= 1000000) return (multiplier / 1000000) + 'M';
  if (multiplier >= 1000) return (multiplier / 1000) + 'k';
  return multiplier;
}

export default ResistorTool;