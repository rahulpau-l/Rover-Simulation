import enum 
import time 
import random
import hashlib

class Direction(enum.Enum):
    """
    A class that represents a state

    The first state is north 
    The second state is east 
    The third state is south
    The fourth state is south

    This is used to represent the direction of the rover
    
    """
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3

def change_direction(current_dir: str, next_cmd: str):
    if current_dir == Direction.SOUTH:
        if next_cmd == 'M':
            return current_dir
        if next_cmd == 'L':
            return Direction.EAST
        if next_cmd == 'R':
            return Direction.WEST
        if next_cmd == 'D':
            return current_dir
    
    if current_dir == Direction.WEST:
        if next_cmd == 'M':
            return current_dir
        if next_cmd == 'L':
            return Direction.SOUTH
        if next_cmd == 'R':
            return Direction.NORTH
        if next_cmd == 'D':
            return current_dir

    if current_dir == Direction.NORTH:
        if next_cmd == 'M':
            return current_dir
        if next_cmd == 'L':
            return Direction.WEST
        if next_cmd == 'R':
            return Direction.EAST
        if next_cmd == 'D':
            return current_dir

    if current_dir == Direction.EAST:
        if next_cmd == 'M':
            return current_dir
        if next_cmd == 'L':
            return Direction.NORTH
        if next_cmd == 'R':
            return Direction.SOUTH
        if next_cmd == 'D':
            return current_dir


class Rover:
    def __init__(self, id, commands) -> None:
        self.id = id
        self.commands = commands 
        self.status = "Not Started"
        self.position = (0,0)
        self.history = []
        self.commands_executed = []
        self.current_direction = Direction.SOUTH

    def update_commands(self, commands):
        self.commands = commands

    def fake_test_start(self):
        #commands = [char for char in self.commands]
        self.status = "Moving"
        for _ in range(100):
            random_x = random.randint(0, 9)
            random_y = random.randint(0, 9)
            self.position = (random_x, random_y)
            print("moving..")
            time.sleep(1)
        self.status = "Finished"

    def disarm(self, mine_list, x, y):
        self.status = "Disarming"
        serial = None
        for idx, mine in enumerate(mine_list):
            if mine['x'] == x and mine['y'] == y:
                serial = mine['serial']
                break

        while True:
            pin = random.randrange(0, 100_000_000)
            ##if sha256(pin + serial) === 6 leading 0s
            z = str(pin) + str(serial)
            if hashlib.sha256(z.encode('utf-8')).hexdigest().startswith("0000"):
                print("disarmed")
                del mine_list[idx]
                self.status = "Moving"
                return
                

    def start(self, path_array, mine_list) -> None:
        """
        This function determines the robots path
        """

        self.status = "Moving"
        #self.position = (0, 0)
        #self.history = []
        time.sleep(1)

        ignore_commands: bool = False
        col, row = self.position
        col_size = len(path_array)
        row_size = len(path_array[0])

        commands = [char for char in self.commands]
        for j in range(0, len(commands)):
            print(commands[j])
            time.sleep(1)
            new_row = row
            new_col = col
            print(new_row, new_col)
            if self.current_direction == Direction.NORTH:
                if commands[j] == 'M':
                    new_row -= 1

            if self.current_direction == Direction.EAST:
                if commands[j] == 'M':
                    new_col += 1

            if self.current_direction == Direction.SOUTH:
                if commands[j] == 'M':
                    new_row += 1

            if self.current_direction == Direction.WEST:
                if commands[j] == 'M':
                    new_col -= 1 

            if new_col >= int(col_size):
                new_col = col_size -1

            if new_col <= -1:
                new_col = 0

            if new_row >= int(row_size):
                new_row = row_size -1

            if new_row <= -1:
                new_row = 0

            if path_array[row][col] == '1' and commands[j] != 'D':
                #path_array[row][col] = "$"
                self.status = 'Elminated'
                ignore_commands = True
                time.sleep(2)
                break
            
            if path_array[row][col] == '1' and commands[j] == 'D':
                self.disarm(mine_list, col, row)
                path_array[row][col] = '0'
                            
            self.current_direction = change_direction(self.current_direction, commands[j])

            #path_array[row][col] = '*'
            self.position = (new_col, new_row)
            self.history.append((new_col, new_row))
            col = new_col
            row = new_row
            time.sleep(1)

        if ignore_commands:
            self.status = "Eliminated"
            return 
        
        if path_array[row][col] == "1" and commands[j] != 'D':
            #path_array[row][col] == "$"
            self.status = 'Eliminated'
            time.sleep(1)
            return

        self.status = "Finished"