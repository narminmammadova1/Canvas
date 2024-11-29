
import React, { useEffect, useRef, useState } from 'react';
import { SlPencil } from "react-icons/sl";
import { FaUndo, FaRedo } from "react-icons/fa";
import { LuEraser } from "react-icons/lu";
import { TbHttpDelete } from "react-icons/tb";
import { CiImport, CiExport } from "react-icons/ci";

const Canvas = () => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [canvasColor, setCanvasColor] = useState<string>("#ffffff");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(1);
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPen, setIsPen] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [isStart, setIsStart] = useState<boolean>(false);
  const [image, setImage] = useState<any>(null);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
const [isPenColor,setIsPenColor]=useState(false)
const [isBgColor,setIsBgColor]=useState(false)
  useEffect(() => {
    // Tarayıcıda olduğumuzu kontrol ediyoruz
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas && canvas.getContext("2d");

    const savedCanvasColor = sessionStorage.getItem('canvasColor');
    const savedImageData = sessionStorage.getItem('canvasImageData');
    const ctx = ctxRef.current;

    if (savedCanvasColor) {
      setCanvasColor(savedCanvasColor);
      if (canvas && ctx) {
        ctx.fillStyle = savedCanvasColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      setCanvasColor("#ffffff");
      if (canvas && ctx) {
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

  const startDrawing = (e: any) => {
    // setIsPen(false)
    if (canvasRef.current && ctxRef.current) {
      setIsDrawing(true);
      // const { offsetX, offsetY } = e.nativeEvent;
      const { offsetX, offsetY } = e.touches ? e.touches[0] : e.nativeEvent;
      setLastX(offsetX);
      setLastY(offsetY);

      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.strokeStyle = brushColor;
      setIsStart(true);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current || !ctxRef.current) return;
setIsPenColor(false)
setIsBgColor(false)

    // const { offsetX, offsetY } = e.nativeEvent;
    const { offsetX, offsetY } = e.touches ? e.touches[0] : e.nativeEvent;


    if (isEraser && canvasRef.current) {
      ctxRef.current.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
      canvasRef.current.style.backgroundColor = canvasColor;
      setIsStart(true);
    } else if (isPen) {
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
    }

    setLastX(offsetX);
    setLastY(offsetY);
  };

  const stopDrawing = () => {
    if (canvasRef.current && ctxRef.current) {
      setIsDrawing(false);
      ctxRef.current.closePath();
      setDrawingHistory([
        ...drawingHistory,
        ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      ]);
      saveCanvasImage();
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.fillStyle = "#ffffff";
      ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    sessionStorage.removeItem("canvasColor");
    sessionStorage.removeItem("canvasImageData");
    setDrawingHistory([]);
    setRedoHistory([]);
    setIsStart(false);
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
      const ctx = ctxRef.current;
      ctx?.putImageData(lastRedoState, 0, 0);
      setDrawingHistory([...drawingHistory, lastRedoState]);
      setRedoHistory(redoHistory.slice(1));
    }
  };

   const changeBackgroundColor = (color: string) => {
    if (canvasRef.current && ctxRef.current) {
      setCanvasColor(color);
      sessionStorage.setItem('canvasColor', color);
      ctxRef.current.fillStyle = color;
      ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveCanvasImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png");
      sessionStorage.setItem('canvasImageData', dataURL);
    }
  };

  const eraser = () => {
    setIsEraser(true);
    setIsDrawing(false);
    setIsPen(false);
  };

  const pencil = () => {
    setIsEraser(false);
    setIsPen(true);
    setIsPenColor(true)
  };

  const saveImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL || "";
      a.download = "canvas-image.png";
      a.click();
    }
  };

  const refreshPage = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (canvas && ctx) {
      ctxRef.current = canvas.getContext("2d");
    }

    const savedCanvasColor = sessionStorage.getItem('canvasColor');
    const savedImageData = sessionStorage.getItem('canvasImageData');

    if (savedCanvasColor && canvas && ctx) {
      setCanvasColor(savedCanvasColor);
      ctx.fillStyle = savedCanvasColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      setCanvasColor("#ffffff");
      if (canvas && ctx) {
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

  const handleSave = async () => {
    refreshPage();
    saveImage();
  };


  
  
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && ctxRef.current) {
      setIsDrawing(true);
      const { clientX, clientY } = e.touches[0]; 
            const rect = canvasRef.current.getBoundingClientRect(); 
  
      const offsetX = clientX - rect.left; 
      const offsetY = clientY - rect.top;
  
      setLastX(offsetX);
      setLastY(offsetY);
  
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.strokeStyle = brushColor;
      setIsStart(true);
    }
  };
  
  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !ctxRef.current) return;
  
    const { clientX, clientY } = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect(); // Canvas'ın sayfadaki konumunu alıyoruz
  
    const offsetX = clientX - rect.left; // Konum farkını hesaplıyoruz
    const offsetY = clientY - rect.top;
  
    if (isEraser) {
      ctxRef.current.clearRect(offsetX - eraserSize / 2, offsetY - eraserSize / 2, eraserSize, eraserSize);
    } else if (isPen) {
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
    }
  
    setLastX(offsetX);
    setLastY(offsetY);
  };
  
  const stopTouchDrawing = () => {
    if (canvasRef.current && ctxRef.current) {
      setIsDrawing(false);
      ctxRef.current.closePath();
      setDrawingHistory([
        ...drawingHistory,
        ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      ]);
      saveCanvasImage();
    }
  };
  
 
  






  return (
    <div className="flex h-screen">
      <div className="flex flex-col justify-between items-center bg-gray-100  w-[80px] px-4 py-4">
<div className=' relative'>

<button className="text-xl font-bold" onClick={()=>{
  setIsBgColor(true)
}}>
        BG
        </button>
        {isBgColor && (<input type="color"
          value={canvasColor}
        onChange={(e) => changeBackgroundColor(e.target.value)}
        className=' absolute top-6 right-[-10px]' />
)}
</div>
    
<button className="text-xl" onClick={clearCanvas}>
          <TbHttpDelete className="cursor-pointer" size={30} />
        </button>
        <button className="text-xl" onClick={undo}>
          <FaUndo className="cursor-pointer" size={30} />
        </button>
        <button className="text-xl" onClick={redo}>
          <FaRedo className="cursor-pointer" size={30} />
        </button>
        <button className="text-xl" onClick={eraser}>
          <LuEraser className="cursor-pointer" size={30} />
        </button>


        <div className=' relative'>
        <button className="text-xl relative" onClick={pencil}>
          <SlPencil className="cursor-pointer" size={30} />
        </button>
        {isPenColor && (<div>
          <input type="color" 
          value={brushColor}
         onChange={(e) => setBrushColor(e.target.value)}
        className='  z-20  absolute  top-10 right-[-10px] ' />
        <input type="range" 
        min="1"
        max="50"
          value={brushSize}
         onChange={(e) => setBrushSize(Number(e.target.value))}
        className='  z-20  absolute  top-16 w-12 right-[-10px] ' />


        </div>  
        
        )}
         
        </div>
     
        <button className="text-xl" onClick={handleSave}>
          <CiExport className="cursor-pointer" size={30} />
        </button>
        <button className="text-xl" onClick={() => setModal(true)}>
          <CiImport className="cursor-pointer" size={30} />
        </button>
      </div>

      <div className="canvas-container relative overflow-hidden flex-1">
        <canvas
          ref={canvasRef}
          width={windowWidth}
          height={windowHeight}
          style={{
            border: "1px solid #000000",
            backgroundColor: canvasColor,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startTouchDrawing}  
          onTouchMove={drawTouch}         
          onTouchEnd={stopTouchDrawing}  
        />
      </div>
    </div>
  );
};

export default Canvas;


