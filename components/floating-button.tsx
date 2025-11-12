'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

interface FloatingButtonProps {
  itemWidth?: number
  itemHeight?: number
  gapWidth?: number
  coefficientHeight?: number
  snap?: boolean
  dragThreshold?: number
  peekWidth?: number
  imageSrc?: string
  onClick?: () => void
}

export function FloatingButton({
  itemWidth = 192,
  itemHeight = 192,
  gapWidth = 50,
  coefficientHeight = 0.72,
  snap = true,
  dragThreshold = 3,
  peekWidth = 10,
  imageSrc = '/home/ai.png',
  onClick
}: FloatingButtonProps) {
  const floatButtonRef = useRef<HTMLDivElement>(null)
  
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [moved, setMoved] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [dockSide, setDockSide] = useState<'left' | 'right'>('right')
  
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const offsetXRef = useRef(0)
  const offsetYRef = useRef(0)

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  const measure = () => {
    setClientWidth(document.documentElement.clientWidth)
    setClientHeight(document.documentElement.clientHeight)
  }

  const placeInitial = (width: number, height: number) => {
    const newLeft = width - itemWidth - gapWidth
    const newTop = clamp(
      height * coefficientHeight,
      gapWidth,
      height - itemHeight - gapWidth
    )
    setLeft(newLeft)
    setTop(newTop)
    setDockSide('right')
  }

  // 计算 transform：hover 或拖动时为 0；否则根据贴边方向"缩进去"只露出 peekWidth
  const transformStyle = useMemo(() => {
    if (hovering || dragging) return 'translateX(30%)'
    if (dockSide === 'left') {
      return `translateX(calc(-100% + ${peekWidth}px))`
    }
    return `translateX(calc(100% - ${peekWidth}px))`
  }, [hovering, dragging, dockSide, peekWidth])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) return
    
    const pointerId = e.pointerId
    pointerIdRef.current = pointerId
    e.currentTarget.setPointerCapture(pointerId)

    setDragging(true)
    setMoved(false)
    setHovering(true) // 按下时先展开，便于拖拽

    startXRef.current = e.clientX
    startYRef.current = e.clientY
    offsetXRef.current = e.clientX - left
    offsetYRef.current = e.clientY - top

    if (floatButtonRef.current) {
      floatButtonRef.current.style.transition = 'none'
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || e.pointerId !== pointerIdRef.current) return

    const newLeft = e.clientX - offsetXRef.current
    const newTop = e.clientY - offsetYRef.current

    const maxL = clientWidth - itemWidth - gapWidth
    const maxT = clientHeight - itemHeight - gapWidth

    setLeft(clamp(newLeft, gapWidth, maxL))
    setTop(clamp(newTop, gapWidth, maxT))

    if (!moved) {
      const dx = e.clientX - startXRef.current
      const dy = e.clientY - startYRef.current
      if (Math.hypot(dx, dy) > dragThreshold) {
        setMoved(true)
      }
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pointerId = pointerIdRef.current
    if (dragging && pointerId !== null && e.pointerId === pointerId) {
      try {
        e.currentTarget.releasePointerCapture(pointerId)
      } catch {}
    }
    pointerIdRef.current = null
    setDragging(false)

    if (floatButtonRef.current) {
      floatButtonRef.current.style.transition = 'all 0.2s ease'
    }

    // 贴边吸附 - 总是吸附到右边
    const targetLeft = clientWidth - itemWidth - gapWidth
    setDockSide('right')
    
    if (snap) {
      setLeft(clamp(targetLeft, gapWidth, clientWidth - itemWidth - gapWidth))
    } else {
      // 未开启吸附时，也保证不出界
      setLeft(clamp(left, gapWidth, clientWidth - itemWidth - gapWidth))
    }
    
    // 保证垂直方向不出界
    setTop(clamp(top, gapWidth, clientHeight - itemHeight - gapWidth))
  }

  const onMouseEnter = () => {
    setHovering(true)
  }

  const onMouseLeave = () => {
    setHovering(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (moved) return
    onClick?.()
  }


  useEffect(() => {
    measure()
    const handleResize = () => {
      const newWidth = document.documentElement.clientWidth
      const newHeight = document.documentElement.clientHeight
      setClientWidth(newWidth)
      setClientHeight(newHeight)
      
      // 调整位置以适应新尺寸 - 保持在右边
      const newLeft = newWidth - itemWidth - gapWidth
      setLeft(clamp(newLeft, gapWidth, newWidth - itemWidth - gapWidth))
      setTop((prevTop) => clamp(prevTop, gapWidth, newHeight - itemHeight - gapWidth))
      
      // 保持 dockSide 为右边
      setDockSide('right')
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    // 初始化位置（需要等待下一帧确保 DOM 已渲染）
    const timer = setTimeout(() => {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      if (width > 0 && height > 0) {
        placeInitial(width, height)
      }
    }, 0)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [itemWidth, itemHeight, gapWidth, coefficientHeight])

  // 当 itemWidth 或 itemHeight 变化时，重新计算位置
  useEffect(() => {
    if (clientWidth > 0 && clientHeight > 0) {
      const newLeft = clientWidth - itemWidth - gapWidth
      setLeft(clamp(newLeft, gapWidth, clientWidth - itemWidth - gapWidth))
      const newTop = clamp(
        clientHeight * coefficientHeight,
        gapWidth,
        clientHeight - itemHeight - gapWidth
      )
      setTop(newTop)
    }
  }, [itemWidth, itemHeight, clientWidth, clientHeight, gapWidth, coefficientHeight])

  return (
    <div
      ref={floatButtonRef}
      className="fixed z-[999] touch-none cursor-grab select-none transition-all duration-200 ease-in-out"
      style={{
        width: `${itemWidth}px`,
        height: `${itemHeight}px`,
        left: `${left}px`,
        top: `${top}px`,
        transform: transformStyle,
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onPointerDown(e)
      }}
      onPointerMove={(e) => {
        e.preventDefault()
        onPointerMove(e)
      }}
      onPointerUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onPointerUp(e)
      }}
      onPointerCancel={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onPointerUp(e)
      }}
      onPointerLeave={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onPointerUp(e)
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick(e)
      }}
    >
      <img
        src={imageSrc}
        draggable={false}
        alt="Floating button"
        className="w-full h-full pointer-events-none"
        style={{ 
          objectFit: 'contain',
          WebkitUserDrag: 'none'

        }}
      />
    </div>
  )
}

