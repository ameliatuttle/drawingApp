// The Draw class holds the main functionality of the program. It inniitlaizes instances of the 
// other classes, as well as the functions for drawing on the canvas. 
class Draw {
  // Declarations of properties for the canvas are made here.
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isDrawing: boolean;
  x: number;
  y: number;
  // Declarations of other classes are created here so they can be used in Draw.
  color: Color;
  line: Line;
  save: Save;
  clear: Clear;
  canvasResizer: CanvasResizer;

  // This constructor function takes the canvas as a parameter and then creates instances in 
  // this class of objects and properties. The keyword "this" assigns instances.
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = this.canvas.offsetWidth; // Thist sets the width of the canas so that it fits the screen of the device.
    this.canvas.height = this.canvas.offsetHeight; // Thist sets the height of the canas so that it fits the screen of the device.
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D; // Canvas has different methods so here we call the 2d one.
    this.context.lineJoin = "round"; // These method makes the lines that are drawn more solidly drawn.
    this.context.lineCap = "round"; // ^^^
    this.isDrawing = false;
    this.x = 0;
    this.y = 0;
    // These assign a property in the Draw class, instances of other classes.
    this.color = new Color();
    this.line = new Line(this.canvas);
    this.save = new Save(canvas);
    this.clear = new Clear(canvas, this.context);

    // This section uses "event listeners" like a mouse or touchscreen and gives instructions what to do.
    this.canvas.addEventListener("mousedown",this.startDrawing.bind(this));
    this.canvas.addEventListener("mousemove",this.drawing.bind(this));
    this.canvas.addEventListener("mouseup",this.stopDrawing.bind(this));
    this.canvas.addEventListener("mouseout",this.stopDrawing.bind(this));
    this.canvas.addEventListener("touchstart",this.handleTouchStart.bind(this));
    this.canvas.addEventListener("touchmove",this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend",this.handleTouchEnd.bind(this));
    this.canvas.addEventListener("touchcancel",this.handleTouchEnd.bind(this));

    // This line selects all of the items of class "color-button" and creates a list.
    const colorButtons = document.querySelectorAll(".color-button");
    // If/when a button is clicked the changeColor method is called from the Color class and the line then will change to the new color.
    colorButtons.forEach(button => {button.addEventListener("click", (event) => this.color.changeColor(event));});

    // This creates a CanvasResizer instance after Draw has been fully initialized.
    this.canvasResizer = new CanvasResizer(canvas, this);
  }

  // This method tells the canvas when to start drawing the line.
  startDrawing(event:MouseEvent|TouchEvent) {
    const rect=this.canvas.getBoundingClientRect();
    //  It will be at either a mouse clicking...
    if (event instanceof MouseEvent) {
      this.x = event.clientX-rect.left;
      this.y = event.clientY-rect.top;
    // or a finger touching.
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      this.x = touch.clientX - rect.left;
      this.y = touch.clientY - rect.top;
    }
    this.isDrawing = true;
  }
  
  // This method draws a line untill the stopDrawing method tells it to stop.
  drawing(event:MouseEvent|TouchEvent) {
    if (!this.isDrawing) return;
  
    // This portion calculates what the coordinates are from the information passed from the event listeners
    const rect =this.canvas.getBoundingClientRect();
    const offsetX =(event instanceof MouseEvent? event.clientX : event.touches[0].clientX) - rect.left;
    const offsetY =(event instanceof MouseEvent? event.clientY : event.touches[0].clientY) - rect.top;
  
    // This part actualy draws the line shape.
    const path = new Path2D(); // This is a new instance of Path2d which defines the shape.
    path.moveTo(this.x, this.y);
    path.lineTo(offsetX, offsetY);
  
    // This defines what the color andline thickness is by calling methods from those classes.
    this.context.strokeStyle = this.color.getCurrentColor();
    this.context.lineWidth = this.line.getCurrentLineThickness();
    this.context.stroke(path);
  
    // THis updates the x,y coordinates to the current mouse location.
    this.x = offsetX;
    this.y = offsetY;
  }
  
  // If the boolean isDrawing becomes false(meaning they are no longer clicking the canvas), booloean retuns false and stops the drawing.
  stopDrawing() {
    this.isDrawing = false;
  }

  // The 3 following functions are for error handling on mobile devices. This program works on all devices, however, there was a glitch
  // with phones where when you started drawing the screen would move as if you were trying to move the whole page left and right. These
  // functions turn off that default touch so you can draw.
  handleTouchStart(event:TouchEvent) {
    event.preventDefault();
    this.startDrawing(event);
  }

  handleTouchMove(event:TouchEvent) {
    event.preventDefault();
    this.drawing(event);
  }

  handleTouchEnd(event:TouchEvent) {
    event.preventDefault();
  }
}

// This class handles the color methods for drawing.
class Color {
  // Declares color variable of type string.
  currentColor: string;

  // This constructor defines the above variable, and sets it to black as a default.
  constructor() {
    this.currentColor = "black"; // Default color
  }

  // In the event that a button is selected to change the color, this method is called to change the curent color to the new one. 
  changeColor(event:Event) {
    const button = event.target as HTMLButtonElement; // This determines what button was pushed.
    const color = button.dataset.color; // This retrieves the information from the button.
    if (color) {this.currentColor = `rgb(${color})`;} // This makes sure the input is null then updates currentColor to color.
  }

  // This returns the new color.
  getCurrentColor() {
    return this.currentColor;
  }
}

// This class handles everything to do with line thickness.
class Line {
  // Declare variables.
  lineThickness: number;
  changeThicknessEvent: Event;
  canvas: HTMLCanvasElement;

  //
  constructor(canvas: HTMLCanvasElement) {
    this.lineThickness = 5; // Set default line thickness.
    this.changeThicknessEvent = new Event('lineThicknessChange'); // This creates an event for when theslider has changed.
    this.canvas = canvas;
    
    // This portion gets the element id to have the information about the new value for thickness.
    const lineThicknessSlider = document.getElementById("line-thickness-slider") as HTMLInputElement;
    lineThicknessSlider.addEventListener("input", () => this.changeLineThickness(lineThicknessSlider.value));

    // This gives the innitial sider/thickness position
    this.updateThicknessIndicator();

    // This line listens for when the lineThicknessChange event goes off which was set up above. it then calls the method upDateThicknessIndicator.
    document.addEventListener('lineThicknessChange', () => this.updateThicknessIndicator());
  }

  // This method updates the line thickness. It gets called above when the event listener goes off.
  changeLineThickness(value: string) {
    this.lineThickness = parseInt(value); // This updates the value
    document.dispatchEvent(this.changeThicknessEvent); // This sends the new value off
  }

  // This returns the new thickness value.
  getCurrentLineThickness() {
    return this.lineThickness;
  }

  // This updates the dot under the slider. It represents the current size of you line.
  updateThicknessIndicator() {
    // It gets the element by id, then the slider information by id
    const indicator = document.getElementById("line-thickness-indicator") as HTMLDivElement;
    const slider = document.getElementById("line-thickness-slider") as HTMLInputElement;
    // a new variable is made within the method to hold what the current value of the slider is.
    const thickness = this.getCurrentLineThickness();
    const sliderWidth = slider.clientWidth;
    // Then the width and height are changed to the slider value so we can have a visual representation.
    indicator.style.width = `${thickness}px`; // Set width
    indicator.style.height = `${thickness}px`; // Set height
  }
}

// This class allows you to save the image on the canvas that you drew.
class Save {
  // Declaration for canvas.
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    // This sets an instance of canvas.
    this.canvas = canvas;

    // This gets the save button from the screen by id and if it is hit, the eventListener is triggered and it calls the function saveCanvasImage.
    const saveButton = document.getElementById("save-button") as HTMLButtonElement;
    saveButton.addEventListener("click", () => this.saveCanvasImage());
  }

  // This saves the canvas image by
  saveCanvasImage() {
    const dataUrl = this.canvas.toDataURL("image/png"); // This converts the image on the canvas to downloadable data.
    const link = document.createElement("a");
    link.download = "drawing.png"; // This is the name of the file that is downloaded.
    link.href = dataUrl;
    link.click();
  }
}

class Clear {
  // Declarations:
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;

    // This gets the clear button from the screen by id and if it is hit, the eventListener is triggered and it calls the function clearCanvas.
    const clearButton = document.getElementById("clear-button") as HTMLButtonElement;
    clearButton.addEventListener("click", () => this.clearCanvas());
  }

  // This clears the canvas by using the function clearRect that is a part of the canvas library.
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// This class makes the canvas an appropriate size for whatever device it is displayed on or if the window has been resized.
class CanvasResizer {
  // Declarations:
  canvas: HTMLCanvasElement;
  draw: Draw;

  constructor(canvas: HTMLCanvasElement, draw: Draw) {
    this.canvas = canvas;
    this.draw = draw; // Add an instance of draw if it needs to receate the canvas.

    // This calls for the canvas to be resized in the event that the window has been resized. 
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    this.resizeCanvas();
  }

  // This resizes the canvas to appropriatly fit the new screen/browser dimentions.
  resizeCanvas() {
    const screenWidth = window.innerWidth; // retrieves the window width and sets it to a variable.
    const screenHeight = window.innerHeight; // retireves the window heigth and sets it to a variable
    // Width and height variables are then set to equal 80% of the available space.
    const widthPercentage = 80;
    const heightPercentage = 80;

    // Variables for width and heigth of the canvas are then calculated.
    const canvasWidth = (widthPercentage / 100) * screenWidth;
    const canvasHeight = (heightPercentage / 100) * screenHeight;

    // These lines set this instance of the canvas to the variables fro width and height.
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // After the canvas has been redrawn we need to make sure that the line type is recalled or else it makes the lines very messy.
    this.draw.context.lineJoin = "round";
    this.draw.context.lineCap = "round";
  }
}

// This innitializes the program by adding an even listener for the page being loaded. When that happens it creates an instance of draw and the program starts.
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const draw = new Draw(canvas);
});
