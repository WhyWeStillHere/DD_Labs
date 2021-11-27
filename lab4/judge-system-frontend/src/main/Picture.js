import {Figure} from "react-bootstrap";
import animatedBoard from "./animate_animated2.svg";
import board from "./board.svg";
import {useEffect, useState} from "react";

export default function Picture() {
    const [animated, setAnimated] = useState(0)
    useEffect(() => {
        setTimeout(() => {
            setAnimated(1)
            setTimeout(() => {
                setAnimated(2)
            }, 200)
        }, 4000)
        return () => {
            setAnimated(2)
        }
    }, [])

    return (
    <Figure style={{ position: 'relative', width: 400, height: 400 }}>
        {animated !== 2 && (
            <Figure.Image
                className="animated_picture"
                width={400}
                height={400}
                alt="171x180"
                src={animatedBoard}
                style={{ position: 'absolute', left: 0, top: 0 }}
            />
        )}
        {animated !== 0 && (
            <Figure.Image
                className="picture"
                width={400}
                height={400}
                alt="171x180"
                src={board}
                style={{ position: 'absolute', left: 0, top: 0 }}
            />
        )}
    </Figure>
    )
}