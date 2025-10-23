import React from 'react';

interface SpreadsheetGridProps {
  gridData: string[][];
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({ gridData, onCellChange }) => {
  const numRows = gridData.length;
  const numCols = gridData[0]?.length || 0;

  const getColName = (colIndex: number): string => {
    let name = '';
    let n = colIndex;
    while (n >= 0) {
      name = String.fromCharCode((n % 26) + 65) + name;
      n = Math.floor(n / 26) - 1;
    }
    return name;
  };

  return (
    <table className="w-full border-collapse table-fixed">
      <thead className="sticky top-0 bg-slate-200 z-10">
        <tr>
          <th className="w-16 p-2 border border-slate-300 text-slate-600"></th>
          {Array.from({ length: numCols }).map((_, colIndex) => (
            <th key={colIndex} className="min-w-[120px] p-2 border border-slate-300 font-semibold text-slate-600">
              {getColName(colIndex)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: numRows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            <th className="w-16 p-2 border border-slate-300 font-semibold text-slate-600 bg-slate-200 sticky left-0 z-10">
              {rowIndex + 1}
            </th>
            {Array.from({ length: numCols }).map((_, colIndex) => (
              <td key={colIndex} className="border border-slate-300">
                <input
                  type="text"
                  value={gridData[rowIndex]?.[colIndex] || ''}
                  onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                  className="w-full h-full p-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))] focus:bg-amber-50"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SpreadsheetGrid;
