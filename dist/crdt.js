"use strict";
let CURRENT_SIMULATION = "none";
function poll(entity, ct, applyOperation) {
    // If the entity is not connected, don't do anything
    if (!entity.connected) {
        // console.log(`Entity ${entity.id} is not connected to the network`);
        return undefined;
    }
    // Apply any operations in the buffer
    while (entity.buffer.length > 0) {
        // console.log(`Applying operation from buffer for entity ${entity.id}`);
        const op = entity.buffer.shift();
        entity.state = applyOperation(op, entity.state);
    }
    // If the backlog is empty, don't do anything
    if (entity.backlog.length === 0) {
        // console.log(`Entity ${entity.id} has an empty backlog`);
        return undefined;
    }
    // Get the item from the backlog
    const op = entity.backlog.shift();
    // Add to history
    entity.history.push([op, ct]);
    return op;
}
function createSimulator(crdtType) {
    return {
        crdtType,
        clock: 0,
        entities: new Map(),
        backlog: []
    };
}
function addEntity(simulator, id, state, delay) {
    simulator.entities.set(id, {
        id,
        state,
        buffer: [],
        backlog: [],
        history: [],
        connected: true,
        delay
    });
}
function main(initiateSimulation, renderSimulation, applyOperation, initialState, crdtType) {
    const simulator = createSimulator(crdtType);
    addEntity(simulator, "1", initialState(), 3000);
    addEntity(simulator, "2", initialState(), 0);
    addEntity(simulator, "3", initialState(), 0);
    initiateSimulation(simulator);
    let ct = Date.now();
    const loop = setInterval(() => {
        ct = Date.now();
        simulator.clock = ct;
        if (CURRENT_SIMULATION !== crdtType) {
            clearInterval(loop);
            return;
        }
        simulator.entities.forEach(entity => {
            const op = poll(entity, ct, applyOperation);
            if (op !== undefined) {
                console.log(`Entity ${entity.id} pushed operation ${JSON.stringify(op)} to the backlog at time ${ct}, will be sent at time ${ct + entity.delay}`);
                simulator.backlog.push({
                    entityId: entity.id,
                    operation: op,
                    time: ct + entity.delay
                });
            }
        });
        simulator.backlog = simulator.backlog.filter(entry => {
            if (entry.time <= ct) {
                const entity = simulator.entities.get(entry.entityId);
                // Add the operation to the backlog of the other entities
                simulator.entities.forEach(otherEntity => {
                    if (otherEntity.id !== entity.id) {
                        otherEntity.buffer.push(entry.operation);
                    }
                });
                return false;
            }
            return true;
        });
        renderSimulation(simulator);
    }, 10);
}
function applyCounterCRDTOperation(op, state) {
    switch (op) {
        case "increment":
            return state + 1;
        case "decrement":
            return state - 1;
    }
}
function initiateCounterCRDTSimulation(simulator) {
    let simulation = document.getElementById("simulation");
    simulator.entities.forEach(entity => {
        let entityDiv = document.createElement("div");
        entityDiv.innerText = entity.id;
        let currentState = document.createElement("div");
        currentState.id = `${entity.id}-state`;
        currentState.innerText = `${entity.id}: ${entity.state}`;
        entityDiv.appendChild(currentState);
        // Add a button to increment the counter
        let incrementButton = document.createElement("button");
        incrementButton.innerText = "Increment";
        incrementButton.onclick = () => {
            console.log(`Incrementing the counter for entity ${entity.id}`);
            entity.state = applyCounterCRDTOperation("increment", entity.state);
            entity.backlog.push("increment");
        };
        entityDiv.appendChild(incrementButton);
        // Add a button to decrement the counter
        let decrementButton = document.createElement("button");
        decrementButton.innerText = "Decrement";
        decrementButton.onclick = () => {
            console.log(`Decrementing the counter for entity ${entity.id}`);
            entity.state = applyCounterCRDTOperation("decrement", entity.state);
            entity.backlog.push("decrement");
        };
        entityDiv.appendChild(decrementButton);
        // Add a slider to change the delay
        let delaySlider = document.createElement("input");
        delaySlider.type = "range";
        delaySlider.min = "0";
        delaySlider.max = "10000";
        delaySlider.step = "100";
        delaySlider.value = `${entity.delay}`;
        delaySlider.oninput = () => {
            entity.delay = parseInt(delaySlider.value);
        };
        entityDiv.appendChild(delaySlider);
        // Add a switch to toggle the connection
        let connectedSwitch = document.createElement("input");
        connectedSwitch.type = "checkbox";
        connectedSwitch.checked = entity.connected;
        connectedSwitch.onchange = () => {
            entity.connected = connectedSwitch.checked;
        };
        entityDiv.appendChild(connectedSwitch);
        simulation.appendChild(entityDiv);
    });
}
function renderCounterCRDTSimulation(simulator) {
    simulator.entities.forEach(entity => {
        let currentState = document.getElementById(`${entity.id}-state`);
        currentState.innerHTML = `${entity.id}: ${entity.state}`;
    });
}
function initiateBrokenCounterCRDTSimulation(simulator) {
    let simulation = document.getElementById("simulation");
    simulator.entities.forEach(entity => {
        let entityDiv = document.createElement("div");
        entityDiv.innerText = entity.id;
        let currentState = document.createElement("div");
        currentState.id = `${entity.id}-state`;
        currentState.innerText = `${entity.id}: ${entity.state}`;
        entityDiv.appendChild(currentState);
        // Add a button to increment the counter
        let incrementButton = document.createElement("button");
        incrementButton.innerText = "Increment";
        incrementButton.onclick = () => {
            console.log(`Incrementing the counter for entity ${entity.id}`);
            entity.state = applyCounterCRDTOperation("increment", entity.state);
            entity.backlog.push("increment");
        };
        entityDiv.appendChild(incrementButton);
        // Add a button to decrement the counter
        let decrementButton = document.createElement("button");
        decrementButton.innerText = "Decrement";
        decrementButton.onclick = () => {
            if (entity.state === 0) {
                console.log(`Not decrementing the counter for entity ${entity.id}`);
                return;
            }
            console.log(`Decrementing the counter for entity ${entity.id}`);
            entity.state = applyCounterCRDTOperation("decrement", entity.state);
            entity.backlog.push("decrement");
        };
        entityDiv.appendChild(decrementButton);
        // Add a slider to change the delay
        let delaySlider = document.createElement("input");
        delaySlider.type = "range";
        delaySlider.min = "0";
        delaySlider.max = "10000";
        delaySlider.step = "100";
        delaySlider.value = `${entity.delay}`;
        delaySlider.oninput = () => {
            entity.delay = parseInt(delaySlider.value);
        };
        entityDiv.appendChild(delaySlider);
        // Add a switch to toggle the connection
        let connectedSwitch = document.createElement("input");
        connectedSwitch.type = "checkbox";
        connectedSwitch.checked = entity.connected;
        connectedSwitch.onchange = () => {
            entity.connected = connectedSwitch.checked;
        };
        entityDiv.appendChild(connectedSwitch);
        simulation.appendChild(entityDiv);
    });
}
function applyBrokenCounterCRDTOperation(op, state) {
    switch (op) {
        case "increment":
            return state + 1;
        case "decrement":
            if (state === 0) {
                return state;
            }
            return state - 1;
    }
}
const CANVAS_SIZE = 50;
function applyCanvasCRDTOperation(op, state) {
    const newState = state.slice();
    newState[op.y][op.x] = op.color;
    return newState;
}
function initiateCanvasCRDTSimulation(simulator) {
    let simulation = document.getElementById("simulation");
    simulator.entities.forEach(entity => {
        let entityDiv = document.createElement("div");
        entityDiv.innerText = entity.id;
        let currentState = document.createElement("div");
        currentState.id = `${entity.id}-state`;
        currentState.style.display = "flex";
        currentState.style.flexDirection = "column";
        currentState.style.width = `${CANVAS_SIZE * 2}px`;
        currentState.style.height = `${CANVAS_SIZE * 2}px`;
        currentState.style.border = "1px solid black";
        for (let y = 0; y < CANVAS_SIZE; y++) {
            let row = document.createElement("div");
            row.style.display = "flex";
            row.style.flexDirection = "row";
            for (let x = 0; x < CANVAS_SIZE; x++) {
                let pixel = document.createElement("div");
                pixel.id = `${entity.id}-${y}-${x}`;
                pixel.style.width = "2px";
                pixel.style.height = "2px";
                pixel.style.backgroundColor = entity.state[y][x];
                row.appendChild(pixel);
            }
            currentState.appendChild(row);
        }
        let drawing = false;
        currentState.onmousedown = (e) => {
            drawing = true;
        };
        currentState.onmouseup = (e) => {
            drawing = false;
        };
        currentState.onmousemove = (e) => {
            if (drawing) {
                const topLeft = currentState.getBoundingClientRect();
                const x = Math.floor((e.pageX - topLeft.left) / 2);
                const y = Math.floor((e.pageY - topLeft.top) / 2);
                entity.state[y][x] = "black";
                entity.backlog.push({ x, y, color: "black" });
            }
        };
        entityDiv.appendChild(currentState);
        // Add a slider to change the delay
        let delaySlider = document.createElement("input");
        delaySlider.type = "range";
        delaySlider.min = "0";
        delaySlider.max = "10000";
        delaySlider.step = "100";
        delaySlider.value = `${entity.delay}`;
        delaySlider.oninput = () => {
            entity.delay = parseInt(delaySlider.value);
        };
        entityDiv.appendChild(delaySlider);
        // Add a switch to toggle the connection
        let connectedSwitch = document.createElement("input");
        connectedSwitch.type = "checkbox";
        connectedSwitch.checked = entity.connected;
        connectedSwitch.onchange = () => {
            entity.connected = connectedSwitch.checked;
        };
        entityDiv.appendChild(connectedSwitch);
        simulation.appendChild(entityDiv);
    });
}
function renderCanvasCRDTSimulation(simulator) {
    simulator.entities.forEach(entity => {
        for (let y = 0; y < CANVAS_SIZE; y++) {
            for (let x = 0; x < CANVAS_SIZE; x++) {
                let pixel = document.getElementById(`${entity.id}-${y}-${x}`);
                pixel.style.backgroundColor = entity.state[y][x];
            }
        }
    });
}
function applyNaiveEditorCRDTOperation(op, state) {
    switch (op.type) {
        case "insert":
            return state.slice(0, op.position) + op.character + state.slice(op.position);
        case "delete":
            return state.slice(0, op.position) + state.slice(op.position + op.length);
    }
}
function diffStrings(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
        i++;
    }
    if (i === a.length && i === b.length) {
        return [];
    }
    if (i === a.length) {
        return [{ type: "insert", position: i, character: b[i] }, ...diffStrings("", b.slice(i + 1))];
    }
    if (i === b.length) {
        return [{ type: "delete", position: i, length: a.length - i }, ...diffStrings(a.slice(i + 1), "")];
    }
    return [{ type: "delete", position: i, length: a.length - i }, { type: "insert", position: i, character: b[i] }, ...diffStrings(a.slice(i + 1), b.slice(i + 1))];
}
function initiateNaiveEditorCRDTSimulation(simulator) {
    let simulation = document.getElementById("simulation");
    simulator.entities.forEach(entity => {
        let entityDiv = document.createElement("div");
        entityDiv.innerText = entity.id;
        let currentState = document.createElement("input");
        currentState.id = `${entity.id}-state`;
        currentState.value = entity.state;
        currentState.oninput = () => {
            const diff = diffStrings(entity.state, currentState.value);
            diff.forEach(d => {
                entity.backlog.push(d);
            });
            entity.state = currentState.value;
        };
        entityDiv.appendChild(currentState);
        // Add a slider to change the delay
        let delaySlider = document.createElement("input");
        delaySlider.type = "range";
        delaySlider.min = "0";
        delaySlider.max = "10000";
        delaySlider.step = "100";
        delaySlider.value = `${entity.delay}`;
        delaySlider.oninput = () => {
            entity.delay = parseInt(delaySlider.value);
        };
        entityDiv.appendChild(delaySlider);
        // Add a switch to toggle the connection
        let connectedSwitch = document.createElement("input");
        connectedSwitch.type = "checkbox";
        connectedSwitch.checked = entity.connected;
        connectedSwitch.onchange = () => {
            entity.connected = connectedSwitch.checked;
        };
        entityDiv.appendChild(connectedSwitch);
        simulation.appendChild(entityDiv);
    });
}
function renderNaiveEditorCRDTSimulation(simulator) {
    simulator.entities.forEach(entity => {
        let currentState = document.getElementById(`${entity.id}-state`);
        currentState.value = entity.state;
    });
}
function applyEditorCRDTOperation(op, state) {
    switch (op.type) {
        case "insert":
            const afterIndex = state.text.findIndex(char => char.opId === op.afterId);
            // Find other characters that were inserted after the same character
            const afterChars = state.text.slice(afterIndex + 1).filter(char => char.afterId === op.afterId);
            // Find the last character that was inserted after the same character
            const lastAfterChar = afterChars.length === 0 ? null : afterChars[afterChars.length - 1];
            // Find the index of the last character that was inserted after the same character
            const lastAfterIndex = lastAfterChar === null ? -1 : state.text.findIndex(char => char.opId === lastAfterChar.opId);
            if (lastAfterChar === null) {
                state.text.push({ opId: op.opId, afterId: op.afterId, character: op.character, deleted: false });
                state.cursor = op.opId;
                return state;
            }
            const lastAfterCharIndex = state.text.findIndex(char => char.opId === lastAfterChar.opId);
            state.text.splice(lastAfterCharIndex + 1, 0, { opId: op.opId, afterId: op.afterId, character: op.character, deleted: false });
            state.cursor = op.opId;
            return state;
        case "delete":
            const removeIndex = state.text.findIndex(char => char.opId === op.removeId);
            state.text[removeIndex].deleted = true;
            return state;
    }
}
function lines(s) {
    return s.text.filter(char => char.character === "\n" && !char.deleted).length + 1;
}
function initiateEditorCRDTSimulation(simulator) {
    let simulation = document.getElementById("simulation");
    simulator.entities.forEach(entity => {
        let entityDiv = document.createElement("div");
        entityDiv.innerText = entity.id;
        let currentState = document.createElement("div");
        currentState.id = `${entity.id}-state`;
        currentState.style.display = "flex";
        currentState.style.flexDirection = "row";
        currentState.style.border = "1px solid black";
        currentState.style.maxWidth = "800px";
        currentState.style.overflow = "wrap";
        currentState.style.minHeight = lines(entity.state) * 20 + "px";
        for (let i = 0; i < 40; i++) {
            let charDiv = document.createElement("div");
            charDiv.id = `${entity.id}-0-${i}`;
            charDiv.innerText = "";
            charDiv.style.border = "1px solid black";
            charDiv.style.width = "20px";
            charDiv.style.height = "20px";
            charDiv.style.display = "flex";
            charDiv.style.justifyContent = "center";
            charDiv.style.alignItems = "center";
            charDiv.style.backgroundColor = "white";
            charDiv.style.color = "black";
            charDiv.style.fontFamily = "monospace";
            charDiv.style.fontSize = "16px";
            charDiv.style.overflow = "hidden";
            // charDiv.style.textOverflow = "ellipsis";
            // charDiv.style.whiteSpace = "nowrap";
            charDiv.onclick = () => {
                console.log(`Entity ${entity.id} is focused`);
                entity.state.cursor = entity.state.text.find(char => char.opId === entity.state.cursor).opId;
                entity.state.focused = true;
                simulator.entities.forEach(otherEntity => {
                    if (otherEntity.id !== entity.id) {
                        otherEntity.state.focused = false;
                    }
                });
            };
            charDiv.onmouseenter = () => {
                // Create a tooltip with the opId
                // Find the opId of the character that is being hovered
                document.getElementById("tooltip").innerText = entity.state.text.find(char => char.opId === entity.state.cursor).opId;
            };
            charDiv.onmouseout = () => {
                const tooltip = document.getElementById(`tooltip`);
                if (tooltip !== null) {
                    tooltip.innerText = "";
                }
            };
            currentState.appendChild(charDiv);
        }
        ;
        currentState.onclick = () => {
            console.log(`Entity ${entity.id} is focused`);
            entity.state.focused = true;
            simulator.entities.forEach(otherEntity => {
                if (otherEntity.id !== entity.id) {
                    otherEntity.state.focused = false;
                }
            });
        };
        document.addEventListener("keydown", (e) => {
            if (!entity.state.focused) {
                return;
            }
            if (e.key === "Meta" || e.key === "Shift" || e.key === "Control" || e.key === "Alt") {
                return;
            }
            if (e.key === "ArrowLeft") {
                const cursorIndex = entity.state.text.findIndex(char => char.opId === entity.state.cursor);
                if (cursorIndex === -1) {
                    return;
                }
                // Find the previous character that is not deleted
                const previousChar = entity.state.text.slice(0, cursorIndex).reverse().find(char => !char.deleted);
                if (previousChar === undefined) {
                    return;
                }
                entity.state.cursor = previousChar.opId;
                return;
            }
            if (e.key === "ArrowRight") {
                const cursorIndex = entity.state.text.findIndex(char => char.opId === entity.state.cursor);
                if (cursorIndex === -1) {
                    return;
                }
                // Find the next character that is not deleted
                const nextChar = entity.state.text.slice(cursorIndex + 1).find(char => !char.deleted);
                if (nextChar === undefined) {
                    return;
                }
                entity.state.cursor = nextChar.opId;
                return;
            }
            if (e.key === "Backspace") {
                const cursorIndex = entity.state.text.findIndex(char => char.opId === entity.state.cursor);
                if (cursorIndex === -1) {
                    return;
                }
                // Find the previous character that is not deleted
                const previousChar = entity.state.text.slice(0, cursorIndex).reverse().find(char => !char.deleted);
                entity.state.text[cursorIndex].deleted = true;
                entity.state.cursor = previousChar === undefined ? "start" : previousChar.opId;
                entity.backlog.push({ type: "delete", opId: entity.state.text[cursorIndex].opId, removeId: entity.state.text[cursorIndex].opId });
            }
            else {
                const newOpId = `${entity.history.length + entity.backlog.length + 1}@${entity.id}`;
                entity.backlog.push({ type: "insert", opId: newOpId, afterId: entity.state.cursor, character: e.key });
                entity.state = applyEditorCRDTOperation({ type: "insert", opId: newOpId, afterId: entity.state.cursor, character: e.key }, entity.state);
            }
        });
        entityDiv.appendChild(currentState);
        // Add a slider to change the delay
        let delaySlider = document.createElement("input");
        delaySlider.type = "range";
        delaySlider.min = "0";
        delaySlider.max = "10000";
        delaySlider.step = "100";
        delaySlider.value = `${entity.delay}`;
        delaySlider.oninput = () => {
            entity.delay = parseInt(delaySlider.value);
        };
        entityDiv.appendChild(delaySlider);
        // Add a switch to toggle the connection
        let connectedSwitch = document.createElement("input");
        connectedSwitch.type = "checkbox";
        connectedSwitch.checked = entity.connected;
        connectedSwitch.onchange = () => {
            entity.connected = connectedSwitch.checked;
        };
        entityDiv.appendChild(connectedSwitch);
        simulation.appendChild(entityDiv);
    });
    const tooltip = document.createElement("div");
    tooltip.id = `tooltip`;
    tooltip.style.position = "absolute";
    tooltip.style.top = "300px";
    tooltip.style.left = "300px";
    tooltip.style.backgroundColor = "black";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.zIndex = "1";
    simulation.appendChild(tooltip);
}
function renderEditorCRDTSimulation(simulator) {
    simulator.entities.forEach(entity => {
        let currentState = document.getElementById(`${entity.id}-state`);
        currentState.style.border = `${entity.state.focused ? "3px" : "1px"} solid black`;
        let totalLines = lines(entity.state);
        currentState.style.minHeight = totalLines * 20 + "px";
        let currentLine = 0;
        let currentChar = 0;
        for (let i = 0; i < 40; i++) {
            let charDiv = document.getElementById(`${entity.id}-0-${i}`);
            charDiv.innerText = "";
            charDiv.style.backgroundColor = "white";
        }
        entity.state.text.forEach(char => {
            if (char.deleted) {
                return;
            }
            if (char.character === "Enter") {
                currentLine++;
                currentChar = 0;
                return;
            }
            let charDiv = document.getElementById(`${entity.id}-${currentLine}-${currentChar}`);
            charDiv.innerText = char.character;
            if (char.opId === entity.state.cursor) {
                charDiv.style.backgroundColor = "lightblue";
            }
            currentChar++;
        });
    });
}
function counter() {
    if (document.getElementById("simulation") !== null) {
        document.getElementById("simulation").innerHTML = "";
    }
    CURRENT_SIMULATION = "counter";
    main(initiateCounterCRDTSimulation, renderCounterCRDTSimulation, applyCounterCRDTOperation, () => 0, "counter");
}
function brokenCounter() {
    if (document.getElementById("simulation") !== null) {
        document.getElementById("simulation").innerHTML = "";
    }
    CURRENT_SIMULATION = "brokenCounter";
    main(initiateBrokenCounterCRDTSimulation, renderCounterCRDTSimulation, applyBrokenCounterCRDTOperation, () => 0, "brokenCounter");
}
function canvas() {
    if (document.getElementById("simulation") !== null) {
        document.getElementById("simulation").innerHTML = "";
    }
    CURRENT_SIMULATION = "canvas";
    main(initiateCanvasCRDTSimulation, renderCanvasCRDTSimulation, applyCanvasCRDTOperation, () => Array.from({ length: CANVAS_SIZE }, () => Array.from({ length: CANVAS_SIZE }, () => "white")), "canvas");
}
function naiveEditor() {
    if (document.getElementById("simulation") !== null) {
        document.getElementById("simulation").innerHTML = "";
    }
    CURRENT_SIMULATION = "naiveEditor";
    main(initiateNaiveEditorCRDTSimulation, renderNaiveEditorCRDTSimulation, applyNaiveEditorCRDTOperation, () => "", "naiveEditor");
}
function editor() {
    if (document.getElementById("simulation") !== null) {
        document.getElementById("simulation").innerHTML = "";
    }
    CURRENT_SIMULATION = "editor";
    main(initiateEditorCRDTSimulation, renderEditorCRDTSimulation, applyEditorCRDTOperation, () => ({
        text: [
            {
                character: " ",
                opId: "start",
                afterId: "null",
                deleted: true,
            }
        ], cursor: "start", focused: false
    }), "editor");
}
