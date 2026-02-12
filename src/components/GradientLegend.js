/*
 * Component for displaying a legend with a gradient
 */

export default function GradientLegend(
    { title, colors, labels }
) {
    // Positions for the five labels
    const labelPositions = [0, 20, 40, 60, 80, 100];

    return (
        <div className="gradient-legend">
            {title && (
                <div className="gradient-legend__title">
                    {title}
                </div>
            )}

            <div className="gradient-legend__bar">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="gradient-legend__square"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>

            <div className="gradient-legend__labels">
                {labels.map((label, index) => (
                    <div
                        key={index}
                        className="gradient-legend__label"
                        style={{ left: `${labelPositions[index]}%` }}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};