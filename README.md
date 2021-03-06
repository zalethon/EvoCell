# EvoCell
EvoCell generates art using a simple genetic algorithm.

You can play with it at <https://zalethon.github.io/EvoCell/>.

It is meant to be viewed in Full Screen. Press `I` to toggle the Menu.

The Menu is automatically active when the page loads.
The 'simulation' is paused whenever the Menu is active.

WARNING: It's probably best not to make Cells much smaller than 12px.
It will slow down even the most powerful computer.

## Simulation
EvoCell starts with a grid of Cells, each having a random color.

EvoCell tries to reach a framerate of 60fps. Each frame, some number of
Cells is killed based on their fitness, and then some number of Cells
is regrown based on the `Respawn Rate` setting.

When a Cell is regrown, its color is set to a combination of the
colors of two of its neighboring Cells, if they exist and aren't dead.
(NOTE: `Dead Cells Viable` starts on, because I think it's prettier)

Then the Cell's color mutates a little bit.

The whole process runs on dozens of cells per second!
Two steps: kill Cells, then regrow and mutate them.

## Menu
All of the settings can be changed in the Menu.
To activate the Menu, press `I`.

+   Display
    +   Dead Cell Tint

        Change the colour Dead cells are tinted with. Default: black
    +   Dead Cell Opacity

        The lower the number, the darker the dead cells. Default: 64
    +   Cell Size (Pixels)

        Each cell's size in pixels. The list is based on your display
        size, and it starts with the ninth option.
        Note that very small Cell sizes might make the simulation run
        very slowly, or crash. I have a relatively powerful computer,
        and anything smaller than 12px at 1920x1080 bogs it down!
        Default: items[8]
+   Simulation
    +   Target Color

        A Cell's fitness is based on its similarity to this color. They
        will naturally 'evolve' toward it. Default: random.
    +   Mutation Rate

        The higher this number, the more drastic the color mutations.
        Default: 25
    +   Extinction Frequency (Minutes)

        How frequently the target color will automatically change.
        It will be set to a new color. Target color changes tend to
        result in the extinction of most of the Cells. Set to 0 to
        disable. Default: 1.5
    +   Respawn Rate

        How likely cells are to respawn. Setting it to 0 means they'll
        remain dead forever, setting it to 1 means they'll try to
        respawn immediately. Default: .2
    +   Dead Cells Viable

        Equivalent to setting `Respawn Rate` to 1, but the Cells are
        still tinted when they die. You get some nice pictures that way.
        Default: ON
    +   Count Diagonal neighbors

        Include diagonal neighbors when respawning.
        Increases mating pool, prevents squares from forming.
    +   Reset

        Reset the simulation, keeping settings the same.
+   Information
    +   FPS

        The FrameRate achieved by the simulation.
    +   Extinction Countdown

        How many Frames are left until extinction. Someday it will
        count down in minutes...
