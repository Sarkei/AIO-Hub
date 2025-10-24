'use client';

import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// PDF.js Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileId: string;
  onClose: () => void;
  onSaveAnnotations?: (annotations: any) => void;
}

export default function PDFViewer({ fileUrl, fileId, onClose, onSaveAnnotations }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleSave = async () => {
    if (onSaveAnnotations) {
      await onSaveAnnotations(annotations);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">PDF Viewer</h2>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <span className="text-sm">
              Seite {pageNumber} von {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              −
            </button>
            <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            Schließen
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-800 p-8 flex justify-center">
        <div className="relative">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-white text-center p-8">
                Lade PDF...
              </div>
            }
            error={
              <div className="text-red-500 text-center p-8">
                Fehler beim Laden der PDF-Datei
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="text-white text-center p-8">
                  Lade Seite...
                </div>
              }
            />
          </Document>
          
          {/* Annotation Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
          />
        </div>
      </div>
    </div>
  );
}
