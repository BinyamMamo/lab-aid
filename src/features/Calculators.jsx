import { useState, useEffect } from 'react';
import { FaCalculator, FaArrowRight, FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';

function Calculators() {
  const [calculatorType, setCalculatorType] = useState("ohmsLaw");

  // Render the selected calculator
  const renderCalculator = () => {
    switch (calculatorType) {
      case "ohmsLaw":
        return <OhmsLawCalculator />;
      case "resistorParallel":
        return <ResistorParallelCalculator />;
      case "resistorSeries":
        return <ResistorSeriesCalculator />;
      case "ledResistor":
        return <LedResistorCalculator />;
      case "capacitorReactance":
        return <CapacitorReactanceCalculator />;
      case "inductorReactance":
        return <InductorReactanceCalculator />;
      case "timer555":
        return <Timer555Calculator />;
      default:
        return <OhmsLawCalculator />;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Circuit Calculators</h2>

      {/* Calculator Type Selector */}
      <div className="relative mb-6">
        <select
          className="w-full rounded-lg border border-gray-300 p-3 pr-8 bg-white dark:bg-gray-800 dark:border-gray-700 appearance-none"
          value={calculatorType}
          onChange={(e) => setCalculatorType(e.target.value)}
        >
          <option value="ohmsLaw">Ohm's Law</option>
          <option value="resistorParallel">Resistors in Parallel</option>
          <option value="resistorSeries">Resistors in Series</option>
          <option value="ledResistor">LED Resistor Calculator</option>
          <option value="capacitorReactance">Capacitor Reactance</option>
          <option value="inductorReactance">Inductor Reactance</option>
          <option value="timer555">555 Timer Calculator</option>
        </select>
        <FaChevronDown className="absolute right-3 top-4 text-gray-500" size={16} />
      </div>

      {/* Render the selected calculator */}
      {renderCalculator()}
    </div>
  );
}

function OhmsLawCalculator() {
  const [values, setValues] = useState({
    voltage: "",
    current: "",
    resistance: "",
    power: ""
  });

  const [solveFor, setSolveFor] = useState("resistance");

  useEffect(() => {
    calculate();
  }, [values, solveFor]);

  const calculate = () => {
    const v = parseFloat(values.voltage);
    const i = parseFloat(values.current);
    const r = parseFloat(values.resistance);
    const p = parseFloat(values.power);

    let newValues = { ...values };

    switch (solveFor) {
      case "voltage":
        if (!isNaN(i) && !isNaN(r)) {
          newValues.voltage = (i * r).toFixed(2);
          newValues.power = (i * i * r).toFixed(2);
        } else if (!isNaN(p) && !isNaN(r)) {
          newValues.voltage = Math.sqrt(p * r).toFixed(2);
          newValues.current = (Math.sqrt(p / r)).toFixed(2);
        } else if (!isNaN(p) && !isNaN(i)) {
          newValues.voltage = (p / i).toFixed(2);
          newValues.resistance = (p / (i * i)).toFixed(2);
        }
        break;

      case "current":
        if (!isNaN(v) && !isNaN(r)) {
          newValues.current = (v / r).toFixed(2);
          newValues.power = (v * v / r).toFixed(2);
        } else if (!isNaN(p) && !isNaN(r)) {
          newValues.current = Math.sqrt(p / r).toFixed(2);
          newValues.voltage = Math.sqrt(p * r).toFixed(2);
        } else if (!isNaN(p) && !isNaN(v)) {
          newValues.current = (p / v).toFixed(2);
          newValues.resistance = (v * v / p).toFixed(2);
        }
        break;

      case "resistance":
        if (!isNaN(v) && !isNaN(i)) {
          newValues.resistance = (v / i).toFixed(2);
          newValues.power = (v * i).toFixed(2);
        } else if (!isNaN(p) && !isNaN(i)) {
          newValues.resistance = (p / (i * i)).toFixed(2);
          newValues.voltage = (p / i).toFixed(2);
        } else if (!isNaN(p) && !isNaN(v)) {
          newValues.resistance = (v * v / p).toFixed(2);
          newValues.current = (p / v).toFixed(2);
        }
        break;

      case "power":
        if (!isNaN(v) && !isNaN(i)) {
          newValues.power = (v * i).toFixed(2);
          newValues.resistance = (v / i).toFixed(2);
        } else if (!isNaN(v) && !isNaN(r)) {
          newValues.power = (v * v / r).toFixed(2);
          newValues.current = (v / r).toFixed(2);
        } else if (!isNaN(i) && !isNaN(r)) {
          newValues.power = (i * i * r).toFixed(2);
          newValues.voltage = (i * r).toFixed(2);
        }
        break;
    }

    setValues(newValues);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Solve for:</label>
        <div className="grid grid-cols-2 gap-2">
          {["voltage", "current", "resistance", "power"].map((option) => (
            <button
              key={option}
              className={`p-2 rounded-lg border ${solveFor === option
                ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200"
                : "border-gray-300 dark:border-gray-600"
                }`}
              onClick={() => setSolveFor(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-4">
        {solveFor !== "voltage" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Voltage (V)</label>
            <input
              type="number"
              name="voltage"
              value={values.voltage}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Enter voltage"
            />
          </div>
        )}

        {solveFor !== "current" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Current (A)</label>
            <input
              type="number"
              name="current"
              value={values.current}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Enter current"
            />
          </div>
        )}

        {solveFor !== "resistance" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Resistance (Ω)</label>
            <input
              type="number"
              name="resistance"
              value={values.resistance}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Enter resistance"
            />
          </div>
        )}

        {solveFor !== "power" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Power (W)</label>
            <input
              type="number"
              name="power"
              value={values.power}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Enter power"
            />
          </div>
        )}
      </div>

      {/* Result */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div className="font-medium">Result:</div>
        <div className="text-2xl font-bold">
          {solveFor === "voltage" && values.voltage ? `${values.voltage} V` : ""}
          {solveFor === "current" && values.current ? `${values.current} A` : ""}
          {solveFor === "resistance" && values.resistance ? `${values.resistance} Ω` : ""}
          {solveFor === "power" && values.power ? `${values.power} W` : ""}
        </div>
      </div>

      {/* Ohm's Law Formulas */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Ohm's Law Formulas:</div>
        <div className="grid grid-cols-2 gap-2">
          <div>V = I × R</div>
          <div>I = V ÷ R</div>
          <div>R = V ÷ I</div>
          <div>P = V × I</div>
          <div>P = I² × R</div>
          <div>P = V² ÷ R</div>
        </div>
      </div>
    </div>
  );
}

function ResistorParallelCalculator() {
  const [resistors, setResistors] = useState(["", ""]);
  const [result, setResult] = useState("");

  useEffect(() => {
    calculate();
  }, [resistors]);

  const addResistor = () => {
    setResistors([...resistors, ""]);
  };

  const removeResistor = (index) => {
    if (resistors.length <= 2) return;
    const newResistors = [...resistors];
    newResistors.splice(index, 1);
    setResistors(newResistors);
  };

  const handleResistorChange = (index, value) => {
    const newResistors = [...resistors];
    newResistors[index] = value;
    setResistors(newResistors);
  };

  const calculate = () => {
    // Convert resistors to numbers and filter out empty values
    const validResistors = resistors
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r) && r > 0);

    if (validResistors.length === 0) {
      setResult("");
      return;
    }

    // Calculate parallel resistance: 1/Rt = 1/R1 + 1/R2 + ... + 1/Rn
    const reciprocalSum = validResistors.reduce((sum, resistance) => sum + 1 / resistance, 0);
    const totalResistance = 1 / reciprocalSum;

    // Format the result
    setResult(totalResistance.toFixed(2));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Add resistor values in ohms (Ω) to calculate the equivalent resistance when connected in parallel.
      </p>

      {/* Resistor input fields */}
      <div className="space-y-3 mb-4">
        {resistors.map((resistor, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="number"
              value={resistor}
              onChange={(e) => handleResistorChange(index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Resistance (Ω)"
            />
            {resistors.length > 2 && (
              <button
                onClick={() => removeResistor(index)}
                className="p-2 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg"
              >
                <FaMinus size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add resistor button */}
      <button
        onClick={addResistor}
        className="w-full mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
      >
        <FaPlus size={16} />
        <span>Add Another Resistor</span>
      </button>

      {/* Result */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
        <div className="font-medium">Equivalent Parallel Resistance:</div>
        <div className="text-2xl font-bold">{result ? `${result} Ω` : "-"}</div>
      </div>

      {/* Formula */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formula:</div>
        <div className="text-center">1/Req = 1/R₁ + 1/R₂ + ... + 1/Rₙ</div>
      </div>
    </div>
  );
}

function ResistorSeriesCalculator() {
  const [resistors, setResistors] = useState(["", ""]);
  const [result, setResult] = useState("");

  useEffect(() => {
    calculate();
  }, [resistors]);

  const addResistor = () => {
    setResistors([...resistors, ""]);
  };

  const removeResistor = (index) => {
    if (resistors.length <= 2) return;
    const newResistors = [...resistors];
    newResistors.splice(index, 1);
    setResistors(newResistors);
  };

  const handleResistorChange = (index, value) => {
    const newResistors = [...resistors];
    newResistors[index] = value;
    setResistors(newResistors);
  };

  const calculate = () => {
    // Convert resistors to numbers and filter out empty values
    const validResistors = resistors
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r) && r > 0);

    if (validResistors.length === 0) {
      setResult("");
      return;
    }

    // Calculate series resistance: Rt = R1 + R2 + ... + Rn
    const totalResistance = validResistors.reduce((sum, resistance) => sum + resistance, 0);

    // Format the result
    setResult(totalResistance.toFixed(2));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Add resistor values in ohms (Ω) to calculate the equivalent resistance when connected in series.
      </p>

      {/* Resistor input fields */}
      <div className="space-y-3 mb-4">
        {resistors.map((resistor, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="number"
              value={resistor}
              onChange={(e) => handleResistorChange(index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Resistance (Ω)"
            />
            {resistors.length > 2 && (
              <button
                onClick={() => removeResistor(index)}
                className="p-2 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg"
              >
                <FaMinus size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add resistor button */}
      <button
        onClick={addResistor}
        className="w-full mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
      >
        <FaPlus size={16} />
        <span>Add Another Resistor</span>
      </button>

      {/* Result */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
        <div className="font-medium">Equivalent Series Resistance:</div>
        <div className="text-2xl font-bold">{result ? `${result} Ω` : "-"}</div>
      </div>

      {/* Formula */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formula:</div>
        <div className="text-center">Req = R₁ + R₂ + ... + Rₙ</div>
      </div>
    </div>
  );
}

function LedResistorCalculator() {
  const [values, setValues] = useState({
    supplyVoltage: "5", // Default 5V supply
    forwardVoltage: "2", // Default 2V LED forward voltage
    ledCurrent: "20",   // Default 20mA
  });

  const [result, setResult] = useState({
    resistance: "",
    power: ""
  });

  useEffect(() => {
    calculate();
  }, [values]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    const vSupply = parseFloat(values.supplyVoltage);
    const vForward = parseFloat(values.forwardVoltage);
    const iLed = parseFloat(values.ledCurrent) / 1000; // Convert mA to A

    if (isNaN(vSupply) || isNaN(vForward) || isNaN(iLed) || iLed <= 0) {
      setResult({
        resistance: "",
        power: ""
      });
      return;
    }

    if (vForward >= vSupply) {
      setResult({
        resistance: "Forward voltage must be less than supply voltage",
        power: "-"
      });
      return;
    }

    // Calculate resistor value: R = (Vsupply - Vforward) / Iled
    const resistorValue = (vSupply - vForward) / iLed;

    // Calculate power dissipation: P = (Vsupply - Vforward) * Iled
    const powerDissipation = (vSupply - vForward) * iLed;

    setResult({
      resistance: resistorValue.toFixed(2),
      power: powerDissipation.toFixed(3)
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Calculate the series resistor value needed to limit current through an LED.
      </p>

      {/* Input fields */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Supply Voltage (V)</label>
          <input
            type="number"
            name="supplyVoltage"
            value={values.supplyVoltage}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Supply voltage"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">LED Forward Voltage (V)</label>
          <input
            type="number"
            name="forwardVoltage"
            value={values.forwardVoltage}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="LED forward voltage"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">LED Current (mA)</label>
          <input
            type="number"
            name="ledCurrent"
            value={values.ledCurrent}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="LED current"
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg space-y-2">
        <div>
          <div className="font-medium">Resistor Value:</div>
          <div className="text-2xl font-bold">{result.resistance ? `${result.resistance} Ω` : "-"}</div>
        </div>
        <div>
          <div className="font-medium">Power Dissipation:</div>
          <div className="text-xl font-bold">{result.power ? `${result.power} W` : "-"}</div>
        </div>
      </div>

      {/* Formula and Explanation */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formula:</div>
        <div>R = (Vsupply - Vforward) / Iled</div>
        <div>P = (Vsupply - Vforward) * Iled</div>
        <div className="mt-2">
          Choose a resistor with a power rating higher than the calculated power dissipation.
        </div>
      </div>
    </div>
  );
}

function CapacitorReactanceCalculator() {
  const [values, setValues] = useState({
    capacitance: "",
    frequency: "",
    unit: "uF" // Default to microfarads
  });

  const [result, setResult] = useState("");

  useEffect(() => {
    calculate();
  }, [values]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    let capacitance = parseFloat(values.capacitance);
    const frequency = parseFloat(values.frequency);

    if (isNaN(capacitance) || isNaN(frequency) || capacitance <= 0 || frequency <= 0) {
      setResult("");
      return;
    }

    // Convert capacitance to Farads based on selected unit
    switch (values.unit) {
      case "F":
        break;
      case "mF":
        capacitance *= 1e-3;
        break;
      case "uF":
        capacitance *= 1e-6;
        break;
      case "nF":
        capacitance *= 1e-9;
        break;
      case "pF":
        capacitance *= 1e-12;
        break;
    }

    // Calculate reactance: Xc = 1/(2πfC)
    const reactance = 1 / (2 * Math.PI * frequency * capacitance);
    setResult(reactance.toFixed(2));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Calculate the reactance of a capacitor at a given frequency.
      </p>

      {/* Input fields */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Capacitance</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="capacitance"
              value={values.capacitance}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Capacitance"
            />
            <select
              name="unit"
              value={values.unit}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="F">F</option>
              <option value="mF">mF</option>
              <option value="uF">µF</option>
              <option value="nF">nF</option>
              <option value="pF">pF</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Frequency (Hz)</label>
          <input
            type="number"
            name="frequency"
            value={values.frequency}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Frequency"
          />
        </div>
      </div>

      {/* Result */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
        <div className="font-medium">Capacitive Reactance:</div>
        <div className="text-2xl font-bold">{result ? `${result} Ω` : "-"}</div>
      </div>

      {/* Formula */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formula:</div>
        <div className="text-center">Xc = 1 / (2πfC)</div>
        <div className="mt-2">
          Where f is frequency in Hz and C is capacitance in Farads
        </div>
      </div>
    </div>
  );
}

function InductorReactanceCalculator() {
  const [values, setValues] = useState({
    inductance: "",
    frequency: "",
    unit: "mH" // Default to millihenries
  });

  const [result, setResult] = useState("");

  useEffect(() => {
    calculate();
  }, [values]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    let inductance = parseFloat(values.inductance);
    const frequency = parseFloat(values.frequency);

    if (isNaN(inductance) || isNaN(frequency) || inductance <= 0 || frequency <= 0) {
      setResult("");
      return;
    }

    // Convert inductance to Henries based on selected unit
    switch (values.unit) {
      case "H":
        break;
      case "mH":
        inductance *= 1e-3;
        break;
      case "uH":
        inductance *= 1e-6;
        break;
      case "nH":
        inductance *= 1e-9;
        break;
    }

    // Calculate reactance: XL = 2πfL
    const reactance = 2 * Math.PI * frequency * inductance;
    setResult(reactance.toFixed(2));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Calculate the reactance of an inductor at a given frequency.
      </p>

      {/* Input fields */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Inductance</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="inductance"
              value={values.inductance}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Inductance"
            />
            <select
              name="unit"
              value={values.unit}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="H">H</option>
              <option value="mH">mH</option>
              <option value="uH">µH</option>
              <option value="nH">nH</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Frequency (Hz)</label>
          <input
            type="number"
            name="frequency"
            value={values.frequency}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Frequency"
          />
        </div>
      </div>

      {/* Result */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
        <div className="font-medium">Inductive Reactance:</div>
        <div className="text-2xl font-bold">{result ? `${result} Ω` : "-"}</div>
      </div>

      {/* Formula */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formula:</div>
        <div className="text-center">XL = 2πfL</div>
        <div className="mt-2">
          Where f is frequency in Hz and L is inductance in Henries
        </div>
      </div>
    </div>
  );
}

function Timer555Calculator() {
  const [values, setValues] = useState({
    mode: "astable",
    r1: "",
    r2: "",
    c: "",
    cUnit: "uF"
  });

  const [result, setResult] = useState({
    frequency: "",
    dutyCycle: "",
    timeHigh: "",
    timeLow: "",
    period: ""
  });

  useEffect(() => {
    calculate();
  }, [values]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    const r1 = parseFloat(values.r1);
    const r2 = parseFloat(values.r2);
    let c = parseFloat(values.c);

    if (isNaN(r1) || isNaN(c) || r1 <= 0 || c <= 0) {
      setResult({
        frequency: "",
        dutyCycle: "",
        timeHigh: "",
        timeLow: "",
        period: ""
      });
      return;
    }

    // Convert capacitance to Farads
    switch (values.cUnit) {
      case "F":
        break;
      case "mF":
        c *= 1e-3;
        break;
      case "uF":
        c *= 1e-6;
        break;
      case "nF":
        c *= 1e-9;
        break;
      case "pF":
        c *= 1e-12;
        break;
    }

    if (values.mode === "monostable") {
      // Monostable mode: t = 1.1 × R1 × C
      const pulseWidth = 1.1 * r1 * c;
      setResult({
        frequency: "",
        dutyCycle: "",
        timeHigh: (pulseWidth * 1000).toFixed(3), // Convert to ms
        timeLow: "",
        period: ""
      });
    } else {
      // Astable mode
      if (isNaN(r2) || r2 <= 0) {
        setResult({
          frequency: "",
          dutyCycle: "",
          timeHigh: "",
          timeLow: "",
          period: ""
        });
        return;
      }

      const timeHigh = 0.693 * (r1 + r2) * c;
      const timeLow = 0.693 * r2 * c;
      const period = timeHigh + timeLow;
      const frequency = 1 / period;
      const dutyCycle = (timeHigh / period) * 100;

      setResult({
        frequency: frequency.toFixed(2),
        dutyCycle: dutyCycle.toFixed(1),
        timeHigh: (timeHigh * 1000).toFixed(3), // Convert to ms
        timeLow: (timeLow * 1000).toFixed(3),   // Convert to ms
        period: (period * 1000).toFixed(3)       // Convert to ms
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Calculate 555 timer parameters for astable or monostable mode.
      </p>

      {/* Mode selection */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Mode</label>
        <select
          name="mode"
          value={values.mode}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
        >
          <option value="astable">Astable (Free Running)</option>
          <option value="monostable">Monostable (One-Shot)</option>
        </select>
      </div>

      {/* Input fields */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium">
            {values.mode === "monostable" ? "Resistor (R1) (Ω)" : "Resistor 1 (R1) (Ω)"}
          </label>
          <input
            type="number"
            name="r1"
            value={values.r1}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="R1 value"
          />
        </div>

        {values.mode === "astable" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Resistor 2 (R2) (Ω)</label>
            <input
              type="number"
              name="r2"
              value={values.r2}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="R2 value"
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">Capacitor (C)</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="c"
              value={values.c}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Capacitor value"
            />
            <select
              name="cUnit"
              value={values.cUnit}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="F">F</option>
              <option value="mF">mF</option>
              <option value="uF">µF</option>
              <option value="nF">nF</option>
              <option value="pF">pF</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg space-y-2">
        {values.mode === "monostable" ? (
          <div>
            <div className="font-medium">Pulse Width:</div>
            <div className="text-2xl font-bold">{result.timeHigh ? `${result.timeHigh} ms` : "-"}</div>
          </div>
        ) : (
          <>
            <div>
              <div className="font-medium">Frequency:</div>
              <div className="text-2xl font-bold">{result.frequency ? `${result.frequency} Hz` : "-"}</div>
            </div>
            <div>
              <div className="font-medium">Duty Cycle:</div>
              <div className="text-xl font-bold">{result.dutyCycle ? `${result.dutyCycle}%` : "-"}</div>
            </div>
            <div>
              <div className="font-medium">Period:</div>
              <div className="text-xl font-bold">{result.period ? `${result.period} ms` : "-"}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="font-medium">Time High:</div>
                <div className="text-lg font-bold">{result.timeHigh ? `${result.timeHigh} ms` : "-"}</div>
              </div>
              <div>
                <div className="font-medium">Time Low:</div>
                <div className="text-lg font-bold">{result.timeLow ? `${result.timeLow} ms` : "-"}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Formula */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Formulas:</div>
        {values.mode === "monostable" ? (
          <div>Pulse Width = 1.1 × R1 × C</div>
        ) : (
          <>
            <div>Frequency = 1.44 / ((R1 + 2×R2) × C)</div>
            <div>Duty Cycle = (R1 + R2) / (R1 + 2×R2)</div>
          </>
        )}
      </div>
    </div>
  );
}

export default Calculators;