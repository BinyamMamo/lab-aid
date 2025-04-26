import { useState, useRef } from 'react';
import { FaCamera, FaImage, FaRedo, FaSpinner } from 'react-icons/fa';

// Color constants for resistor bands
const COLORS = {
  black: { value: 0, multiplier: 1, tolerance: null, color: "bg-black", textColor: "text-white" },
  brown: { value: 1, multiplier: 10, tolerance: 1, color: "bg-amber-800", textColor: "text-white" },
  red: { value: 2, multiplier: 100, tolerance: 2, color: "bg-red-600", textColor: "text-white" },
  orange: { value: 3, multiplier: 1000, color: "bg-orange-500", textColor: "text-white" },
  yellow: { value: 4, multiplier: 10000, color: "bg-yellow-400" },
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
    <div className="mx-auto px-1">
      {/* Header with Tools and Band Selector */}
      <div className="w-full flex items-center justify-between gap-2 p-4 px-0">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setResistorType("4band")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${resistorType === "4band"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-700 hover:text-gray-900"
              }`}
          >
            4Band
          </button>
          <button
            onClick={() => setResistorType("5band")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${resistorType === "5band"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-700 hover:text-gray-900"
              }`}
          >
            5Band
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={showCamera ? stopCamera : startCamera}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${showCamera ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <FaCamera size={16} />
            {showCamera ? 'Stop' : 'Camera'}
          </button>

          <button
            onClick={handleImageUpload}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
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

          {/* <button
            onClick={resetValues}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <FaRedo size={14} />
          </button> */}
        </div>
      </div>

      {/* Camera View */}
      {showCamera && (
        <div className="mb-6 relative mx-4">
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-gray-100"
            playsInline
          />
          <button
            onClick={captureImage}
            disabled={isProcessing}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Capture'}
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Uploaded Image Preview */}
      {uploadedImage && !showCamera && (
        <div className="mx-4 mb-4 relative">
          <img
            src={uploadedImage}
            alt="Uploaded resistor"
            className="w-full rounded-lg object-contain max-h-48 bg-gray-50"
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
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
            >
              <FaRedo size={12} />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Sticky Section */}
      <div className="sticky top-0 bg-white shadow-lg z-10 pb-4 rounded-b-2xl">
        {/* Result Display */}
        <div className="text-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold mb-1">{resistorValue.formatted}</div>
          <div className="text-gray-600">{resistorValue.tolerance}</div>
        </div>

        {/* Resistor Visual */}
        <div className="px-4 flex justify-center">
          <div className="h-16 w-72 bg-amber-200 rounded-full relative shadow-lg">
            <div className={`absolute left-8 top-0 bottom-0 w-5 ${COLORS[bands.band1].color}`}></div>
            <div className={`absolute left-16 top-0 bottom-0 w-5 ${COLORS[bands.band2].color}`}></div>
            {resistorType === "4band" ? (
              <>
                <div className={`absolute left-24 top-0 bottom-0 w-5 ${COLORS[bands.band3].color}`}></div>
                <div className={`absolute right-12 top-0 bottom-0 w-5 ${COLORS[bands.band4].color}`}></div>
              </>
            ) : (
              <>
                <div className={`absolute left-24 top-0 bottom-0 w-5 ${COLORS[bands.band3].color}`}></div>
                <div className={`absolute left-32 top-0 bottom-0 w-5 ${COLORS[bands.band4].color}`}></div>
                <div className={`absolute right-12 top-0 bottom-0 w-5 ${bands.band5 ? COLORS[bands.band5].color : 'bg-gray-300 opacity-50'}`}></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Improved Color Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {/* <th className="p-3 text-left border-b font-medium">Color</th> */}
                <th className="p-3 text-center border-b font-medium">1st</th>
                <th className="p-3 text-center border-b font-medium">2nd</th>
                <th className="p-3 text-center border-b font-medium">{resistorType === '4band' ? 'Multiplier' : '3rd'}</th>
                {resistorType === '5band' && <th className="p-3 text-center border-b font-medium">Multiplier</th>}
                <th className="p-3 text-center border-b font-medium">Tolerance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(COLORS).map(([color, data]) => (
                <tr key={color} className={`hover:bg-opacity-85 transition-colors ${data.color} bg-opacity-90  ${data.textColor || ''}`}>
                  {/* <td className="p-3 border-b">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                    </div>
                  </td> */}
                  <td className="p-3 text-center border-b">
                    {data.value !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, band1: color })}
                        className={`px-3 py-1 rounded-full ${bands.band1 === color
                          ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                          : 'hover:bg-white hover:bg-opacity-20'
                          }`}
                      >
                        {data.value}
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-center border-b">
                    {data.value !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, band2: color })}
                        className={`px-3 py-1 rounded-full ${bands.band2 === color
                          ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                          : 'hover:bg-white hover:bg-opacity-20'
                          }`}
                      >
                        {data.value}
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-center border-b">
                    {resistorType === '4band' ? (
                      data.multiplier !== undefined && (
                        <button
                          onClick={() => setBands({ ...bands, band3: color })}
                          className={`px-3 py-1 rounded-full ${bands.band3 === color
                            ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                            : 'hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          ×{data.multiplier < 1 ? data.multiplier : formatMultiplier(data.multiplier)}
                        </button>
                      )
                    ) : (
                      data.value !== undefined && (
                        <button
                          onClick={() => setBands({ ...bands, band3: color })}
                          className={`px-3 py-1 rounded-full ${bands.band3 === color
                            ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                            : 'hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          {data.value}
                        </button>
                      )
                    )}
                  </td>
                  {resistorType === '5band' && (
                    <td className="p-3 text-center border-b">
                      {data.multiplier !== undefined && (
                        <button
                          onClick={() => setBands({ ...bands, band4: color })}
                          className={`px-3 py-1 rounded-full ${bands.band4 === color
                            ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                            : 'hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          ×{data.multiplier < 1 ? data.multiplier : formatMultiplier(data.multiplier)}
                        </button>
                      )}
                    </td>
                  )}
                  <td className="p-3 text-center border-b">
                    {data.tolerance !== undefined && (
                      <button
                        onClick={() => setBands({ ...bands, [resistorType === '4band' ? 'band4' : 'band5']: color })}
                        className={`px-3 py-1 rounded-full ${(resistorType === '4band' ? bands.band4 : bands.band5) === color
                          ? `bg-white bg-opacity-30 font-medium ring-2 ring-offset-1 ring-white`
                          : 'hover:bg-white hover:bg-opacity-20'
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
      </div>

      {/* Direction Hint */}
      <div className="mt-4 text-sm text-gray-500 text-center pb-4">
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