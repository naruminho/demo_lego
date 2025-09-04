import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// Component data with revised correct matrices from the user
const componentTypes = [
  {
    id: 'user-input',
    name: 'User Input',
    color: 'bg-gray-600',
    inputType: null,
    outputType: 'text',
    shape: [
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0]
    ]
  },
  {
    id: 'ms-office',
    name: 'MS-Office, PDFs',
    color: 'bg-gray-600',
    inputType: null,
    outputType: 'document',
    shape: [
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,0,0,0,0],
      [1,1,0,0,0,0]
    ]
  },
  {
    id: 'ligacoes',
    name: 'Ligações, MP3',
    color: 'bg-gray-600',
    inputType: null,
    outputType: 'audio',
    shape: [
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [0,0,0,0,1,1],
      [0,0,0,0,1,1]
    ]
  },
  {
    id: 'ocr',
    name: 'OCR',
    color: 'bg-purple-500',
    inputType: 'document',
    outputType: 'text',
    shape: [
      [0,0,1,1,1,1],
      [0,0,1,1,1,1],
      [1,1,1,1,1,1],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0]
    ]
  },
  {
    id: 'tts',
    name: 'TTS - texto para fala',
    color: 'bg-cyan-500',
    inputType: 'text',
    outputType: 'audio',
    shape: [
      [1,1,0,0,1,1],
      [1,1,0,0,1,1],
      [1,1,1,1,1,1],
      [0,0,0,0,1,1],
      [0,0,0,0,1,1]
    ]
  },
  {
    id: 'stt',
    name: 'STT - Fala para texto',
    color: 'bg-yellow-500',
    inputType: 'audio',
    outputType: 'text',
    shape: [
      [1,1,1,1,0,0],
      [1,1,1,1,0,0],
      [1,1,1,1,1,1],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0]
    ]
  },
  {
    id: 'gerador-texto',
    name: 'gerador de texto',
    color: 'bg-green-600',
    inputType: 'text',
    outputType: 'text',
    shape: [
      [1,1,0,0,1,1],
      [1,1,0,0,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0]
    ]
  },
  {
    id: 'rag',
    name: 'RAG - Busca bases',
    color: 'bg-blue-500',
    inputType: 'text',
    outputType: 'text',
    shape: [
      [1,1,0,0,1,1],
      [1,1,0,0,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0]
    ]
  }
]

// Component to render puzzle piece shape
function PuzzlePiece({ component, isDragging = false, isSelected = false, style = {} }) {
  const cellSize = 12
  
  return (
    <div 
      className={`relative ${isDragging ? 'opacity-70' : ''} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{
        width: component.shape[0].length * cellSize,
        height: component.shape.length * cellSize,
        ...style
      }}
    >
      {component.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          cell === 1 && (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`absolute ${component.color} border border-gray-400 ${isSelected ? 'border-blue-500' : ''}`}
              style={{
                left: colIndex * cellSize,
                top: rowIndex * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            />
          )
        ))
      )}
    </div>
  )
}

// Draggable component wrapper for sidebar with label on the right
function DraggableComponent({ component, onDragStart, onDragEnd }) {
  const [isDragging, setIsDragging] = useState(false)
  
  const handleDragStart = (e) => {
    setIsDragging(true)
    
    // Create a custom drag image showing only the piece shape
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const cellSize = 12
    
    canvas.width = component.shape[0].length * cellSize
    canvas.height = component.shape.length * cellSize
    
    // Draw the piece shape
    component.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          ctx.fillStyle = component.color.includes('gray') ? '#4B5563' :
                         component.color.includes('purple') ? '#8B5CF6' :
                         component.color.includes('cyan') ? '#06B6D4' :
                         component.color.includes('yellow') ? '#EAB308' :
                         component.color.includes('green') ? '#16A34A' :
                         component.color.includes('blue') ? '#2563EB' : '#4B5563'
          ctx.fillRect(colIndex * cellSize, rowIndex * cellSize, cellSize, cellSize)
          ctx.strokeStyle = '#9CA3AF'
          ctx.strokeRect(colIndex * cellSize, rowIndex * cellSize, cellSize, cellSize)
        }
      })
    })
    
    e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2)
    e.dataTransfer.setData('component', JSON.stringify(component))
    onDragStart && onDragStart(component)
  }
  
  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd && onDragEnd()
  }
  
  return (
    <div className="mb-3 flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="cursor-move flex-shrink-0"
      >
        <PuzzlePiece component={component} isDragging={isDragging} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-tight">{component.name}</p>
      </div>
    </div>
  )
}

// Interactive puzzle piece on canvas with label
function InteractivePuzzlePiece({ 
  component, 
  isSelected, 
  onSelect, 
  onDragStart, 
  onDrag, 
  onDragEnd,
  style = {} 
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(component.id)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    setDragOffset({ x: offsetX, y: offsetY })
    
    setIsDragging(true)
    onDragStart && onDragStart(component)
    
    const handleMouseMove = (e) => {
      const newX = e.clientX - offsetX
      const newY = e.clientY - offsetY
      onDrag && onDrag(component.id, newX, newY)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      onDragEnd && onDragEnd(component)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const cellSize = 12
  const pieceWidth = component.shape[0].length * cellSize
  
  return (
    <div
      className="absolute cursor-move"
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <PuzzlePiece 
          component={component} 
          isDragging={isDragging}
          isSelected={isSelected}
        />
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            {component.name}
          </p>
        </div>
      </div>
    </div>
  )
}

// Function to check if two pieces can interlock at specific positions
function canPiecesInterlock(piece1, pos1, piece2, pos2) {
  const cellSize = 12
  
  // Convert positions to grid coordinates
  const grid1X = Math.round(pos1.x / cellSize)
  const grid1Y = Math.round(pos1.y / cellSize)
  const grid2X = Math.round(pos2.x / cellSize)
  const grid2Y = Math.round(pos2.y / cellSize)
  
  // Check every cell overlap between the two pieces
  for (let row1 = 0; row1 < piece1.shape.length; row1++) {
    for (let col1 = 0; col1 < piece1.shape[row1].length; col1++) {
      const globalRow = grid1Y + row1
      const globalCol = grid1X + col1
      
      // Check if this position overlaps with piece2
      for (let row2 = 0; row2 < piece2.shape.length; row2++) {
        for (let col2 = 0; col2 < piece2.shape[row2].length; col2++) {
          const piece2GlobalRow = grid2Y + row2
          const piece2GlobalCol = grid2X + col2
          
          // If positions overlap, check the cell values
          if (globalRow === piece2GlobalRow && globalCol === piece2GlobalCol) {
            const piece1Cell = piece1.shape[row1][col1]
            const piece2Cell = piece2.shape[row2][col2]
            
            // Collision only if BOTH cells are solid (1)
            if (piece1Cell === 1 && piece2Cell === 1) {
              return false // Collision between two solid parts
            }
          }
        }
      }
    }
  }
  
  return true // No collision, pieces can interlock
}

// Simple positioning - pieces stay where user drops them
function getDropPosition(movingPiece, dropPos, existingPieces) {
  const cellSize = 12
  
  // Simple grid snapping to nearest grid position
  const snappedX = Math.round(dropPos.x / cellSize) * cellSize
  const snappedY = Math.round(dropPos.y / cellSize) * cellSize
  
  const testPos = { x: snappedX, y: snappedY }
  
  // Check if this position causes any solid-to-solid collisions
  for (const existingPiece of existingPieces) {
    if (!canPiecesInterlock(movingPiece, testPos, existingPiece, existingPiece)) {
      // If there's a collision, try a few nearby positions
      const nearbyPositions = [
        { x: snappedX + cellSize, y: snappedY },
        { x: snappedX - cellSize, y: snappedY },
        { x: snappedX, y: snappedY + cellSize },
        { x: snappedX, y: snappedY - cellSize },
        { x: snappedX + cellSize, y: snappedY + cellSize },
        { x: snappedX - cellSize, y: snappedY - cellSize }
      ]
      
      for (const nearbyPos of nearbyPositions) {
        let canPlaceHere = true
        for (const piece of existingPieces) {
          if (!canPiecesInterlock(movingPiece, nearbyPos, piece, piece)) {
            canPlaceHere = false
            break
          }
        }
        if (canPlaceHere) {
          return nearbyPos
        }
      }
    }
  }
  
  // If no collision or collision resolved, use the snapped position
  return testPos
}

// Canvas component where pieces are dropped
function WorkflowCanvas({ droppedComponents, onDrop, onValidate, onRemoveComponent, onUpdatePosition }) {
  const canvasRef = useRef(null)
  const [selectedPiece, setSelectedPiece] = useState(null)
  
  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPiece) {
        e.preventDefault()
        onRemoveComponent(selectedPiece)
        setSelectedPiece(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPiece, onRemoveComponent])
  
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus()
    }
  }, [])
  
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    const componentData = JSON.parse(e.dataTransfer.getData('component'))
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Use simple positioning that respects user's drop location
    const finalPos = getDropPosition(componentData, { x, y }, droppedComponents)
    
    onDrop({
      ...componentData,
      id: `${componentData.id}-${Date.now()}`,
      x: finalPos.x,
      y: finalPos.y
    })
  }
  
  const handlePieceSelect = (pieceId) => {
    setSelectedPiece(pieceId)
  }
  
  const handlePieceDrag = (pieceId, newX, newY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const relativeX = newX - rect.left
    const relativeY = newY - rect.top
    
    const piece = droppedComponents.find(p => p.id === pieceId)
    if (!piece) return
    
    const otherPieces = droppedComponents.filter(p => p.id !== pieceId)
    
    // Use simple positioning during drag too
    const finalPos = getDropPosition(piece, { x: relativeX, y: relativeY }, otherPieces)
    
    onUpdatePosition(pieceId, finalPos.x, finalPos.y)
  }
  
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedPiece(null)
    }
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <p className="text-gray-600">
          <strong>Desafio:</strong> construa um workflow de...
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Arraste peças da barra lateral. As peças ficam onde você soltar e podem se sobrepor nos espaços vazios.
        </p>
      </div>
      
      <div
        ref={canvasRef}
        className="flex-1 bg-white relative overflow-hidden focus:outline-none"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        tabIndex={0}
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px'
        }}
      >
        {droppedComponents.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-lg">
              Arraste os componentes e monte seu workflow aqui
            </p>
          </div>
        ) : (
          droppedComponents.map((component) => (
            <InteractivePuzzlePiece
              key={component.id}
              component={component}
              isSelected={selectedPiece === component.id}
              onSelect={handlePieceSelect}
              onDrag={handlePieceDrag}
              style={{
                left: component.x,
                top: component.y,
                zIndex: selectedPiece === component.id ? 10 : 1
              }}
            />
          ))
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2 items-center">
          <Button onClick={onValidate} className="bg-purple-600 hover:bg-purple-700">
            Validar Workflow
          </Button>
          <Button 
            onClick={() => {
              onRemoveComponent('all')
              setSelectedPiece(null)
            }} 
            variant="outline"
            className="text-gray-600"
          >
            Limpar Canvas
          </Button>
          {selectedPiece && (
            <span className="text-sm text-blue-600 ml-2">
              Peça selecionada - pressione Delete para remover
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [droppedComponents, setDroppedComponents] = useState([])
  
  const handleDrop = (component) => {
    setDroppedComponents(prev => [...prev, component])
  }
  
  const handleRemoveComponent = (componentId) => {
    if (componentId === 'all') {
      setDroppedComponents([])
    } else {
      setDroppedComponents(prev => prev.filter(c => c.id !== componentId))
    }
  }
  
  const handleUpdatePosition = (componentId, newX, newY) => {
    setDroppedComponents(prev => 
      prev.map(component => 
        component.id === componentId 
          ? { ...component, x: newX, y: newY }
          : component
      )
    )
  }
  
  const handleValidate = () => {
    if (droppedComponents.length === 0) {
      alert('Adicione pelo menos um componente ao workflow!')
      return
    }
    
    const hasInput = droppedComponents.some(c => c.inputType === null)
    let interlockCount = 0
    
    // Count actual interlocks
    for (let i = 0; i < droppedComponents.length; i++) {
      for (let j = i + 1; j < droppedComponents.length; j++) {
        const distance = Math.sqrt(
          Math.pow(droppedComponents[i].x - droppedComponents[j].x, 2) + 
          Math.pow(droppedComponents[i].y - droppedComponents[j].y, 2)
        )
        
        // Check if pieces are overlapping (interlocked)
        if (distance < 50) {
          const canInterlock = canPiecesInterlock(
            droppedComponents[i], droppedComponents[i], 
            droppedComponents[j], droppedComponents[j]
          )
          if (canInterlock) {
            interlockCount++
          }
        }
      }
    }
    
    if (!hasInput) {
      alert('⚠️ Adicione pelo menos um componente de entrada (User Input, MS-Office, ou Ligações)')
      return
    }
    
    if (droppedComponents.length === 1) {
      alert('✅ Componente adicionado! Adicione mais componentes para criar um workflow completo.')
    } else if (interlockCount > 0) {
      alert(`✅ Workflow válido! Você criou ${interlockCount} encaixe(s) real(is) entre as peças.`)
    } else {
      alert('⚠️ As peças não estão encaixadas. Tente sobrepor peças nos espaços vazios (zeros).')
    }
  }
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-purple-600 text-white p-4">
        <h1 className="text-xl font-bold">Bridge - Agentes workflows</h1>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar with components */}
        <div className="w-80 bg-gray-100 border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-4 text-gray-800">Componentes</h2>
            <div className="space-y-1">
              {componentTypes.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Canvas area */}
        <WorkflowCanvas
          droppedComponents={droppedComponents}
          onDrop={handleDrop}
          onValidate={handleValidate}
          onRemoveComponent={handleRemoveComponent}
          onUpdatePosition={handleUpdatePosition}
        />
      </div>
    </div>
  )
}

export default App

