class DrawingProgram {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  colorManager: ColorManager;
  lineManager: LineManager;
  saveManager: SaveManager;
  clearManager: ClearManager;
  canvasResizer: CanvasResizer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = this.canvas.offsetWidth; // Set canvas width to match container width
    this.canvas.height = this.canvas.offsetHeight; // Set canvas height to match container height
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.context.lineJoin = "round";
    this.context.lineCap = "round";
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.colorManager = new ColorManager();
    this.lineManager = new LineManager(this.canvas);
    this.saveManager = new SaveManager(canvas);
    this.clearManager = new ClearManager(canvas, this.context);

    this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.addEventListener("mousemove", this.draw.bind(this));
    this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));
    this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
    this.canvas.addEventListener("touchcancel", this.handleTouchEnd.bind(this));

    // Add event listeners for color buttons
    const colorButtons = document.querySelectorAll(".color-button");
    colorButtons.forEach(button => {
      button.addEventListener("click", (event) => this.colorManager.changeColor(event));
    });

    // Create CanvasResizer instance after DrawingProgram is fully initialized
    this.canvasResizer = new CanvasResizer(canvas, this);
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    const rect = this.canvas.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      this.lastX = touch.clientX - rect.left;
      this.lastY = touch.clientY - rect.top;
    }
    this.isDrawing = true;
  }
  
  
  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
  
    const rect = this.canvas.getBoundingClientRect();
    const offsetX = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX) - rect.left;
    const offsetY = (event instanceof MouseEvent ? event.clientY : event.touches[0].clientY) - rect.top;
  
    const path = new Path2D();
    path.moveTo(this.lastX, this.lastY);
    path.lineTo(offsetX, offsetY);
  
    this.context.strokeStyle = this.colorManager.getCurrentColor();
    this.context.lineWidth = this.lineManager.getCurrentLineThickness();
    this.context.stroke(path);
  
    this.lastX = offsetX;
    this.lastY = offsetY;
  }
  
  
  
  stopDrawing() {
    this.isDrawing = false;
  }

  handleTouchStart(event: TouchEvent) {
    event.preventDefault(); // Prevent default touch behavior
    this.startDrawing(event);
  }

  handleTouchMove(event: TouchEvent) {
    event.preventDefault(); // Prevent default touch behavior
    this.draw(event);
  }

  handleTouchEnd(event: TouchEvent) {
    event.preventDefault(); // Prevent default touch behavior
    this.stopDrawing();
  }
}

class ColorManager {
  currentColor: string;

  constructor() {
    this.currentColor = "black"; // Default color
  }

  changeColor(event: Event) {
    const button = event.target as HTMLButtonElement;
    const color = button.dataset.color;
    if (color) {
      this.currentColor = `rgb(${color})`;
    }
  }

  getCurrentColor() {
    return this.currentColor;
  }
}

class LineManager {
  lineThickness: number;
  changeThicknessEvent: Event;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.lineThickness = 5; // Default line thickness
    this.changeThicknessEvent = new Event('lineThicknessChange');
    this.canvas = canvas;
    

    // Add event listener for line thickness slider
    const lineThicknessSlider = document.getElementById("line-thickness-slider") as HTMLInputElement;
    lineThicknessSlider.addEventListener("input", () => this.changeLineThickness(lineThicknessSlider.value));

    // Update indicator position initially
    this.updateThicknessIndicator();
    // Listen for line thickness change event
    document.addEventListener('lineThicknessChange', () => this.updateThicknessIndicator());
  }

  changeLineThickness(value: string) {
    this.lineThickness = parseInt(value);
    document.dispatchEvent(this.changeThicknessEvent); // Dispatch event when line thickness changes
  }

  getCurrentLineThickness() {
    return this.lineThickness;
  }

  updateThicknessIndicator() {
    const indicator = document.getElementById("line-thickness-indicator") as HTMLDivElement;
    const slider = document.getElementById("line-thickness-slider") as HTMLInputElement;
    const thickness = this.getCurrentLineThickness();
    const sliderWidth = slider.clientWidth;
    indicator.style.width = `${thickness}px`; // Set width
    indicator.style.height = `${thickness}px`; // Set height
  }
}


class SaveManager {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Add event listener for save button
    const saveButton = document.getElementById("save-button") as HTMLButtonElement;
    saveButton.addEventListener("click", () => this.saveCanvasImage());
  }

  saveCanvasImage() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = dataUrl;
    link.click();
  }
}

class ClearManager {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;

    const clearButton = document.getElementById("clear-button") as HTMLButtonElement;
    clearButton.addEventListener("click", () => this.clearCanvas());
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class CanvasResizer {
  canvas: HTMLCanvasElement;
  drawingProgram: DrawingProgram; // Add a reference to the DrawingProgram

  constructor(canvas: HTMLCanvasElement, drawingProgram: DrawingProgram) {
    this.canvas = canvas;
    this.drawingProgram = drawingProgram; // Store the reference to the DrawingProgram
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    this.resizeCanvas();
  }

  resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const widthPercentage = 80; // Adjust this value to set the desired width percentage of the screen
    const heightPercentage = 80; // Adjust this value to set the desired height percentage of the screen

    const canvasWidth = (widthPercentage / 100) * screenWidth;
    const canvasHeight = (heightPercentage / 100) * screenHeight;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // After resizing, reapply the line join and line cap properties
    this.drawingProgram.context.lineJoin = "round";
    this.drawingProgram.context.lineCap = "round";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const drawingProgram = new DrawingProgram(canvas);
});

