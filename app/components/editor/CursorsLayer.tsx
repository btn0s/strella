import React, { useEffect, useState } from "react";
import { WebrtcProvider } from "y-webrtc";
import { Cursor } from "./Cursor";
import type { CursorData, UserInfo } from "./Cursor";

interface CursorsLayerProps {
  provider: WebrtcProvider | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface AwarenessState {
  user?: UserInfo;
  cursor?: CursorData;
}

export function CursorsLayer({ provider, containerRef }: CursorsLayerProps) {
  const [cursors, setCursors] = useState<Map<number, AwarenessState>>(
    new Map()
  );

  useEffect(() => {
    if (!provider) return;

    // Function to update cursors from awareness
    const updateCursors = () => {
      const states = provider.awareness.getStates();
      const newCursors = new Map<number, AwarenessState>();

      // Add all remote cursors (filter out our own)
      states.forEach((state, clientId) => {
        if (
          clientId !== provider.awareness.clientID &&
          state.user &&
          state.cursor
        ) {
          newCursors.set(clientId, state as AwarenessState);
        }
      });

      setCursors(newCursors);
    };

    // Subscribe to awareness changes
    provider.awareness.on("change", updateCursors);
    updateCursors();

    return () => {
      provider.awareness.off("change", updateCursors);
    };
  }, [provider]);

  useEffect(() => {
    if (!provider || !containerRef.current) return;

    // Generate a random user
    const user: UserInfo = {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.random() * 360}, 85%, 55%)`,
    };

    // Set initial awareness state with user info but no cursor yet
    provider.awareness.setLocalState({
      user,
      cursor: null,
    });

    // Track mouse movement within the container
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only update if the cursor is within the container
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        // Update cursor position in awareness
        provider.awareness.setLocalState({
          user,
          cursor: { x, y },
        });
      } else {
        // Hide cursor when out of bounds
        provider.awareness.setLocalState({
          user,
          cursor: null,
        });
      }
    };

    // Mouse leave handler to hide the cursor
    const handleMouseLeave = () => {
      provider.awareness.setLocalState({
        user,
        cursor: null,
      });
    };

    containerRef.current.addEventListener("mousemove", handleMouseMove);
    containerRef.current.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      }

      // Clean up the awareness state
      provider.awareness.setLocalState(null);
    };
  }, [provider, containerRef]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from(cursors.entries()).map(([clientId, state]) => {
        if (!state.cursor || !state.user) return null;

        return (
          <Cursor key={clientId} position={state.cursor} user={state.user} />
        );
      })}
    </div>
  );
}
