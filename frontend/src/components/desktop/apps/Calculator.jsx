import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(String(num));
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleOperation = (op) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const Button = ({ children, onClick, className = '', span = false }) => (
    <button
      onClick={onClick}
      className={`p-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 ${
        span ? 'col-span-2' : ''
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full p-6 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-sm mx-auto">
        {/* Display */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-4 shadow-inner">
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 h-6">
              {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
            </div>
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 truncate">
              {display}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white col-span-2"
          >
            C
          </Button>
          <Button
            onClick={() => setDisplay(String(-parseFloat(display)))}
            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            +/-
          </Button>
          <Button
            onClick={() => handleOperation('÷')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            ÷
          </Button>

          <Button
            onClick={() => handleNumber(7)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            7
          </Button>
          <Button
            onClick={() => handleNumber(8)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            8
          </Button>
          <Button
            onClick={() => handleNumber(9)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            9
          </Button>
          <Button
            onClick={() => handleOperation('×')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            ×
          </Button>

          <Button
            onClick={() => handleNumber(4)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            4
          </Button>
          <Button
            onClick={() => handleNumber(5)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            5
          </Button>
          <Button
            onClick={() => handleNumber(6)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            6
          </Button>
          <Button
            onClick={() => handleOperation('-')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            -
          </Button>

          <Button
            onClick={() => handleNumber(1)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            1
          </Button>
          <Button
            onClick={() => handleNumber(2)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            2
          </Button>
          <Button
            onClick={() => handleNumber(3)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            3
          </Button>
          <Button
            onClick={() => handleOperation('+')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            +
          </Button>

          <Button
            onClick={() => handleNumber(0)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow col-span-2"
            span
          >
            0
          </Button>
          <Button
            onClick={handleDecimal}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
          >
            .
          </Button>
          <Button
            onClick={handleEquals}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            =
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
