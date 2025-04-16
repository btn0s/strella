import React from "react";

export interface CursorData {
  x: number;
  y: number;
}

export interface UserInfo {
  name: string;
  color: string;
}

interface CursorProps {
  position: CursorData;
  user: UserInfo;
}

export function Cursor({ position, user }: CursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 flex flex-col items-start"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Cursor triangle */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        style={{ color: user.color }}
      >
        <path
          d="M1 1L8 14L12 6L15 15"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
          transform="translate(-3.5, -3.5) rotate(-45 8 8) scale(0.7)"
        />
      </svg>

      {/* User label */}
      <div
        className="mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}
