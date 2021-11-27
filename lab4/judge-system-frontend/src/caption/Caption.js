export default function Caption({ text, styles = {} }) {
    return (
        <h3
            className="my-3"
            style={{
                borderRadius: '0.25em',
                textAlign: 'center',
                color: 'black',
                border: '1px solid black',
                padding: '0.5em',
                backgroundColor: 'rgba(255,255,255,0.95)',
                ...styles,
            }}
        >
            {text}
        </h3>
    )
}
