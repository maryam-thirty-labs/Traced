"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** Anatomogram ID of the organ to pulse (ambient onboarding). */
  pulseAnatomogramId?: string | null;
  /** Canonical IDs of structures the user has explored — rendered with brighter stroke. */
  illuminatedCanonicalIds?: Set<string>;
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
  pulseAnatomogramId,
  illuminatedCanonicalIds,
}: AnatomogramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

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
        setSvgLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSvgLoaded(true);
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
      const isIlluminated = canonicalId !== null
        && (illuminatedCanonicalIds?.has(canonicalId) ?? false);
      const isSpecialityFocus = hasSpecialityFilter && canonicalId !== null
        && specialityFocusCanonicalIds!.has(canonicalId);
      const shouldDim = hasSpecialityFilter && !isSpecialityFocus && !isSelected;
      const isPulsing = id === pulseAnatomogramId && !isSelected;

      el.style.opacity = isSelected
        ? SELECT_OPACITY
        : shouldDim
          ? DIM_OPACITY
          : isIlluminated
            ? SELECT_OPACITY
            : SHOW_OPACITY;
      el.style.cursor = shouldDim ? "default" : "pointer";
      el.classList.toggle("organ-pulse", isPulsing);

      const fillColor = isSelected
        ? SELECT_COLOR
        : isIlluminated
          ? SELECT_COLOR
          : HIGHLIGHT_COLOR;

      const paths = el.querySelectorAll<SVGElement>("path, circle, ellipse, rect");
      if (paths.length > 0) {
        paths.forEach((p) => {
          p.style.fill = fillColor;
          p.style.transition = "fill 0.2s";
        });
      } else {
        el.style.fill = fillColor;
      }

      // Hover label via SVG <title> (native tooltip)
      if (canonicalId) {
        let titleEl = el.querySelector<SVGTitleElement>(":scope > title");
        if (!titleEl) {
          titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
          el.prepend(titleEl);
        }
        titleEl.textContent = canonicalId
          .split("_")
          .slice(1, -1)
          .join(" ")
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());
      }

      el.onclick = (e) => {
        e.stopPropagation();
        handleClick(id);
      };
    });

    // Click on empty area clears selection
    svg.onclick = () => onPartSelect(null);
  }, [
    supportedIds,
    selectedAnatomogramId,
    handleClick,
    onPartSelect,
    specialityFocusCanonicalIds,
    pulseAnatomogramId,
    illuminatedCanonicalIds,
  ]);

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="flex items-center justify-center h-full [&_svg]:mx-auto"
      />
      {!svgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-48 h-96 rounded-3xl animate-pulse"
            style={{ backgroundColor: "rgba(122,110,93,0.12)" }}
            aria-label="Loading body silhouette"
          />
        </div>
      )}
    </div>
  );
}
