
let canvas=document.querySelector("canvas");
//canvas dimensions
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const tool=canvas.getContext("2d");


let isMouseDown=false;
let undoStack=[];
let redoStack=[];
canvas.addEventListener("mousedown",function(e){
    console.log('mouse down x:', e.clientX,'y',e.clientY);
    tool.beginPath();
    let x=e.clientX, y=getYcoordinate(e.clientY);
    tool.moveTo(x,y);
    isMouseDown=true;
    let pointDesc={
        x: x,
        y:y,
        desc:"md",
    }
    undoStack.push(pointDesc);
    socket.emit("md", pointDesc);
})
canvas.addEventListener('mousemove',function(e){
    
    if(isMouseDown){
        let x=e.clientX, y=getYcoordinate(e.clientY);
        tool.lineTo(x,y);
        tool.stroke();
        let pointDesc={
            x: x,
            y:y,
            desc:"mm",
        }
        undoStack.push(pointDesc);
        socket.emit("mm", pointDesc);
    }

})

canvas.addEventListener('mouseup',function(e){
    isMouseDown=false;
})

function getYcoordinate(y){
    let bounds=canvas.getBoundingClientRect();
    return y-bounds.y;
}

let tools=document.querySelectorAll(".tool-image");
console.log(tools.length);
for(let val of tools){
    val.addEventListener("click", function (e){
        let ctool=e.currentTarget;
        let name=ctool.getAttribute("id");
        if(name=='pencil'){
            tool.strokeStyle='black';
            tool.strokeStyle="bold";
        }else if(name=='eraser'){
            tool.strokeStyle='white';
            
        }else if(name=='stickyPad'){
            create_stickyPad();
            
        }else if(name=="redo"){
            redoMaker();
        }else if(name=="undo"){
            undoMaker();
        }else if(name=="download"){
                downloadBoard();
        }
    })
}
function creatBox(){
    let stickyPad=document.createElement("div");
    let nav_bar=document.createElement("div");
    let textArea=document.createElement("div");
    let close=document.createElement("div");
    let minimize=document.createElement("div");
    stickyPad.setAttribute("class","stickypad");
    nav_bar.setAttribute("class","nav-bar");
    close.setAttribute("class","close");
    minimize.setAttribute("class","minimize");
    textArea.setAttribute("class","text-area");
    stickyPad.appendChild(nav_bar);
    stickyPad.appendChild(textArea);
    nav_bar.appendChild(minimize);
    nav_bar.appendChild(close);
    document.body.appendChild(stickyPad);
      
    let isStickyDown=false;
    let isMinimize=false;
    let initialX=null;
    let initialY=null;


nav_bar.addEventListener("mousedown",function(e){
    initialX=e.clientX;
    initialY=e.clientY;
    isStickyDown=true;
})

canvas.addEventListener("mousemove",function(e){
    if(isStickyDown){
        let finalX=e.clientX;
        let finalY=e.clientY;
        let dx=finalX-initialX;
        let dy=finalY-initialY;
        let {top,left}=stickyPad.getBoundingClientRect();
        stickyPad.style.top=top+dy+"px";
        stickyPad.style.left=left+dx+"px";
        initialX=finalX;
        initialY=finalY;
    }
})

window.addEventListener("mouseup",function(e){
    isStickyDown=false;
})
minimize.addEventListener("click",function(e){
    if(isMinimize){
        textArea.style.display="none";
    }else{
        textArea.style.display="block";
    }
    isMinimize=!isMinimize;
})
close.addEventListener("click",function(e){
    stickyPad.remove();
})

    return textArea;
}
function create_stickyPad(){
    let textArea=creatBox();
    let textBox=document.createElement("textarea");
    textBox.setAttribute("class","textarea");
    textArea.appendChild(textBox);

  

}

//*****undo********/
let interval=null;
function undoMaker(){
    tool.clearRect(0,0,canvas.width,canvas.height);
    while(undoStack.length>0){
        let curObj=undoStack[undoStack.length-1];
        if(curObj.desc=='md'){
            redoStack.push(undoStack.pop());
            interval = setInterval(function() {
            socket.emit("undo");}, 50);
            break;
        }else{
            redoStack.push(undoStack.pop());
            clearInterval(interval);
        }
    }
    
    redraw();
}
//******redo******/
function redoMaker(){
    tool.clearRect(0,0,canvas.width,canvas.height);
    while(redoStack.length>0){
        let curObj=redoStack[redoStack.length-1];
        if(curObj.desc=='md'){
            undoStack.push(redoStack.pop());
            interval = setInterval(function() {
                 socket.emit("redo");
              }, 50);
            break;
        }else{
            undoStack.push(redoStack.pop());
            clearInterval(interval);
        }
    }
    redraw();
}

//***redraw *****/
function redraw(){
    for(let val of undoStack){
        let{x,y,desc}=val;
        if(desc=='md'){
            tool.beginPath();
            tool.moveTo(x,y);
        }else{
            tool.lineTo(x,y);
            tool.stroke();
        }
    }
}

//*** Download**** */
function downloadBoard(){
    let a=document.createElement("a");
    a.download="file.png";
    let url=canvas.toDataURL("image/png;base64");
    a.href=url;
    a.click();
    a.remove();
}

//**file upload*** */
let input=document.querySelector("#input");
input.addEventListener("click",function(){
    input.addEventListener("change",function(){
        let imgObj=input.files[0];
        let imgLink=URL.createObjectURL(imgObj);
        let textBox=creatBox();
        let img=document.createElement("img");
        img.setAttribute("class","img-upload");
        img.src=imgLink;
        textBox.appendChild(img);
    })
})

/*socket.on("onsize", function(size) {
    ctx.lineWidth = size;
  });
  socket.on("oncolor", function(color) {
    ctx.strokeStyle = color;
  });*/
 
 