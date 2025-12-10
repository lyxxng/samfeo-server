/*
 * Component for a responsive table.
 */

import Table from 'react-bootstrap/Table';

export default function ResultsTable(
    { content }
) {
    return (
        <Table bordered hover responsive className="ResultsTable">
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