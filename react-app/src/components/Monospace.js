/*
 * Component for span with monospace text.
 */

export default function Monospace(
    { children }
) {
    return (
        <span style={{ fontFamily: 'monospace' }}>
            {children}
        </span>
    );
}