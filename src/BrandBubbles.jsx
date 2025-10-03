import { useState, useEffect } from "react";
import "./BrandBubbles.css";

const animations = ["swim1", "swim2"];

const BrandBubbles = () => {
  const [bubbles, setBubbles] = useState([]);
  const [miniBubbles, setMiniBubbles] = useState([]);

  const generateBubble = (index) => {
    const minTop = 15;
    const maxTop = 70;
    const minLeft = 5;
    const maxLeft = 85;

    return {
      id: index,
      positionStyles: {
        top: `${Math.random() * (maxTop - minTop) + minTop}vh`,
        left: `${Math.random() * (maxLeft - minLeft) + minLeft}vw`,
      },
      animationName: animations[index % animations.length],
      animationDuration: `${Math.random() * 5 + 5}s`,
      isHovered: false,
      isPopped: false,
    };
  };

  const generateMiniBubble = (parentBubble, miniId, clickTime) => {
    const angle = (miniId / 6) * 2 * Math.PI;
    const distance = 20 + Math.random() * 10; // 20-30px
    const parentTop = parseFloat(parentBubble.positionStyles.top);
    const parentLeft = parseFloat(parentBubble.positionStyles.left);
    const size = 12 + Math.random() * 12;
    const colorMap = {
        "modern-coral": "rgb(255, 100, 60)",
        "modern-teal": "rgb(0, 206, 209)",
        "vintage-sage": "rgb(194, 216, 185)",
    };
    const colorName = ["modern-coral", "modern-teal", "vintage-sage"][Math.floor(Math.random() * 3)];
    const color = colorMap[colorName];


    return {
      id: `${parentBubble.id}-${miniId}-${clickTime}`,
      top: `${parentTop + Math.sin(angle) * distance}vh`,
      left: `${parentLeft + Math.cos(angle) * distance}vw`,
      size,
      color,
    };
  };

  useEffect(() => {
    const initialBubbles = Array.from({ length: 2 }, (_, index) =>
      generateBubble(index)
    );
    setBubbles(initialBubbles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;

      setBubbles((prev) =>
        prev.map((bubble) => {
          if (bubble.isPopped) return bubble;

          const bubbleX = parseFloat(bubble.positionStyles.left);
          const bubbleY = parseFloat(bubble.positionStyles.top);
          const dx = mouseX - bubbleX;
          const dy = mouseY - bubbleY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 30;
          const strength = 0.025;

          if (distance < maxDistance) {
            const moveX = -dx * strength;
            const moveY = -dy * strength;
            let newLeft = bubbleX - moveX;
            let newTop = bubbleY - moveY;

            const minTop = 15;
            const maxTop = 70;
            const minLeft = 5;
            const maxLeft = 85;
            newTop = Math.max(minTop, Math.min(maxTop, newTop));
            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

            return {
              ...bubble,
              positionStyles: {
                ...bubble.positionStyles,
                top: `${newTop}vh`,
                left: `${newLeft}vw`,
              },
            };
          }
          return bubble;
        })
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleHover = (id, isHovered) => {
    setBubbles((prev) =>
      prev.map((bubble) =>
        bubble.id === id ? { ...bubble, isHovered } : bubble
      )
    );
  };

  const handleClick = (id) => {
    const clickTime = Date.now();
    setBubbles((prev) => {
      const clickedBubble = prev.find((b) => b.id === id);
      if (!clickedBubble) return prev;

      setMiniBubbles([]); // Clear all mini-bubbles first
      const newMiniBubbles = Array.from({ length: 6 }, (_, i) =>
        generateMiniBubble(clickedBubble, i, clickTime)
      );
      setMiniBubbles(newMiniBubbles);

      return prev.map((bubble) =>
        bubble.id === id ? { ...bubble, isPopped: true } : bubble
      );
    });

    setTimeout(() => {
      setMiniBubbles([]);
      setBubbles((prev) =>
        prev.map((bubble) =>
          bubble.id === id ? generateBubble(id) : bubble
        )
      );
    }, 600);
  };

  return (
    <div className="brand-bubbles-container">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble ${
            bubble.isHovered ? "bubble-hovered" : ""
          } ${bubble.isPopped ? "bubble-popped" : ""}`}
          style={{
            ...bubble.positionStyles,
            animationDuration: bubble.animationDuration,
            animationName: bubble.isPopped ? "pop" : bubble.animationName,
          }}
          onMouseEnter={() => handleHover(bubble.id, true)}
          onMouseLeave={() => handleHover(bubble.id, false)}
          onClick={() => handleClick(bubble.id)}
        >
          Tap Me
        </div>
      ))}
      {miniBubbles.map((mini) => (
        <div
          key={mini.id}
          className={`mini-bubble bg-${mini.color}/50`}
          style={{
            top: mini.top,
            left: mini.left,
            width: `${mini.size}px`,
            height: `${mini.size}px`,
            backgroundColor: mini.color,
          }}
        />
      ))}
    </div>
  );
};

export default BrandBubbles;