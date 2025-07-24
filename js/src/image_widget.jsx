import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import { useState, useRef } from "react";

const Box = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

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

  const p1 = annotation.points[0];
  const p2 = annotation.points[1];

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p1.y} stroke="red" strokeWidth="3" />
        <line x1={p2.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="red" strokeWidth="3" />
        <line x1={p2.x} y1={p2.y} x2={p1.x} y2={p2.y} stroke="red" strokeWidth="3" />
        <line x1={p1.x} y1={p2.y} x2={p1.x} y2={p1.y} stroke="red" strokeWidth="3" />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={annotation.points[0].x}
            y={annotation.points[0].y}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill="red"
          />
          <text
            ref={textRef}
            x={annotation.points[0].x + 2}
            y={annotation.points[0].y + 14}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
      )}
      {isSelected && (
        <g>
          <rect x={annotation.points[0].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill="red" onMouseDown={(e) => handleResizeMouseDown(e, "top-left")} style={{ cursor: "nwse-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill="red" onMouseDown={(e) => handleResizeMouseDown(e, "top-right")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[0].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill="red" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill="red" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")} style={{ cursor: "nwse-resize" }} />
        </g>
      )}
    </g>
  );
};

const Point = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoint = annotation.points[0];

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [{ x: initialPoint.x + dx, y: initialPoint.y + dy }];
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const p = annotation.points[0];

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <circle cx={p.x} cy={p.y} r={isSelected ? 6 : 4} fill="red" />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={p.x + 8}
            y={p.y - 8}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill="red"
          />
          <text
            ref={textRef}
            x={p.x + 10}
            y={p.y + 4}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
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
  currentClass,
}) => {
  const [drawing, setDrawing] = useState(null);
  const containerRef = useRef(null);
  const hasDragged = useRef(false);

  function handleMouseDown(e) {
    if (tool === "box") {
      hasDragged.current = false;
      const { x, y } = getCoordinates(e);
      setDrawing({ startX: x, startY: y, endX: x, endY: y });
    } else if (tool === "point") {
      const { x, y } = getCoordinates(e);
      const newAnnotation = {
        id: Date.now().toString(),
        type: "point",
        label: currentClass,
        points: [{ x, y }],
      };
      onAnnotationChange([...annotations, newAnnotation]);
      setSelectedShape(newAnnotation.id);
    }
  }

  function handleMouseMove(e) {
    if (!drawing) return;
    hasDragged.current = true;
    const { x, y } = getCoordinates(e);
    setDrawing({ ...drawing, endX: x, endY: y });
  }

  function handleMouseUp(e) {
    if (tool !== "box" || !drawing || !hasDragged.current) {
      setDrawing(null);
      return;
    }
    const { startX, startY, endX, endY } = drawing;
    const newAnnotation = {
      id: Date.now().toString(),
      type: "box",
      label: currentClass,
      points: [
        { x: Math.min(startX, endX), y: Math.min(startY, endY) },
        { x: Math.max(startX, endX), y: Math.max(startY, endY) },
      ],
    };
    onAnnotationChange([...annotations, newAnnotation]);
    setSelectedShape(newAnnotation.id);
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

  function handleDeleteAnnotation(id) {
    const newAnnotations = annotations.filter((anno) => anno.id !== id);
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
        {annotations.map((anno) => {
          if (anno.type === "box") {
            return (
              <Box
                key={anno.id}
                annotation={anno}
                isSelected={selectedShape === anno.id}
                onSelect={setSelectedShape}
                onUpdate={handleUpdateAnnotation}
              />
            );
          }
          if (anno.type === "point") {
            return (
              <Point
                key={anno.id}
                annotation={anno}
                isSelected={selectedShape === anno.id}
                onSelect={setSelectedShape}
                onUpdate={handleUpdateAnnotation}
              />
            );
          }
          return null;
        })}
        {drawing && tool === "box" && (
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

const Toolbar = ({ tool, setTool, onClear, classes, currentClass, setCurrentClass, onDeleteSelected, selectedShape }) => {
  return (
    <div className="imagewidget-toolbar">
      <button onClick={() => setTool("box")} disabled={tool === "box"}>
        Draw Box
      </button>
      <button onClick={() => setTool("point")} disabled={tool === "point"}>
        Draw Point
      </button>
      {classes && classes.length > 0 && (
        <div className="imagewidget-classes">
          {classes.map((c) => (
            <button
              key={c}
              className={currentClass === c ? "selected" : ""}
              onClick={() => setCurrentClass(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <button onClick={onClear}>Clear All</button>
      <button onClick={onDeleteSelected} disabled={!selectedShape}>
        Delete Selected
      </button>
    </div>
  );
};

function ImageAnnotationWidget() {
  const [srcs] = useModelState("srcs");
  const [annotations, setAnnotations] = useModelState("annotations");
  const [classes] = useModelState("classes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState("box");
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentClass, setCurrentClass] = useState(
    classes && classes.length > 0 ? classes[0] : ""
  );

  React.useEffect(() => {
    if (classes && classes.length > 0) {
      setCurrentClass(classes[0]);
    }
  }, [classes]);

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

  function handleDeleteSelected() {
    if (!selectedShape) return;
    const newElements = currentAnnotationData.elements.filter(
      (el) => el.id !== selectedShape
    );
    handleAnnotationChange(newElements);
    setSelectedShape(null);
  }

  return (
    <div className="imagewidget-container">
      <Toolbar
        tool={tool}
        setTool={setTool}
        onClear={handleClear}
        classes={classes}
        currentClass={currentClass}
        setCurrentClass={setCurrentClass}
        onDeleteSelected={handleDeleteSelected}
        selectedShape={selectedShape}
      />
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
        <div style={{ flex: 1, marginLeft: '1rem', marginRight: '1rem' }}>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
            <div style={{ width: `${(annotations.filter(a => a.elements.length > 0).length / srcs.length) * 100}%`, backgroundColor: '#4caf50', height: '8px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
      <DrawingArea
        imageSrc={currentSrc}
        annotations={currentAnnotationData.elements}
        onAnnotationChange={handleAnnotationChange}
        tool={tool}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        currentClass={currentClass}
      />
    </div>
  );
}

const render = createRender(ImageAnnotationWidget);
export default { render };
