import { random } from "./random"

const startArray = ["!invite", "!commands", "!invite", "!prefix"]

export default function getStartElement() {
    return random(1, startArray.length);
}