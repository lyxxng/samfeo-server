/*
 * Component for a responsive table.
 */

import Table from 'react-bootstrap/Table';

export default function ResultsTable(
    { headerClass, headers, content }
) {
    return (
        <Table bordered hover responsive className="ResultsTable">
            <thead className={headerClass}>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index} className={header.className || ''}>
                            {header.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {content.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td
                                key={cellIndex}
                                className={cell.className || ''}
                            >
                                {cell.value}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}