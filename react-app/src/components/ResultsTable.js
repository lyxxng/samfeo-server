/*
 * Component for a responsive table.
 */

import Table from 'react-bootstrap/Table';

export default function ResultsTable(
    { headers, content }
) {
    return (
        <Table bordered hover responsive className="ResultsTable">
            <thead>
                <tr>
                    {headers.map(h => <th key={h}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {content.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}