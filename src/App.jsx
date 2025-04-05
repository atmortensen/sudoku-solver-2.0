import { useState, useRef } from 'react';
import './App.css';

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const PRESET_BOARD = [
  ['', '', '', '1', '', '2', '', '', ''],
  ['', '6', '', '', '', '', '', '7', ''],
  ['', '', '8', '', '', '', '9', '', ''],
  ['4', '', '', '', '', '', '', '', '3'],
  ['', '5', '', '', '', '7', '', '', ''],
  ['2', '', '', '', '8', '', '', '', '1'],
  ['', '', '9', '', '', '', '8', '', '5'],
  ['', '7', '', '', '', '', '', '6', ''],
  ['', '', '', '3', '', '4', '', '', ''],
];

function App() {
  const [board, setBoard] = useState(PRESET_BOARD);
  const [loading, setLoading] = useState(false);
  const [solveSteps, setSolveSteps] = useState(0);
  const [solveTime, setSolveTime] = useState(0);

  const inputRefs = useRef([]);

  const clearBoard = () => {
    setBoard((prevBoard) => prevBoard.map((row) => row.map(() => '')));
    setSolveSteps(0);
    setSolveTime(0);
    setLoading(false);
  };

  const updateCell = (row, col, val) => {
    // Only allow numbers 1-9
    if (!NUMBERS.concat('').includes(val)) return;

    const newBoard = board.map((r, i) => (i === row ? r.map((c, j) => (j === col ? val : c)) : r));
    setBoard(newBoard);
  };

  const handleKeyDown = (e, rowIndex, index) => {
    if (e.key === 'Backspace' && e.target.value === '') {
      const prevInput = inputRefs.current[rowIndex * 9 + index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const solve = () => {
    const startTime = performance.now();
    const workingBoard = structuredClone(board);
    const originalBoard = structuredClone(board);
    let row = 0;
    let col = 0;
    let steps = 0;

    const updateCell = (row, col, value) => {
      workingBoard[row][col] = value;
    };

    const moveForward = () => {
      if (col === 8) {
        col = 0;
        row++;
      } else {
        col++;
      }
      // Skip filled cells
      if (originalBoard[row]?.[col]) {
        moveForward();
      }
    };

    const moveBack = () => {
      if (col === 0) {
        col = 8;
        row--;
      } else {
        col--;
      }
      // Skip filled cells
      if (originalBoard[row]?.[col]) {
        moveBack();
      }
      // If the last number is reached, reset it and move back
      if (workingBoard[row] && workingBoard[row][col] === NUMBERS[NUMBERS.length - 1]) {
        updateCell(row, col, '');
        moveBack();
      }
    };

    const hasDuplicates = (arr) => {
      const seen = new Set();
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
          if (seen.has(arr[i])) {
            return true;
          }
          seen.add(arr[i]);
        }
      }
      return false;
    };

    const cellIsValid = (row, col) => {
      const rowValues = workingBoard[row];
      const colValues = workingBoard.map((r) => r[col]);
      const boxValues = workingBoard
        .slice(Math.floor(row / 3) * 3, Math.floor(row / 3) * 3 + 3)
        .flatMap((r) => r.slice(Math.floor(col / 3) * 3, Math.floor(col / 3) * 3 + 3));

      return !hasDuplicates(rowValues) && !hasDuplicates(colValues) && !hasDuplicates(boxValues);
    };

    // Check if each filled cell is valid
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (workingBoard[r][c] && !cellIsValid(r, c)) {
          return alert('Invalid Sudoku');
        }
      }
    }

    // Find the first empty cell
    if (originalBoard[row][col]) {
      moveForward();
    }

    while (row < 9) {
      steps++;

      // If the cell is empty, fill it with the first number
      if (workingBoard[row][col] === '') {
        updateCell(row, col, NUMBERS[0]);
      }

      // Check if the cell is valid
      if (!cellIsValid(row, col)) {
        const nextNumber = NUMBERS[NUMBERS.indexOf(workingBoard[row][col]) + 1];
        if (nextNumber) {
          // Check if the next number is valid
          updateCell(row, col, nextNumber);
          continue;
        } else {
          // If none of the numbers work, reset the cell and move back
          updateCell(row, col, '');
          moveBack();
          updateCell(row, col, NUMBERS[NUMBERS.indexOf(workingBoard[row][col]) + 1]);
          continue;
        }
      }
      moveForward();
    }

    const endTime = performance.now();
    setSolveTime(Math.round(endTime - startTime));
    setSolveSteps(steps);
    setBoard(workingBoard);
    setLoading(false);
  };

  return (
    <>
      <h1>Sudoku Solver</h1>

      <table cellSpacing={0} cellPadding={0}>
        <tbody>
          {board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, columnIndex) => (
                <td key={rowIndex + columnIndex}>
                  <input
                    type="text"
                    value={cell}
                    maxLength={1}
                    ref={(el) => (inputRefs.current[rowIndex * 9 + columnIndex] = el)}
                    onChange={(e) => updateCell(rowIndex, columnIndex, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, columnIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => {
          setLoading(true);
          // Necessary to allow the UI to update before starting the solve
          setTimeout(solve, 0);
        }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Solve'}
      </button>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button className="secondary" onClick={clearBoard}>
          Clear
        </button>
        <button
          className="secondary"
          onClick={() => {
            setBoard(PRESET_BOARD);
            setSolveSteps(0);
            setSolveTime(0);
            setLoading(false);
          }}
        >
          Reset
        </button>
      </div>

      <p style={{ textAlign: 'right' }}>
        * Solved in <strong>{solveTime.toLocaleString()}ms</strong> and{' '}
        <strong>{solveSteps.toLocaleString()} steps</strong>
      </p>
    </>
  );
}

export default App;
