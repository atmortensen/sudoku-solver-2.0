import { useState } from 'react';
import './App.css';

const PRESET_BOARD = [
  ['', '', '', 1, '', 2, '', '', ''],
  ['', 6, '', '', '', '', '', 7, ''],
  ['', '', 8, '', '', '', 9, '', ''],
  [4, '', '', '', '', '', '', '', 3],
  ['', 5, '', '', '', 7, '', '', ''],
  [2, '', '', '', 8, '', '', '', 1],
  ['', '', 9, '', '', '', 8, '', 5],
  ['', 7, '', '', '', '', '', 6, ''],
  ['', '', '', 3, '', 4, '', '', ''],
];

function App() {
  const [board, setBoard] = useState(PRESET_BOARD);
  const [loading, setLoading] = useState(false);
  const [solveSteps, setSolveSteps] = useState(0);
  const [solveTime, setSolveTime] = useState(0);

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
    let steps = 0;

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
      steps++;

      const nextValidNumber = findNextValidNumber(row, col);

      if (nextValidNumber) {
        workingBoard[row][col] = nextValidNumber;
        moveForward();
      } else {
        workingBoard[row][col] = '';
        moveBack();
      }
    }

    const endTime = performance.now();
    setSolveTime(Math.round(endTime - startTime));
    setSolveSteps(steps);
    setBoard(workingBoard);
    setLoading(false);
  };

  const updateCell = (row, col, val) => {
    val = !val || val === 'Backspace' ? '' : Number(val);
    // Only allow numbers 1-9
    const validValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, ''];
    if (!validValues.includes(val)) return;

    const newBoard = board.map((r, i) => (i === row ? r.map((c, j) => (j === col ? val : c)) : r));
    setBoard(newBoard);
  };

  const clearBoard = () => {
    setBoard((prevBoard) => prevBoard.map((row) => row.map(() => '')));
    setSolveSteps(0);
    setSolveTime(0);
    setLoading(false);
  };

  const resetBoard = () => {
    setBoard(PRESET_BOARD);
    setSolveSteps(0);
    setSolveTime(0);
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
        <button className="secondary" onClick={clearBoard} disabled={loading}>
          Clear
        </button>
        <button className="secondary" onClick={resetBoard} disabled={loading}>
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
