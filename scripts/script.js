var DrawingProgram = /** @class */ (function () {
    function DrawingProgram(canvas) {
        var _this = this;
        this.canvas = canvas;
        this.canvas.width = this.canvas.offsetWidth; // Set canvas width to match container width
        this.canvas.height = this.canvas.offsetHeight; // Set canvas height to match container height
        this.context = canvas.getContext("2d");
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
        var colorButtons = document.querySelectorAll(".color-button");
        colorButtons.forEach(function (button) {
            button.addEventListener("click", function (event) { return _this.colorManager.changeColor(event); });
        });
        // Create CanvasResizer instance after DrawingProgram is fully initialized
        this.canvasResizer = new CanvasResizer(canvas, this);
    }
    DrawingProgram.prototype.startDrawing = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        if (event instanceof MouseEvent) {
            this.lastX = event.clientX - rect.left;
            this.lastY = event.clientY - rect.top;
        }
        else if (event instanceof TouchEvent) {
            var touch = event.touches[0];
            this.lastX = touch.clientX - rect.left;
            this.lastY = touch.clientY - rect.top;
        }
        this.isDrawing = true;
    };
    DrawingProgram.prototype.draw = function (event) {
        if (!this.isDrawing)
            return;
        var rect = this.canvas.getBoundingClientRect();
        var offsetX = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX) - rect.left;
        var offsetY = (event instanceof MouseEvent ? event.clientY : event.touches[0].clientY) - rect.top;
        var path = new Path2D();
        path.moveTo(this.lastX, this.lastY);
        path.lineTo(offsetX, offsetY);
        this.context.strokeStyle = this.colorManager.getCurrentColor();
        this.context.lineWidth = this.lineManager.getCurrentLineThickness();
        this.context.stroke(path);
        this.lastX = offsetX;
        this.lastY = offsetY;
    };
    DrawingProgram.prototype.stopDrawing = function () {
        this.isDrawing = false;
    };
    DrawingProgram.prototype.handleTouchStart = function (event) {
        event.preventDefault(); // Prevent default touch behavior
        this.startDrawing(event);
    };
    DrawingProgram.prototype.handleTouchMove = function (event) {
        event.preventDefault(); // Prevent default touch behavior
        this.draw(event);
    };
    DrawingProgram.prototype.handleTouchEnd = function (event) {
        event.preventDefault(); // Prevent default touch behavior
        this.stopDrawing();
    };
    return DrawingProgram;
}());
var ColorManager = /** @class */ (function () {
    function ColorManager() {
        this.currentColor = "black"; // Default color
    }
    ColorManager.prototype.changeColor = function (event) {
        var button = event.target;
        var color = button.dataset.color;
        if (color) {
            this.currentColor = "rgb(".concat(color, ")");
        }
    };
    ColorManager.prototype.getCurrentColor = function () {
        return this.currentColor;
    };
    return ColorManager;
}());
var LineManager = /** @class */ (function () {
    function LineManager(canvas) {
        var _this = this;
        this.lineThickness = 5; // Default line thickness
        this.changeThicknessEvent = new Event('lineThicknessChange');
        this.canvas = canvas;
        // Add event listener for line thickness slider
        var lineThicknessSlider = document.getElementById("line-thickness-slider");
        lineThicknessSlider.addEventListener("input", function () { return _this.changeLineThickness(lineThicknessSlider.value); });
        // Update indicator position initially
        this.updateThicknessIndicator();
        // Listen for line thickness change event
        document.addEventListener('lineThicknessChange', function () { return _this.updateThicknessIndicator(); });
    }
    LineManager.prototype.changeLineThickness = function (value) {
        this.lineThickness = parseInt(value);
        document.dispatchEvent(this.changeThicknessEvent); // Dispatch event when line thickness changes
    };
    LineManager.prototype.getCurrentLineThickness = function () {
        return this.lineThickness;
    };
    LineManager.prototype.updateThicknessIndicator = function () {
        var indicator = document.getElementById("line-thickness-indicator");
        var slider = document.getElementById("line-thickness-slider");
        var thickness = this.getCurrentLineThickness();
        var sliderWidth = slider.clientWidth;
        indicator.style.width = "".concat(thickness, "px"); // Set width
        indicator.style.height = "".concat(thickness, "px"); // Set height
    };
    return LineManager;
}());
var SaveManager = /** @class */ (function () {
    function SaveManager(canvas) {
        var _this = this;
        this.canvas = canvas;
        // Add event listener for save button
        var saveButton = document.getElementById("save-button");
        saveButton.addEventListener("click", function () { return _this.saveCanvasImage(); });
    }
    SaveManager.prototype.saveCanvasImage = function () {
        var dataUrl = this.canvas.toDataURL("image/png");
        var link = document.createElement("a");
        link.download = "drawing.png";
        link.href = dataUrl;
        link.click();
    };
    return SaveManager;
}());
var ClearManager = /** @class */ (function () {
    function ClearManager(canvas, context) {
        var _this = this;
        this.canvas = canvas;
        this.context = context;
        var clearButton = document.getElementById("clear-button");
        clearButton.addEventListener("click", function () { return _this.clearCanvas(); });
    }
    ClearManager.prototype.clearCanvas = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return ClearManager;
}());
var CanvasResizer = /** @class */ (function () {
    function CanvasResizer(canvas, drawingProgram) {
        this.canvas = canvas;
        this.drawingProgram = drawingProgram; // Store the reference to the DrawingProgram
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.resizeCanvas();
    }
    CanvasResizer.prototype.resizeCanvas = function () {
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;
        var widthPercentage = 80; // Adjust this value to set the desired width percentage of the screen
        var heightPercentage = 80; // Adjust this value to set the desired height percentage of the screen
        var canvasWidth = (widthPercentage / 100) * screenWidth;
        var canvasHeight = (heightPercentage / 100) * screenHeight;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        // After resizing, reapply the line join and line cap properties
        this.drawingProgram.context.lineJoin = "round";
        this.drawingProgram.context.lineCap = "round";
    };
    return CanvasResizer;
}());
document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("canvas");
    var drawingProgram = new DrawingProgram(canvas);
});
