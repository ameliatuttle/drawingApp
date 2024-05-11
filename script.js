var DrawingProgram = /** @class */ (function () {
    function DrawingProgram(canvas) {
        var _this = this;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
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
        var colorButtons = document.querySelectorAll(".colorButton");
        colorButtons.forEach(function (button) {
            button.addEventListener("click", function (event) { return _this.colorManager.changeColor(event); });
        });
    }
    DrawingProgram.prototype.startDrawing = function (event) {
        if (event instanceof MouseEvent) {
            this.lastX = event.offsetX;
            this.lastY = event.offsetY;
        }
        else if (event instanceof TouchEvent) {
            var touch = event.touches[0];
            this.lastX = touch.clientX - this.canvas.offsetLeft;
            this.lastY = touch.clientY - this.canvas.offsetTop;
        }
        this.isDrawing = true;
    };
    DrawingProgram.prototype.draw = function (event) {
        if (!this.isDrawing)
            return;
        var offsetX = event instanceof MouseEvent ? event.offsetX : event.touches[0].clientX - this.canvas.offsetLeft;
        var offsetY = event instanceof MouseEvent ? event.offsetY : event.touches[0].clientY - this.canvas.offsetTop;
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
        this.startDrawing(event);
    };
    DrawingProgram.prototype.handleTouchMove = function (event) {
        this.draw(event);
    };
    DrawingProgram.prototype.handleTouchEnd = function (event) {
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
        var lineThicknessSlider = document.getElementById("lineThicknessSlider");
        lineThicknessSlider.addEventListener("input", function () { return _this.changeLineThickness(lineThicknessSlider.value); });
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
        var indicator = document.getElementById("lineThicknessIndicator");
        var thickness = this.getCurrentLineThickness();
        var sliderWidth = this.canvas.clientWidth;
        var offset = (thickness / 2) / sliderWidth * 100; // Calculate offset as percentage of slider width
        indicator.style.left = "calc(".concat(this.lineThickness, "% - ").concat(offset, "px)"); // Set left position
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
        var saveButton = document.getElementById("saveButton");
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
        var clearButton = document.getElementById("clearButton");
        clearButton.addEventListener("click", function () { return _this.clearCanvas(); });
    }
    ClearManager.prototype.clearCanvas = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return ClearManager;
}());
document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("canvas");
    new DrawingProgram(canvas);
});
