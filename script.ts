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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.context.lineCap = 'round';
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
    const colorButtons = document.querySelectorAll(".colorButton");
    colorButtons.forEach(button => {
      button.addEventListener("click", (event) => this.colorManager.changeColor(event));
    });
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      this.lastX = touch.clientX - this.canvas.offsetLeft;
      this.lastY = touch.clientY - this.canvas.offsetTop;
    }
    this.isDrawing = true;
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    const offsetX = event instanceof MouseEvent ? event.offsetX : event.touches[0].clientX - this.canvas.offsetLeft;
    const offsetY = event instanceof MouseEvent ? event.offsetY : event.touches[0].clientY - this.canvas.offsetTop;
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
    this.startDrawing(event);
  }

  handleTouchMove(event: TouchEvent) {
    this.draw(event);
  }

  handleTouchEnd(event: TouchEvent) {
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
    const lineThicknessSlider = document.getElementById("lineThicknessSlider") as HTMLInputElement;
    lineThicknessSlider.addEventListener("input", () => this.changeLineThickness(lineThicknessSlider.value));

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
    const indicator = document.getElementById("lineThicknessIndicator") as HTMLDivElement;
    const thickness = this.getCurrentLineThickness();
    const sliderWidth = this.canvas.clientWidth;
    const offset = (thickness / 2) / sliderWidth * 100; // Calculate offset as percentage of slider width
    indicator.style.left = `calc(${this.lineThickness}% - ${offset}px)`; // Set left position
    indicator.style.width = `${thickness}px`; // Set width
    indicator.style.height = `${thickness}px`; // Set height
  }
}

class SaveManager {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Add event listener for save button
    const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
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

    const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
    clearButton.addEventListener("click", () => this.clearCanvas());
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  new DrawingProgram(canvas);
});
