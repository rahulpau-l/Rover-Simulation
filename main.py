from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import uvicorn
import random
import string
import rover
import threading
import re

map_array  = [
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
    ]

map_width = len(map_array[0])
map_height = len(map_array)

mine_list = []
rover_list = []

app = FastAPI()
app.mount("/web", StaticFiles(directory="frontend"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stop_event = threading.Event()


mine_id = 0
def generate_mine_id() -> str:
    global mine_id
    mine_id += 1

def generate_rover_id():
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(5))

def check_valid_string(input_string):
    pattern = re.compile("^[MDLR]+$")
    if pattern.match(input_string):
        return True
    else:
        return False


@app.get("/")
async def default_page():
    return RedirectResponse(url="/web/index.html")

@app.get("/map")
async def get_map():
    return {"map": map_array, "x": len(map_array[0]) , "y": len(map_array)}

@app.put("/map/{width}/{height}")
async def update_map(height: int, width: int):
    #height corresponds to x
    replacement_map = [['0' for i in range(width)] for j in range(height)]
    global map_array
    map_array = replacement_map
    print(replacement_map)
    global mine_list, rover_list
    mine_list = []
    rover_list = []
    print(width, height)
    return {"width": width, "height": height}

@app.get("/mines")
async def get_mines():
    if not mine_list:
        return {'error': 'no mines have been added'}
    return mine_list

@app.get("/mines/{mine_id}")
async def get_mine(mine_id: int):
    for _, value in enumerate(mine_list):
        if value['mine_id'] == mine_id:
            return value
        
    return {"error": "mine not found"}

@app.delete("/mines/{mine_id}")
async def delete_mine(mine_id: int):
    try:
        for idx, value in enumerate(mine_list):
            if value['mine_id'] == mine_id:
                x = value['x']
                y = value['y']
                del mine_list[idx]
                return {"sucessful": True, "mine_id": mine_id, "x": x, "y": y}
        return {"error": "mine does not exist"}
    except Exception as e:
        return {"successful": False}

@app.post("/mines")
async def add_mines(x: int, y: int, serial: str):
    if x >= len(map_array[0]) or y >= len(map_array):
        return {"error": "x or y is out of range, please try again"}
    
    print("X", len(map_array[0]), len(map_array))
    
    #fix this
    for i in mine_list:
        if i['serial'] == serial:
            return {"error": "serial already exists"}
        
    global mine_id
    mine_id_old = mine_id
    map_array[y][x] = '1'
    mine_dict = {"mine_id": mine_id_old, "x" : x, "y": y, "serial": serial}
    mine_list.append(mine_dict)
    generate_mine_id()
    return {"mine_id": mine_id_old}

@app.put("/mines/{mine_id}")
async def update_mines(mine_id: int, x: int, y: int, serial: str | None = None):
    for _, key in enumerate(mine_list):
        if key['mine_id'] == mine_id:
            key['x'] = x
            key['y'] = y
            if serial:
                key['serial'] = serial
            return key


    return {"error" : "mine id not found"}

#rover routes
@app.get("/rovers")
async def get_rovers():
    if not rover_list:
        return {"error": "rover list is empty"}
    return rover_list

@app.get("/rovers/{rover_id}")
async def get_single_rover(rover_id: str):
    try:
        for _, value in enumerate(rover_list):
            if value.id == rover_id:
                return {"rover_id": rover_id, "rover_status" : value.status, "position": value.position, "commands": value.commands}
        return {"error": "could not find rover"}
    except Exception as e:
        return {"error": "something went wrong :("}

@app.post("/rovers")
async def add_rover(commands: str):
    if check_valid_string(commands) == False:
        return {"error": "invalid command"}

    rover_id = generate_rover_id()
    r = rover.Rover(rover_id, commands)
    rover_list.append(r)
    return {"rover_id": rover_id }

@app.delete("/rovers/{rover_id}")
async def remove_rover(rover_id: str):
    try: 
        for idx, value in enumerate(rover_list):
            if value.id == rover_id:
                del rover_list[idx]
                return {"sucessful": True, "rover_id": rover_id}
            
        return {"error": "could not find rover"}
    except Exception as e:
        print(e)
        return {"sucessful": False, "error": e}

@app.put("/rovers/{rover_id}")
async def send_list(rover_id: str, commands: str):
    try: 
        for idx, value in enumerate(rover_list):
            print(value.status)
            if value.id == rover_id:
                if value.status in ('Not Started', 'Finished'):
                    value.update_commands(commands)
                    return {"updated_commands": True}
        
        return {"error" : "rover not found"}  
    except Exception as e:
        return {"error": "error has occured"}

@app.post("/rovers/{rover_id}/dispatch")
async def dispatch_rover(rover_id: str):
    for _, _rover in enumerate(rover_list):
        if _rover.id == rover_id:
            if _rover.status in ("Moving", "Elimanted"):
                return {"error": _rover.status}
            t = threading.Thread(target=_rover.start, args=(map_array, mine_list))
            t.start()
            return _rover
        
    return {"error": "rover not found"}
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)



