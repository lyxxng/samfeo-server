/*
 * Component for displaying the download button.
 */

import Button from 'react-bootstrap/Button';

const API_URL = process.env.REACT_APP_API_URL;

export default function DownloadButtons(
    { samfeo, fastDesign }
) {
    const handleDownload = async(fileName) => {
        try {
            const response = await fetch(`${API_URL}/download/${fileName}`);
            if (!response.ok) throw new Error("File not found");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch(err) {
            console.error(err);
            alert("Failed to download file.");
        }
    };

    return (
        <div className="results-downloads">
            <p className="downloads-label">Download full results:</p>

            <ul>
                {samfeo?.results && (
                    <li>
                        <Button
                            variant="link" type="button"
                            onClick={() => handleDownload(samfeo.results)}
                        >
                            SAMFEO results (JSON)
                        </Button>
                    </li>
                )}

                {fastDesign?.results && (
                    <li>
                        <Button
                            variant="link" type="button"
                            onClick={() => handleDownload(fastDesign.results)}
                        >
                            SAMFEO++ results (JSON)
                        </Button>
                    </li>
                )}
            </ul>

        </div>
    )
}