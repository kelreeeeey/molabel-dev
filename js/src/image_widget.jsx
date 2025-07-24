import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import { useState, useRef } from "react";

const Box = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const boxRef = useRef(null);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [
        { x: initialPoints[0].x + dx, y: initialPoints[0].y + dy },
        { x: initialPoints[1].x + dx, y: initialPoints[1].y + dy },
      ];
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (e, corner) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      let newPoints = [...initialPoints];
      if (corner.includes("left")) {
        newPoints[0] = { ...newPoints[0], x: initialPoints[0].x + dx };
      }
      if (corner.includes("top")) {
        newPoints[0] = { ...newPoints[0], y: initialPoints[0].y + dy };
      }
      if (corner.includes("right")) {
        newPoints[1] = { ...newPoints[1], x: initialPoints[1].x + dx };
      }
      if (corner.includes("bottom")) {
        newPoints[1] = { ...newPoints[1], y: initialPoints[1].y + dy };
      }
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const width = annotation.points[1].x - annotation.points[0].x;
  const height = annotation.points[1].y - annotation.points[0].y;

  return (
    <g>
      <rect
        ref={boxRef}
        x={annotation.points[0].x}
        y={annotation.points[0].y}
        width={width}
        height={height}
        stroke={isSelected ? "blue" : "red"}
        fill="transparent"
        strokeWidth="2"
        onMouseDown={handleMouseDown}
        style={{ cursor: "move" }}
      />
      {isSelected && (
        <>
          <rect x={annotation.points[0].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill="blue" onMouseDown={(e) => handleResizeMouseDown(e, "top-left")} style={{ cursor: "nwse-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill="blue" onMouseDown={(e) => handleResizeMouseDown(e, "top-right")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[0].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill="blue" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill="blue" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")} style={{ cursor: "nwse-resize" }} />
        </>
      )}
    </g>
  );
};

const DrawingArea = ({
  imageSrc,
  annotations,
  onAnnotationChange,
  tool,
  selectedShape,
  setSelectedShape,
}) => {
  const [drawing, setDrawing] = useState(null);
  const containerRef = useRef(null);

  function handleMouseDown(e) {
    if (tool !== "box") return;
    const { x, y } = getCoordinates(e);
    setDrawing({ startX: x, startY: y, endX: x, endY: y });
  }

  function handleMouseMove(e) {
    if (!drawing) return;
    const { x, y } = getCoordinates(e);
    setDrawing({ ...drawing, endX: x, endY: y });
  }

  function handleMouseUp(e) {
    if (!drawing) return;
    const { startX, startY, endX, endY } = drawing;
    const newAnnotation = {
      id: Date.now().toString(),
      type: "box",
      points: [
        { x: Math.min(startX, endX), y: Math.min(startY, endY) },
        { x: Math.max(startX, endX), y: Math.max(startY, endY) },
      ],
    };
    onAnnotationChange([...annotations, newAnnotation]);
    setDrawing(null);
  }

  function getCoordinates(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  function handleUpdateAnnotation(updatedAnnotation) {
    const newAnnotations = annotations.map((anno) =>
      anno.id === updatedAnnotation.id ? updatedAnnotation : anno
    );
    onAnnotationChange(newAnnotations);
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img src={imageSrc} style={{ display: "block" }} />
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {annotations.map((anno) => (
          <Box
            key={anno.id}
            annotation={anno}
            isSelected={selectedShape === anno.id}
            onSelect={setSelectedShape}
            onUpdate={handleUpdateAnnotation}
          />
        ))}
        {drawing && (
          <rect
            x={Math.min(drawing.startX, drawing.endX)}
            y={Math.min(drawing.startY, drawing.endY)}
            width={Math.abs(drawing.startX - drawing.endX)}
            height={Math.abs(drawing.startY - drawing.endY)}
            stroke="red"
            fill="transparent"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
};

const Toolbar = ({ tool, setTool, onClear }) => {
  return (
    <div className="imagewidget-toolbar">
      <button onClick={() => setTool("box")} disabled={tool === "box"}>
        Draw Box
      </button>
      <button onClick={onClear}>Clear</button>
    </div>
  );
};

function ImageAnnotationWidget() {
  const [srcs] = useModelState("srcs");
  const [annotations, setAnnotations] = useModelState("annotations");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState("box");
  const [selectedShape, setSelectedShape] = useState(null);

  if (!srcs || srcs.length === 0) {
    return <div>Loading images...</div>;
  }

  const currentSrc = srcs[currentIndex];
  const currentAnnotationData = annotations.find((a) => a.src === currentSrc) || {
    elements: [],
  };

  function handleAnnotationChange(newElements) {
    const newAnnotations = annotations.map((anno) =>
      anno.src === currentSrc ? { ...anno, elements: newElements } : anno
    );
    setAnnotations(newAnnotations);
  }

  function handleClear() {
    handleAnnotationChange([]);
  }

  return (
    <div className="imagewidget-container">
      <Toolbar tool={tool} setTool={setTool} onClear={handleClear} />
      <div className="imagewidget-navigation">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <span>
          Image {currentIndex + 1} of {srcs.length}
        </span>
        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(srcs.length - 1, i + 1))
          }
          disabled={currentIndex === srcs.length - 1}
        >
          Next
        </button>
      </div>
      <DrawingArea
        imageSrc={currentSrc}
        annotations={currentAnnotationData.elements}
        onAnnotationChange={handleAnnotationChange}
        tool={tool}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
      />
    </div>
  );
}

const render = createRender(ImageAnnotationWidget);
export default { render };
