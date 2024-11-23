import React, { useEffect, useRef, useState } from 'react';
import { SlPencil } from "react-icons/sl";
import { FaUndo,FaRedo } from "react-icons/fa";
import { LuEraser } from "react-icons/lu";
import { TbHttpDelete } from "react-icons/tb";
import { CiImport,CiExport } from "react-icons/ci";

const Canvas = () => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [canvasColor, setCanvasColor] = useState<string>("#ffffff");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number >(5);
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
const[ispen,setIspen]=useState<boolean>(false)
const [modal,setModal]=useState<boolean>(false)
const [isStart,setIsStart]=useState<boolean>(false)
const [image, setImage] = useState <any >(null);
const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);



useEffect(() => {
  const canvas = canvasRef.current;
  ctxRef.current =  canvas &&canvas.getContext("2d");

  const savedCanvasColor = sessionStorage.getItem('canvasColor');
  const savedImageData = sessionStorage.getItem('canvasImageData');
  const ctx = ctxRef.current;

  if (savedCanvasColor) {
    setCanvasColor(savedCanvasColor);
    if(canvas && ctx){
      ctx.fillStyle = savedCanvasColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

    }
   
  } else {
    setCanvasColor("#ffffff");
    const ctx = ctxRef.current;
    if(ctx && canvas){
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
  }

  if (savedImageData) {
    const image = new Image();
    image.src = savedImageData;
    image.onload = () => {
      ctx?.drawImage(image, 0, 0);
    };
  }
}, []);









  const startDrawing = (e:any) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setLastX(offsetX);
    setLastY(offsetY);
if(ctxRef.current ){
  ctxRef.current.beginPath();
  ctxRef.current.moveTo(offsetX, offsetY);
  ctxRef.current.lineWidth = brushSize ;
  ctxRef.current.strokeStyle = brushColor
  setIsStart(true)

}
   

  };

  const draw = (e:any) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (isEraser && ctxRef.current && canvasRef.current) {
ctxRef.current.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
canvasRef.current.style.backgroundColor = canvasColor;
setIsStart(true)
} 
if(ispen) {
      ctxRef.current?.lineTo(offsetX, offsetY);
      ctxRef.current?.stroke();
    }
    
    setLastX(offsetX);
    setLastY(offsetY);
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    if(ctxRef.current && canvasRef.current){
      ctxRef.current.closePath();

      setDrawingHistory([
        ...drawingHistory,
        ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      ]);

    }
   
    saveCanvasImage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if(ctx && canvas){

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  

    sessionStorage.removeItem("canvasColor");
    sessionStorage.removeItem("canvasImageData");

    setDrawingHistory([]);
    setRedoHistory([])
    setIsStart(false)
  };




  const undo = () => {
    if (drawingHistory.length > 0) {
      const lastState = drawingHistory[drawingHistory.length - 1]; 
      const ctx = ctxRef.current;
      
      ctx?.putImageData(lastState, 0, 0);  
      setDrawingHistory(drawingHistory.slice(0, -1));  
      setRedoHistory([lastState, ...redoHistory]);  
    }
  };
  
  const redo = () => {
    if (redoHistory.length > 0) {
      const lastRedoState = redoHistory[0];  
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
  
      ctx?.putImageData(lastRedoState, 0, 0);  
      setDrawingHistory([...drawingHistory, lastRedoState]); 
      setRedoHistory(redoHistory.slice(1));  
    }
  };







  
  const changeBackgroundColor = (color:string) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    setCanvasColor(color);
    sessionStorage.setItem('canvasColor', color);
if(ctx && canvas){
  ctx.fillStyle = color;
  ctx?.fillRect(0, 0, canvas.width, canvas.height);
}
  
  };

  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas?.toDataURL("image/png") || "";
    sessionStorage.setItem('canvasImageData', dataURL);
  };

  const eraser = () => {
    setIsEraser(true);
    setIsDrawing(false);
    setIspen(false)

  };

  const pencil = () => {
    setIsEraser(false);
setIspen(true)
    
  };



  const saveImage = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
  
  
    const dataURL = canvas?.toDataURL("image/png");
  
    const a = document.createElement("a");
    a.href = dataURL || "";
    a.download = "canvas-image.png";

      
    a.click();


  };

  
  const refreshPage = () => {
   

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
if(canvas){    ctxRef.current = canvas.getContext("2d") ;
}

    const savedCanvasColor = sessionStorage.getItem('canvasColor');
    const savedImageData = sessionStorage.getItem('canvasImageData');

    if (savedCanvasColor && ctx && canvas) {
      setCanvasColor(savedCanvasColor);
      ctx.fillStyle = savedCanvasColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      setCanvasColor("#ffffff");
      const ctx = ctxRef.current;
if(ctx && canvas){

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
    }

    if (savedImageData && ctx) {
      const image = new Image();
      image.src = savedImageData;
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
    }
  };


  const handleSave = async() => {
    refreshPage()
    

    setTimeout(() => {
  
    setModal(true)

   }, 100);
     
  };


  const handleImageUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {

        const result=event.target?.result

        if (typeof result === 'string'){  const img = new Image();
          img.src = result
          img.onload = () => {
            setImage(img); 
          };
        }
      
       

       
      };
  
      reader.readAsDataURL(file);
    }

    setLoading(true)
  setTimeout(()=>{
    setLoading(false)
  },1000)
  };
 
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");


    if (image && canvas  ) {
  
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
  
      ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  }, [image]); 





const disabledChange=isStart
  return (
    <div className='flex border-4 border-sky-800'>
      <canvas
        className={`border-4 border-zinc-500 ${isEraser ? "cursor-eraser" : ispen ? "cursor-pen": ""} `}
        ref={canvasRef}
        width={1000}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      <div className="controls bg-slate-400 w-1/4">
      <div className='controls2 bg-slate-600 flex flex-col justify-end items-end'>
        <div className='flex  justify-center w-full gap-4 '>
        <button  title="back" className='p-2 border-2 rounded-full' onClick={undo}><FaUndo color='blue' /></button>
        <button  title="back" className='p-2 border-2 rounded-full' onClick={redo}><FaRedo color='blue' /></button>
        </div>
      <div className='mb-6 mt-6 flex justify-end me-4 gap-4  w-full'>
          <label 
           className='flex justify-start items-center gap-2'

            htmlFor="colorPickerCanvas">Background Color: </label>
          <input
           title="change it before drawing" 
            className={`w-[40%] ${disabledChange ? "opacity-50 cursor-not-allowed" : ""}`}
            type="color"
            id="colorPickerCanvas"
            value={canvasColor}
            onChange={(e) => changeBackgroundColor(e.target.value)}
            disabled={disabledChange}
          />
        </div>

        <div className='mb-6 flex justify-end gap-4  me-4 w-full'>
          <label className='flex justify-start items-center gap-2' htmlFor="colorPicker"><SlPencil />Pen Color: </label>
          <input
           title="change color" 
            className='w-[40%]'
            type="color"
            id="colorPicker"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
          />
        </div>

        <div className='mb-6 me-4 flex justify-end gap-6'>
          <label className='flex items-center justify-start gap-2' htmlFor="brushSize"><SlPencil />Pen Size: </label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>

        <div className='flex w-full justify-between px-4 '>
        <button  title="draw" onClick={pencil} className='p-2 border-2 rounded-full'><SlPencil /></button>


          <button  title="eraser" onClick={eraser} className='p-2 border-2 rounded-full'><LuEraser /></button>
          <button  title="clear all" className='p-2 border-2 rounded-full' onClick={clearCanvas}><TbHttpDelete color='white' size={16} /></button>
          <button
           title="import image"
           className='p-2 border-2 rounded-full  relative' >
            
            <CiImport />
            <input 
             className='w-8  rounded-full  top-0   right-0 cursor-pointer opacity-0  absolute' type="file"
            //  accept="*/*"

             accept="image/*"
             
             onChange={handleImageUpload}    />

          </button>


          <button  title="save draft" className='p-2 border-2 rounded-full' onClick={handleSave}><CiExport />


</button>
        </div>


      </div>


        {isEraser && (
          <div className="mb-6 mt-4 flex justify-start gap-6 ms-6 ">
            <label className="flex items-center justify-start gap-2" htmlFor="eraserSize"><LuEraser />Eraser Size </label>
            <input
              type="range"
              id="eraserSize"
              min="10"
              max="100"
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
            />
          </div>
        )}
      </div>


      {loading && (
        <div className="loading-overlay z-50 fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-600 opacity-50">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
        </div>
      )}

{modal && (
  <div className='bg-gray-400 fixed flex justify-center items-center top-0 right-0 w-full min-h-full bg-opacity-50'>
    <div className='w-[30%] h-[150px] flex justify-center items-center rounded-md bg-black '>
      <div className='flex gap-4  m-auto'>
        <button onClick={()=>{saveImage()
        setLoading(true)
        setTimeout(()=>{

          setModal(false)
          setLoading(false)
        },1000)
        //

        } } className=' w-28 h-8 rounded-md bg-white'>Save image</button>
        <button onClick={()=>{setModal(false)}} className='  w-28 h-8  rounded-md bg-red-600'>Cancel</button>
      </div>
    </div>
  </div>
)}
    
    </div>
  );
};

export default Canvas;



