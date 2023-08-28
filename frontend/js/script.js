/* Mine Functionality */
var submitMineBtn = document.getElementById('submitMineBtn');
submitMineBtn.addEventListener('click', () => {
    const serial = document.getElementById('serialNum');
    const xCord = document.getElementById('xCord');
    const yCord = document.getElementById('yCord');
    const s = serial.value;

    if (serial.value == '' || xCord.value == '' || yCord.value == '') {
        alert("error: fields cannoy be empty");
    } else  {
        pushMineData(s, xCord.value, yCord.value);
    }
});

const pushMineData = (serial, x, y) => {
    const url = `https://coe892lab42023rahul.azurewebsites.net/mines?x=${x}&y=${y}&serial=${serial}`;
    console.log(url)

    fetch(url, { method: 'POST', })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                alert(`errer ${data['error']}`);
            }
        })
        .catch(error => console.log(error));
}

function getAllMines() {
    getMineData();
}

function getMineData() {
    fetch('https://coe892lab42023rahul.azurewebsites.net/mines')
        .then(response => response.json())
        .then(data => {
            clearTable();
            // Store valid mines in a temporary array
            const validMines = [];

            data.forEach(obj => {
                console.log("mine_id", obj.mine_id);
                var cord = `(${obj.x}, ${obj.y})`;
                console.log(`(${obj.x}, ${obj.y})`);
                console.log("serial", obj.serial);
                updateTable(obj.mine_id, obj.serial, cord);
                updateMineData({ x: obj.x, y: obj.y });

                // Check if the mine should be deleted
                if (obj.should_delete) {
                    console.log(`Mine with ID ${obj.mine_id} should be deleted.`);
                    // Perform any necessary actions to delete the mine from the server
                } else {
                    // Add valid mines to the temporary array
                    validMines.push({ x: obj.x, y: obj.y });
                }
            });

            // Update mineData with the valid mines
            mineData.data = validMines;

            lineChart.update();
        })
        .catch(error => {
            console.log("no mines")
            mineData.data = [];
            lineChart.update();
        });
}


const updateMineData = (mine_object) => {
    const ifExists = mineData.data.find(obj => obj.x == mine_object.x && obj.y == mine_object.y);
    if (ifExists) {
        console.log("Mine already exists");
    } else {
        mineData.data.push(mine_object);
    }
}

const getMineWithId = () => {
    const mineID = document.getElementById('mineIdSingle')
    getMineURL = `https://coe892lab42023rahul.azurewebsites.net/mines/${mineID.value}`
    fetch(getMineURL, { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(JSON.stringify(data)));
}

getMineWithIdBtn = document.getElementById('getMineWithIdBtn');
getMineWithIdBtn.addEventListener("click", getMineWithId);

const table = document.getElementById('mineTable')
const clearTable = () => {
    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

const updateTable = (mineID, serial, coordinates) => {
    let row = table.insertRow(-1);

    let c1 = row.insertCell(0);
    let c2 = row.insertCell(1);
    let c3 = row.insertCell(2);

    c1.innerText = mineID;
    c2.innerText = serial;
    c3.innerText = coordinates;

}

const deleteMines = () => {
    const mineID = document.getElementById('mineIdTxt');
    const delMineURL = `https://coe892lab42023rahul.azurewebsites.net/mines/${mineID.value}`
    console.log(delMineURL);

    if (mineID.value === '') {
        alert("error: fields cannot be empty");
        return
    }

    fetch(delMineURL, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            if (!data.hasOwnProperty("error")) {
                const x = data.x
                const y = data.y
                const index = mineData.data.findIndex(obj => obj.x == x && obj.y == y);
                if (index != -1) {
                    mineData.data.splice(index, 1);
                    lineChart.update();
                }
            }
        });
}


const delMines = document.getElementById('delSubMine');
delMines.addEventListener("click", deleteMines);


updateMineSubmitBtn = document.getElementById('updateMineSubBtn');
updateMineSubmitBtn.addEventListener("click", () => {
    const id = document.getElementById('mineUpdatedID');
    const x = document.getElementById('updatedX');
    const y = document.getElementById('updatedY');
    const serial = document.getElementById('updatedSerial');

    if (serial.value == '') {
        const updateURL = `https://coe892lab42023rahul.azurewebsites.net/mines/${id.value}?x=${x.value}&y=${y.value}`;
        fetch(updateURL, { method: "PUT" })
            .then(response => response.json())
            .then(data => alert(JSON.stringify(data)));

    } else {
        const updateURL = `https://coe892lab42023rahul.azurewebsites.net/mines/${id.value}?x=${x.value}&y=${y.value}&serial=${serial.value}`;
        fetch(updateURL, { method: "PUT" })
            .then(response => response.json())
            .then(data => alert(JSON.stringify(data)));
    }
});


/* Rover Functionality */
const getRoverData = () => {
    fetch('https://coe892lab42023rahul.azurewebsites.net/rovers')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            clearRoverTable();
            data.forEach(obj => {
                console.log("rover_id", obj.id);
                console.log("status", obj.status);
                console.log("position", obj.position[0], obj.position[1]);
                updateRoverTable(obj.id, obj.status, obj.position, obj.commands)
                updateChart(obj.id, obj.position);
            });
        })
        .catch(error => {
            const roverIds = chartData.datasets.filter(dataset => dataset.type === 'line')
                                                   .map(dataset => dataset.label);
            chartData.datasets = chartData.datasets.filter(dataset => !roverIds.includes(dataset.label));
            lineChart.update();
        
            console.log(error);
        });

}

var getRoverBtn = document.getElementById('roverBtn');
getRoverBtn.addEventListener("click", getRoverData);

const roverTable = document.getElementById("roverTable");

const clearRoverTable = () => {
    for (var i = roverTable.rows.length - 1; i > 0; i--) {
        roverTable.deleteRow(i);
    }
}

const updateRoverTable = (rover_id, status, position, commands) => {
    let row = roverTable.insertRow(-1);

    let c1 = row.insertCell(0);
    let c2 = row.insertCell(1);
    let c3 = row.insertCell(2);
    let c4 = row.insertCell(3);

    c1.innerText = rover_id;
    c2.innerText = status;
    c3.innerText = "(" + position + ")";
    c4.innerText = commands;

}

const submitRover = document.getElementById('submitCreateRover')
submitRover.addEventListener("click", () => {
    const commandsText = document.getElementById("commandsTxtBox");

    if (commandsText.value == "") {
        alert("error, the commands field is empty");
    } else {
        const addRoverURL = `https://coe892lab42023rahul.azurewebsites.net/rovers?commands=${commandsText.value}`;
        fetch(addRoverURL, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.hasOwnProperty("error")) {
                    alert(`error ${data["error"]}`);
                }
            });
    }

});

const deleteRover = document.getElementById('delRoverBtn');
deleteRover.addEventListener("click", () => {
    const delRoverIdInput = document.getElementById('delRoverID');
    const roverID = delRoverIdInput.value;

    if (roverID == '') {
        alert("error, ID field cannot be empty");
        return 
    }

    console.log(roverID)
    const deleteRoverURL = `https://coe892lab42023rahul.azurewebsites.net/rovers/${roverID}`
    console.log(deleteRoverURL);

    fetch(deleteRoverURL, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.hasOwnProperty("error")) {
                alert("Rover not found");
            } else {
                //delete rover
                const roverIndex = lineChart.data.datasets.findIndex(obj => obj.label == roverID);

                if (roverIndex != -1) {
                    lineChart.data.datasets.splice(roverIndex);
                    lineChart.update();
                }

            }
        });
});

const getSingleRover = document.getElementById("submitGetSingleRover");
getSingleRover.addEventListener("click", () => {
    const roverId = document.getElementById('idSingleTxtBox');
    const getSingleRoverURL = `https://coe892lab42023rahul.azurewebsites.net/rovers/${roverId.value}`

    fetch(getSingleRoverURL, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                alert(`${data["error"]}`);
            }
            else {
                alert(JSON.stringify(data));
            }
        });

});

const sendCommands = document.getElementById('submitSendCommands');
sendCommands.addEventListener("click", () => {
    const roverId = document.getElementById('sendCommandsId');
    const commands = document.getElementById('sendCommandsTxt')

    if(roverId.value == '' || commands.value == '') {
        alert("error, fields cannot be empty");
        return;
    } 

    const sendCommandsURL = `https://coe892lab42023rahul.azurewebsites.net/rovers/${roverId.value}?commands=${commands.value}`

    fetch(sendCommandsURL, { 'method': 'PUT' })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                alert(`error, ${data['error']}`);
            }
        });

});

const dispatchRover = document.getElementById('dispatchRoverBtn');
dispatchRover.addEventListener("click", () => {
    const dispatchId = document.getElementById('dispatchID');
    const dRoverId = dispatchId.value;
    const dispatchURL = `https://coe892lab42023rahul.azurewebsites.net/rovers/${dRoverId}/dispatch`;

    fetch(dispatchURL, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty('error')) {
                alert("Could not find rover!");
            }
            else {
                alert(JSON.stringify(data));
            }
        });
});


/* Map Functionality */
const changeMapSize = document.getElementById('subMapSize');
changeMapSize.addEventListener("click", () => {

    let x = document.getElementById("xSizeInput").value;
    let y = document.getElementById("ySizeInput").value;

    if (x == "" || y == "") {
        alert("X or Y input field is empty!");
        return
    }

    const changeMapURL = `https://coe892lab42023rahul.azurewebsites.net/map/${x}/${y}`
    fetch(changeMapURL, { method: 'PUT' })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty("height")) {
                map_x = parseInt(data.width);
                map_y = parseInt(data.height);

                lineChart.options.scales.x.max = map_x;

                // Update the max value of the y scale
                lineChart.options.scales.y.max = map_y;
                lineChart.update();
                console.log("updated")
            }
        })
        .catch(error => console.log(error));
});


const getMapSize = () => {
    const getMapURL = `https://coe892lab42023rahul.azurewebsites.net/map`
    fetch(getMapURL, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.hasOwnProperty("x") && data.hasOwnProperty("y")) {
                console.log()
                chartOptions.scales.x.max = data.x;
                chartOptions.scales.y.max = data.y;
                lineChart.options = chartOptions;
                lineChart.update();
            }
        });
}

var mineData = {
    label: 'Mines',
    data: [],
    borderWidth: 1,
    pointRadius: 4,
    borderColor: 'rgba(255, 99, 132, 1)',
    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
    type: 'scatter'
}

var roverData = [];

var chartData = { datasets: [mineData] };

var chartOptions = {
    animations: false,
    scales: {
        x: {
            min: -1,
            type: 'linear',
            position: 'bottom',
            title: {
                display: true,
                text: 'x-pos'
            },
            ticks: {
                stepSize: 1
            }
        },
        y: {
            min: -1,
            reverse: true,
            title: {
                display: true,
                text: 'y-pos'
            },
            ticks: {
                reverse: true,
                stepSize: 1
            }
        }
    }
};


var chartCanvas = document.getElementById('myChart');
var lineChart = new Chart(chartCanvas, {
    type: 'scatter',
    data: chartData,
    options: chartOptions
});

const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D'];

function updateChart(id, position) {
    let dataset = lineChart.data.datasets.find(dataset => dataset.label == id.toString());
    if (!dataset) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        dataset = {
            label: id.toString(),
            data: [{ x: position[0], y: position[1] }],
            borderColor: randomColor,
            backgroundColor: randomColor,
            fill: false,
            type: 'line'
        };
        lineChart.data.datasets.push(dataset);
    } else {
        // Check if the new position is different from the last known position
        const lastPosition = dataset.data[dataset.data.length - 1];
        if (!lastPosition || lastPosition.x !== position[0] || lastPosition.y !== position[1]) {
            dataset.data.push({x: position[0], y: position[1]});
        }
    }
    console.log("I am here");
    lineChart.update();
}

//setInterval(getMineData, 1500);
setInterval(getRoverData, 1000);
setInterval(getMineData, 1000);
setInterval(getMapSize, 50);