"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { AnatomySystem } from "../types/anatomy.types";
import {
  resolveCanonicalId,
  getSupportedAnatomogramIds,
} from "../lib/anatomogramAdapter";

type AnatomogramCanvasProps = {
  selectedSystem: AnatomySystem;
  selectedCanonicalId: string | null;
  onPartSelect: (canonicalId: string | null) => void;
  /** When non-empty, only these canonical IDs are highlighted; others dim further. */
  specialityFocusCanonicalIds?: Set<string>;
};

const HIGHLIGHT_COLOR = "#7c5cfc";
const SELECT_COLOR = "#9070ff";
const SHOW_COLOR = "#8080a8";
const DIM_OPACITY = "0.08";
const SHOW_OPACITY = "0.4";
const HIGHLIGHT_OPACITY = "0.7";
const SELECT_OPACITY = "1";

export function AnatomogramCanvas({
  selectedSystem,
  selectedCanonicalId,
  onPartSelect,
  specialityFocusCanonicalIds,
}: AnatomogramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const supportedIds = useMemo(
    () => getSupportedAnatomogramIds(selectedSystem),
    [selectedSystem],
  );

  // Reverse-lookup: find the anatomogram ID for the selected canonical ID
  const selectedAnatomogramId = useMemo(() => {
    if (!selectedCanonicalId) return null;
    return (
      supportedIds.find(
        (id) => resolveCanonicalId(id) === selectedCanonicalId,
      ) ?? null
    );
  }, [selectedCanonicalId, supportedIds]);

  const handleClick = useCallback(
    (anatomogramId: string) => {
      onPartSelect(resolveCanonicalId(anatomogramId));
    },
    [onPartSelect],
  );

  // Load SVG into container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    fetch("/body-map.svg")
      .then((res) => res.text())
      .then((svgText) => {
        if (cancelled) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.maxHeight = "85vh";

        container.innerHTML = "";
        container.appendChild(svg);
        svgRef.current = svg;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Style organs and attach click handlers based on system/selection
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Collect all UBERON elements
    const allUberonEls = svg.querySelectorAll<SVGElement>('[id^="UBERON_"]');

    // Dim everything first
    allUberonEls.forEach((el) => {
      el.style.opacity = DIM_OPACITY;
      el.style.cursor = "default";
      el.style.transition = "opacity 0.2s, fill 0.2s";
      el.onclick = null;
    });

    // Highlight supported organs for current system
    const hasSpecialityFilter = specialityFocusCanonicalIds && specialityFocusCanonicalIds.size > 0;

    supportedIds.forEach((id) => {
      const el = svg.querySelector<SVGElement>(`#${id}`);
      if (!el) return;

      const canonicalId = resolveCanonicalId(id);
      const isSelected = id === selectedAnatomogramId;
      const isSpecialityFocus = hasSpecialityFilter && canonicalId !== null
        && specialityFocusCanonicalIds!.has(canonicalId);
      const shouldDim = hasSpecialityFilter && !isSpecialityFocus && !isSelected;

      el.style.opacity = isSelected
        ? SELECT_OPACITY
        : shouldDim
          ? DIM_OPACITY
          : SHOW_OPACITY;
      el.style.cursor = shouldDim ? "default" : "pointer";

      // Color the paths inside this group
      const paths = el.querySelectorAll<SVGElement>("path, circle, ellipse, rect");
      if (paths.length > 0) {
        paths.forEach((p) => {
          p.style.fill = isSelected ? SELECT_COLOR : HIGHLIGHT_COLOR;
          p.style.transition = "fill 0.2s";
        });
      } else {
        // The element itself is the path
        el.style.fill = isSelected ? SELECT_COLOR : HIGHLIGHT_COLOR;
      }

      el.onclick = (e) => {
        e.stopPropagation();
        handleClick(id);
      };
    });

    // Click on empty area clears selection
    svg.onclick = () => onPartSelect(null);
  }, [supportedIds, selectedAnatomogramId, handleClick, onPartSelect, specialityFocusCanonicalIds]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center h-full [&_svg]:mx-auto"
    />
  );
}
