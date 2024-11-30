
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
const [isEraserSize,setIsEraserSize]=useState(false)

  useEffect(() => {
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
      setIsEraserSize(false)
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
    setIsEraserSize(true)
    setIsDrawing(false);
    setIsPen(false);
    setIsPenColor(false)
  };

  const pencil = () => {
    setIsEraser(false);
    setIsPen(true);
    setIsPenColor(true)
    setIsEraserSize(false)
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

  const handleSave = async() => {
        refreshPage()
        
    
       setTimeout(() => {
      
       setModal(true)
    
       }, 100);
         
     };

  
  
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
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
   e.preventDefault()
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
  
 
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
  
        if (typeof result === 'string') {
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            
            // Yeni resmi çizmeden önce canvas'ı temizle
            if (canvas && ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
  
              // Resmin canvas boyutlarına sığacak şekilde yeniden boyutlandırılması
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;
  
              const imageAspectRatio = img.width / img.height;
              let imgWidth = canvasWidth;
              let imgHeight = imgWidth / imageAspectRatio;
  
              // Resmin yüksekliği canvas'ın yüksekliğini aşarsa, boyutları yeniden ayarla
              if (imgHeight > canvasHeight) {
                imgHeight = canvasHeight;
                imgWidth = imgHeight * imageAspectRatio;
              }
  
              // Resmi canvas üzerine ortalayarak çiz
              const x = (canvasWidth - imgWidth) / 2;
              const y = (canvasHeight - imgHeight) / 2;
  
              ctx.drawImage(img, x, y, imgWidth, imgHeight);
            }
          };
        }
      };
  
      reader.readAsDataURL(file);
    }
  
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };






  return (
    <div className="flex max-h-screen h-screen border-4 border-gray-800">
      <div className="flex max-h-full flex-col justify-between items-center bg-gray-100  w-[80px] px-4 py-2">
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
        <div className=' relative'>
        <button className="text-xl" onClick={eraser}>
          <LuEraser className="cursor-pointer" size={30} />
        </button>
{isEraserSize && ( <input type="range" 
        min="1"
        max="50"
          value={eraserSize}
         onChange={(e) => setEraserSize(Number(e.target.value))}
        className='  z-20  absolute  top-8 w-12 right-[-10px] ' />)}

        </div>
      

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
        
       

        <div className=' relative'>

        <button className="text-xl">
          <CiImport className="cursor-pointer" size={30} />

          <input 
         className='w-8  rounded-full  top-0   right-0 cursor-pointer  opacity-0  absolute' type="file"
         //  accept="*/*"

         accept="image/*"
             
         onChange={handleImageUpload} />

        </button> 
        </div>
      </div>
      {loading && (
    <div className="loading-overlay z-50 fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-600 opacity-50">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
       </div>
     )}


 {modal && (   <div className=' bg-red-800 w-full  fixed flex justify-center items-center top-0 right-0 min-h-full bg-opacity-50'>
    <div className='w-[30%] h-[150px] flex justify-center items-center rounded-md bg-black '>
       <div className='flex gap-4  m-auto'>
         <button onClick={()=>{saveImage()
        setLoading(true)
       setTimeout(()=>{

           setModal(false)
          setLoading(false)
        },1000)

         } } className=' w-28 h-8 rounded-md bg-white'>Save image</button>
       <button onClick={()=>{setModal(false)}} className='  w-28 h-8  rounded-md bg-red-600'>Cancel</button>
     </div>
    </div>
  </div>
 )} 

      <div className="canvas-container max-h-full overflow-hidden flex-1">
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









