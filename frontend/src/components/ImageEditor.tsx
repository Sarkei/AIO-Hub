'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, Line, Rect, Circle, IText, FabricObject } from 'fabric';

interface ImageEditorProps {
  imageUrl: string;
  fileId: string;
  onClose: () => void;
  onSave?: (canvas: Canvas) => void;
}

type DrawingMode = 'select' | 'pen' | 'line' | 'rectangle' | 'circle' | 'text';

export default function ImageEditor({ imageUrl, fileId, onClose, onSave }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [mode, setMode] = useState<DrawingMode>('select');
  const [color, setColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Canvas initialisieren
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    // Bild laden
    FabricImage.fromURL(imageUrl).then((img) => {
      // Bild skalieren um in Canvas zu passen
      const scale = Math.min(
        fabricCanvas.width! / img.width!,
        fabricCanvas.height! / img.height!
      );
      
      img.scale(scale);
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      fabricCanvas.backgroundImage = img;
      fabricCanvas.renderAll();
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!canvas) return;

    // Drawing Mode umschalten
    canvas.isDrawingMode = mode === 'pen';

    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = strokeWidth;
    }

    // Event Listener für andere Modi
    if (mode !== 'pen' && mode !== 'select') {
      let isDown = false;
      let startX = 0;
      let startY = 0;
      let activeShape: FabricObject | null = null;

      const onMouseDown = (o: any) => {
        isDown = true;
        const pointer = canvas.getPointer(o.e);
        startX = pointer.x;
        startY = pointer.y;

        if (mode === 'line') {
          activeShape = new Line([startX, startY, startX, startY], {
            stroke: color,
            strokeWidth: strokeWidth,
          });
        } else if (mode === 'rectangle') {
          activeShape = new Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            stroke: color,
            strokeWidth: strokeWidth,
            fill: 'transparent',
          });
        } else if (mode === 'circle') {
          activeShape = new Circle({
            left: startX,
            top: startY,
            radius: 0,
            stroke: color,
            strokeWidth: strokeWidth,
            fill: 'transparent',
          });
        } else if (mode === 'text') {
          const text = new IText('Text eingeben', {
            left: startX,
            top: startY,
            fill: color,
            fontSize: 20,
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          return;
        }

        if (activeShape) {
          canvas.add(activeShape);
        }
      };

      const onMouseMove = (o: any) => {
        if (!isDown || !activeShape) return;
        
        const pointer = canvas.getPointer(o.e);

        if (mode === 'line' && activeShape instanceof Line) {
          activeShape.set({ x2: pointer.x, y2: pointer.y });
        } else if (mode === 'rectangle' && activeShape instanceof Rect) {
          activeShape.set({
            width: Math.abs(pointer.x - startX),
            height: Math.abs(pointer.y - startY),
          });
        } else if (mode === 'circle' && activeShape instanceof Circle) {
          const radius = Math.sqrt(
            Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
          );
          activeShape.set({ radius: radius / 2 });
        }

        canvas.renderAll();
      };

      const onMouseUp = () => {
        isDown = false;
        activeShape = null;
      };

      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      canvas.on('mouse:up', onMouseUp);

      return () => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
      };
    }
  }, [canvas, mode, color, strokeWidth]);

  const handleClear = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach((obj: FabricObject) => {
      if (!(obj instanceof FabricImage)) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const handleUndo = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const handleSave = () => {
    if (!canvas || !onSave) return;
    onSave(canvas);
  };

  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = 'annotated-image.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bild bearbeiten</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Speichern
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Schließen
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Drawing Modes */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('select')}
              className={`px-3 py-2 rounded ${mode === 'select' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              ✋ Auswählen
            </button>
            <button
              onClick={() => setMode('pen')}
              className={`px-3 py-2 rounded ${mode === 'pen' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              ✏️ Stift
            </button>
            <button
              onClick={() => setMode('line')}
              className={`px-3 py-2 rounded ${mode === 'line' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              📏 Linie
            </button>
            <button
              onClick={() => setMode('rectangle')}
              className={`px-3 py-2 rounded ${mode === 'rectangle' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              ▭ Rechteck
            </button>
            <button
              onClick={() => setMode('circle')}
              className={`px-3 py-2 rounded ${mode === 'circle' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              ⭕ Kreis
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-2 rounded ${mode === 'text' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              T Text
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <label className="text-sm">Farbe:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <label className="text-sm">Stärke:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm w-8">{strokeWidth}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              className="px-3 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              ↶ Rückgängig
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              🗑️ Alles löschen
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-800 p-8 flex justify-center items-center">
        <canvas ref={canvasRef} className="border border-gray-600" />
      </div>
    </div>
  );
}
