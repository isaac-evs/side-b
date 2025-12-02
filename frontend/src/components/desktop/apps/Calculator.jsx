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
      className={`h-12 text-lg font-medium transition-colors active:opacity-80 ${
        span ? 'col-span-2 pl-6 text-left' : 'flex items-center justify-center'
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[#323232] text-white">
      {/* Display */}
      <div className="flex-1 flex flex-col justify-end p-4">
        <div className="text-right">
          <div className="text-5xl font-light truncate tracking-tight">
            {display}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-[1px] bg-[#323232] border-t border-[#323232]">
        <Button
          onClick={handleClear}
          className="bg-[#505050] text-white"
        >
          {display === '0' ? 'AC' : 'C'}
        </Button>
        <Button
          onClick={() => setDisplay(String(-parseFloat(display)))}
          className="bg-[#505050] text-white"
        >
          +/-
        </Button>
        <Button
          onClick={() => handleOperation('%')}
          className="bg-[#505050] text-white"
        >
          %
        </Button>
        <Button
          onClick={() => handleOperation('÷')}
          className={`text-white ${operation === '÷' ? 'bg-[#fbc78d] text-[#ff9f0a]' : 'bg-[#ff9f0a]'}`}
        >
          ÷
        </Button>

        <Button
          onClick={() => handleNumber(7)}
          className="bg-[#666666] text-white"
        >
          7
        </Button>
        <Button
          onClick={() => handleNumber(8)}
          className="bg-[#666666] text-white"
        >
          8
        </Button>
        <Button
          onClick={() => handleNumber(9)}
          className="bg-[#666666] text-white"
        >
          9
        </Button>
        <Button
          onClick={() => handleOperation('×')}
          className={`text-white ${operation === '×' ? 'bg-[#fbc78d] text-[#ff9f0a]' : 'bg-[#ff9f0a]'}`}
        >
          ×
        </Button>

        <Button
          onClick={() => handleNumber(4)}
          className="bg-[#666666] text-white"
        >
          4
        </Button>
        <Button
          onClick={() => handleNumber(5)}
          className="bg-[#666666] text-white"
        >
          5
        </Button>
        <Button
          onClick={() => handleNumber(6)}
          className="bg-[#666666] text-white"
        >
          6
        </Button>
        <Button
          onClick={() => handleOperation('-')}
          className={`text-white ${operation === '-' ? 'bg-[#fbc78d] text-[#ff9f0a]' : 'bg-[#ff9f0a]'}`}
        >
          -
        </Button>

        <Button
          onClick={() => handleNumber(1)}
          className="bg-[#666666] text-white"
        >
          1
        </Button>
        <Button
          onClick={() => handleNumber(2)}
          className="bg-[#666666] text-white"
        >
          2
        </Button>
        <Button
          onClick={() => handleNumber(3)}
          className="bg-[#666666] text-white"
        >
          3
        </Button>
        <Button
          onClick={() => handleOperation('+')}
          className={`text-white ${operation === '+' ? 'bg-[#fbc78d] text-[#ff9f0a]' : 'bg-[#ff9f0a]'}`}
        >
          +
        </Button>

        <Button
          onClick={() => handleNumber(0)}
          className="bg-[#666666] text-white col-span-2"
          span
        >
          0
        </Button>
        <Button
          onClick={handleDecimal}
          className="bg-[#666666] text-white"
        >
          .
        </Button>
        <Button
          onClick={handleEquals}
          className="bg-[#ff9f0a] text-white"
        >
          =
        </Button>
      </div>
    </div>
  );
};

export default Calculator;
