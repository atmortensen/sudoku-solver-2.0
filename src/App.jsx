import { useState } from 'react';
import './App.css';
import { EASY_BOARD, HARD_BOARD, EXTREME_BOARD } from './preset-puzzles';

function App() {
  const [board, setBoard] = useState(EXTREME_BOARD);
  const [loading, setLoading] = useState(false);
  const [solveSteps, setSolveSteps] = useState(0);
  const [solveTime, setSolveTime] = useState(0);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const validBoard = (board) => {
    const filterEmpty = (arr) => arr.filter((el) => el !== '');
    const hasDuplicates = (arr) => new Set(arr).size !== arr.length;

    for (let i = 0; i < 9; i++) {
      //check rows
      if (hasDuplicates(filterEmpty(board[i]))) {
        return false;
      }
      //check columns
      const col = board.map((row) => row[i]);
      if (hasDuplicates(filterEmpty(col))) {
        return false;
      }
      //check boxes
      const box = board
        .slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3)
        .flatMap((row) => row.slice(Math.floor(i % 3) * 3, Math.floor(i % 3) * 3 + 3));
      if (hasDuplicates(filterEmpty(box))) {
        return false;
      }
    }

    return true;
  };

  const solve = () => {
    const startTime = performance.now();
    const workingBoard = structuredClone(board);
    const originalBoard = structuredClone(board);

    if (!validBoard(board)) {
      setLoading(false);
      return alert('Invalid Sudoku. Duplicates found in rows, columns, or boxes.');
    }

    let row = 0;
    let col = 0;
    let steps = [];

    const moveForward = () => {
      do {
        if (col === 8) {
          col = 0;
          row++;
        } else {
          col++;
        }
      } while (originalBoard[row]?.[col]);
    };

    const moveBack = () => {
      do {
        if (col === 0) {
          col = 8;
          row--;
        } else {
          col--;
        }
      } while (originalBoard[row][col]);
    };

    const findNextValidNumber = (row, col) => {
      const rowValues = workingBoard[row];
      const colValues = workingBoard.map((r) => r[col]);
      const boxValues = workingBoard
        .slice(Math.floor(row / 3) * 3, Math.floor(row / 3) * 3 + 3)
        .flatMap((r) => r.slice(Math.floor(col / 3) * 3, Math.floor(col / 3) * 3 + 3));

      const startingValue = workingBoard[row][col] || 1;
      for (let i = startingValue; i <= 9; i++) {
        if (!rowValues.includes(i) && !colValues.includes(i) && !boxValues.includes(i)) {
          return i;
        }
      }
    };

    // Move to the first empty cell
    if (originalBoard[row][col]) {
      moveForward();
    }

    while (row < 9) {
      const nextValidNumber = findNextValidNumber(row, col);

      if (nextValidNumber) {
        workingBoard[row][col] = nextValidNumber;
        steps.push({ row, col, val: nextValidNumber });
        moveForward();
      } else {
        workingBoard[row][col] = '';
        steps.push({ row, col, val: '' });
        moveBack();
      }
    }

    const endTime = performance.now();
    setSolveTime(Math.round(endTime - startTime));
    setSolveSteps(steps.length);

    animateSolve(steps);
  };

  const updateCell = (row, col, val) => {
    val = !val || val === 'Backspace' || val === 'Delete' ? '' : Number(val);
    // Only allow numbers 1-9
    const validValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, '']);
    if (!validValues.has(val)) return;

    const newBoard = board.map((r, i) => (i === row ? r.map((c, j) => (j === col ? val : c)) : r));
    setBoard(newBoard);
  };

  const clearBoard = () => {
    setBoard((prevBoard) => prevBoard.map((row) => row.map(() => '')));
    setSolveSteps(0);
    setSolveTime(0);
    setLoading(false);
  };

  const resetBoard = (sampleBoard) => {
    setBoard(sampleBoard);
    setSolveSteps(0);
    setSolveTime(0);
    setLoading(false);
    setShowDifficultyMenu(false);
  };

  const animateSolve = async (steps) => {
    const virtualBoard = structuredClone(board);
    const delay = 4; // Minimum allowed by browser
    const maxAnimationDuration = 10000;
    const maxFrames = Math.floor(maxAnimationDuration / delay);
    const skipEveryXFrames = steps.length > maxFrames ? Math.floor(steps.length / maxFrames) : 1;

    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < steps.length; i++) {
      const { row, col, val } = steps[i];
      virtualBoard[row][col] = val;
      if (i % skipEveryXFrames === 0) {
        setBoard(structuredClone(virtualBoard));
        await pause(delay);
      }
    }
    setBoard(virtualBoard); // Ensure the final state is set
    setLoading(false);
  };

  return (
    <div className="wrapper">
      <h1>Sudoku Solver</h1>
      <p>
        This React app is an interactive Sudoku solver that uses a backtracking algorithm to find a
        solution, then animates the solving process step-by-step to visualize how the algorithm
        worked. The preset puzzle is the most difficult one I was able to find, making it a great
        test of both logic and performance. It's a fully functional demo of algorithmic
        problem-solving and state management in React.
      </p>

      <table cellSpacing={0} cellPadding={0}>
        <tbody>
          {board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, columnIndex) => (
                <td key={rowIndex + columnIndex}>
                  <input
                    type="text"
                    value={cell}
                    onChange={() => {}} // Getting the react warning off my back
                    onKeyDown={(e) => updateCell(rowIndex, columnIndex, e.key)}
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
          // Necessary to allow the loading state to update before starting
          setTimeout(solve, 0);
        }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Solve'}
      </button>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button className="secondary" onClick={clearBoard} disabled={loading} style={{ flex: 1 }}>
          Clear
        </button>
        <button
          className="secondary"
          onClick={() => setShowDifficultyMenu(!showDifficultyMenu)}
          disabled={loading}
          style={{ flex: 1, position: 'relative' }}
        >
          Sample Puzzle
          {showDifficultyMenu && (
            <div className="dropdown-content">
              <button onClick={() => resetBoard(EASY_BOARD)}>Easy</button>
              <button onClick={() => resetBoard(HARD_BOARD)}>Hard</button>
              <button onClick={() => resetBoard(EXTREME_BOARD)}>Extreme</button>
            </div>
          )}
        </button>
      </div>

      <p style={{ textAlign: 'right' }}>
        * Solved in <strong>{solveTime.toLocaleString()}ms</strong> and{' '}
        <strong>{solveSteps.toLocaleString()} steps</strong>
      </p>
    </div>
  );
}

export default App;
