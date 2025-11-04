"use client";

import { Idea } from "@/lib/db";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface PostItProps {
  idea: Idea;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const POST_IT_COLORS = [
  "#FEFF9C", // Classic yellow
  "#FF7EB9", // Pink
  "#7AFCFF", // Cyan
  "#FFD700", // Gold
  "#98FB98", // Pale green
  "#FFB6C1", // Light pink
  "#DDA0DD", // Plum
  "#F0E68C", // Khaki
];

// Helper function to darken a color for the curled corner
function getDarkerShade(color: string): string {
  // Convert hex to RGB, darken, and return
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Darken by 15%
  const darken = (val: number) => Math.max(0, Math.floor(val * 0.85));

  return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
}

export function PostIt({ idea, onClick, onDelete }: PostItProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate consistent but varied rotation for each post-it based on its ID
  const getRotation = () => {
    const hash = idea.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rotations = [-3, -2, -1, 0, 1, 2, 3];
    return rotations[hash % rotations.length];
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(idea.id);
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isDeleting ? "scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
      style={{
        transform: isHovered ? "translateY(-8px) scale(1.05) rotate(0deg)" : `rotate(${getRotation()}deg)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Tape effect */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-30 blur-sm"
        style={{
          background: "linear-gradient(90deg, transparent, #888, transparent)",
        }}
      />

      {/* Post-it note */}
      <div
        className="relative p-4 rounded-sm shadow-lg hover:shadow-2xl transition-shadow duration-200 min-h-[160px] w-full max-w-[180px] overflow-hidden"
        style={{
          backgroundColor: idea.color,
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0,0,0,0.05)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <Trash2 className="w-4 h-4 text-red-700" />
        </button>

        {/* Content */}
        <div className="space-y-2">
          <h3
            className="font-bold text-base text-gray-800 line-clamp-2 break-words"
            style={{
              textShadow: "0 1px 2px rgba(255,255,255,0.5)",
            }}
          >
            {idea.title}
          </h3>
          <p
            className="text-xs text-gray-700 line-clamp-3 break-words"
            style={{
              textShadow: "0 1px 2px rgba(255,255,255,0.3)",
            }}
          >
            {idea.description}
          </p>
        </div>

        {/* Date */}
        <div className="absolute bottom-1.5 right-2 text-[10px] text-gray-600 opacity-60">
          {new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Curled corner effect - angolo sollevato */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 24px 24px',
            borderColor: `transparent transparent rgba(0,0,0,0.1) transparent`,
            filter: 'drop-shadow(-1px -1px 2px rgba(0,0,0,0.15))',
          }}
        >
          {/* Inner fold - darker shade */}
          <div
            style={{
              position: 'absolute',
              bottom: '-24px',
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 0 24px 24px',
              borderColor: `transparent transparent ${getDarkerShade(idea.color)} transparent`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { POST_IT_COLORS };
