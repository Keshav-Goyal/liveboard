socket.on("onmousedown", function(point) {    
    canvas.beginPath();
    canvas.moveTo(point.x, point.y);
    undoStack.push(point);
  });
  socket.on("onmousemove", function(point) {
    
    canvas.lineTo(point.x, point.y);
    canvas.stroke();
    undoStack.push(point);
  });
  socket.on("onundo", function() {
    undoMaker();
  });
  socket.on("onredo", function() {
    redoMaker();
  });