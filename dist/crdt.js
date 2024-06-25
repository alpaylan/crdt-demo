"use strict";
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
function createSimulator() {
    return {
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
function main(initiateSimulation, renderSimulation, applyOperation, initialState) {
    const simulator = createSimulator();
    addEntity(simulator, "1", initialState(), 3000);
    addEntity(simulator, "2", initialState(), 0);
    addEntity(simulator, "3", initialState(), 0);
    initiateSimulation(simulator);
    let ct = Date.now();
    setInterval(() => {
        ct = Date.now();
        simulator.clock = ct;
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
    let simulation = document.body.appendChild(document.createElement("div"));
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
    let simulation = document.body.appendChild(document.createElement("div"));
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
    let simulation = document.body.appendChild(document.createElement("div"));
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
// main(
//     initiateCounterCRDTSimulation,
//     renderCounterCRDTSimulation,
//     applyCounterCRDTOperation,
//     0
// );
// main(
//     initiateBrokenCounterCRDTSimulation,
//     renderCounterCRDTSimulation,
//     applyBrokenCounterCRDTOperation,
//     0
// );
main(initiateCanvasCRDTSimulation, renderCanvasCRDTSimulation, applyCanvasCRDTOperation, () => Array.from({ length: CANVAS_SIZE }, () => Array.from({ length: CANVAS_SIZE }, () => "white")));
