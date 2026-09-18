// src/components/shared/MapPickerDialog.tsx
"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, FC, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, X, Navigation, Check, Loader2 } from "lucide-react";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, LeafletMouseEvent, LatLngBoundsExpression } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isWithinBangladesh, BD_BOUNDS } from "@/utils/geo";

// ── Dynamic imports (SSR-safe) ────────────────────────────────
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

// ── Leaflet icon fix ─────────────────────────────────────────
let L: typeof import("leaflet") | null = null;
async function configureLeafletIcons() {
    if (!L) L = (await import("leaflet")).default;
    const flag = "_configured";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((L.Icon.Default as any)[flag]) return;
    L.Icon.Default.mergeOptions({
        iconUrl: "/images/map-pin.svg",
        iconRetinaUrl: "/images/map-pin.svg",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        shadowUrl: "",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Icon.Default as any)[flag] = true;
}

// ── Nominatim result type ─────────────────────────────────────
interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// ── Sub-components ────────────────────────────────────────────
const ForceResize: FC<{ open: boolean }> = ({ open }) => {
    const map = useMap();
    useEffect(() => {
        if (!open) return;
        const ts = [
            setTimeout(() => map.invalidateSize(), 50),
            setTimeout(() => map.invalidateSize(), 150),
            setTimeout(() => map.invalidateSize(), 300),
        ];
        return () => ts.forEach(clearTimeout);
    }, [open, map]);
    return null;
};

const FlyToPosition: FC<{ position: [number, number] | null }> = ({ position }) => {
    const map = useMap();
    const prevRef = useRef<[number, number] | null>(null);
    useEffect(() => {
        if (!position) return;
        if (
            prevRef.current &&
            prevRef.current[0] === position[0] &&
            prevRef.current[1] === position[1]
        )
            return;
        prevRef.current = position;
        map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 });
    }, [position, map]);
    return null;
};

const ClickHandler: FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
    useMapEvents({
        click: (e: LeafletMouseEvent) => {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// ── Helpers ───────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

/* ─── Props ──────────────────────────────────────── */
export interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number];
}

/* ─── Component ──────────────────────────────────────────────── */
export const MapPickerDialog: FC<MapPickerProps> = ({
    open,
    onClose,
    onSelect,
    initialPosition,
}) => {
    const [mounted, setMounted] = useState(false);

    // Initial derived state
    const initialPos = initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
        ? initialPosition
        : null;

    // Selected pin position
    const [position, setPosition] = useState<[number, number] | null>(initialPos);

    // Lat/Lng text inputs
    const [latInput, setLatInput] = useState(initialPos ? initialPos[0].toFixed(6) : "");
    const [lngInput, setLngInput] = useState(initialPos ? initialPos[1].toFixed(6) : "");
    const [inputError, setInputError] = useState("");

    // Search
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortController = useRef<AbortController | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fly trigger
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(initialPos);

    // ── Helper to update position & inputs ───────────────────
    const updatePositionAndInputs = useCallback((lat: number, lng: number) => {
        if (!isWithinBangladesh(lat, lng)) {
            setInputError("Location must be within Bangladesh.");
            return;
        }
        setPosition([lat, lng]);
        setLatInput(lat.toFixed(6));
        setLngInput(lng.toFixed(6));
        setInputError("");
    }, []);

    // ── Sync initialPosition prop ────────────────────────────
    const [prevInitialPosition, setPrevInitialPosition] = useState(initialPosition);
    if (initialPosition !== prevInitialPosition) {
        setPrevInitialPosition(initialPosition);
        if (initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
            setPosition(initialPosition);
            setLatInput(initialPosition[0].toFixed(6));
            setLngInput(initialPosition[1].toFixed(6));
            setInputError("");
            setFlyTarget(initialPosition);
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => setMounted(true), 0);
        configureLeafletIcons();
        return () => clearTimeout(timeoutId);
    }, []);

    // ── Close suggestions on outside click ──────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Nominatim search (debounced) ─────────────────────────
    const handleSearchInput = useCallback((value: string) => {
        setQuery(value);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            if (abortController.current) abortController.current.abort();
            return;
        }
        searchDebounce.current = setTimeout(async () => {
            setSearching(true);
            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(value)}&countrycodes=bd`,
                    {
                        headers: { "Accept-Language": "en" },
                        signal: abortController.current.signal
                    }
                );
                const data: NominatimResult[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 450);
    }, []);

    const selectSuggestion = useCallback((result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        if (!isWithinBangladesh(lat, lng)) {
            setInputError("Location must be within Bangladesh.");
            return;
        }
        updatePositionAndInputs(lat, lng);
        setFlyTarget([lat, lng]);
        setQuery(result.display_name.split(",").slice(0, 3).join(","));
        setSuggestions([]);
        setShowSuggestions(false);
    }, [updatePositionAndInputs]);

    // ── Map click handler ────────────────────────────────────
    const handleMapPick = useCallback((lat: number, lng: number) => {
        updatePositionAndInputs(lat, lng);
    }, [updatePositionAndInputs]);

    // ── Manual lat/lng apply ─────────────────────────────────
    const applyManualCoords = useCallback(() => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (isNaN(lat) || isNaN(lng)) {
            setInputError("Please enter valid numbers.");
            return;
        }
        const clampedLat = clamp(lat, -90, 90);
        const clampedLng = clamp(lng, -180, 180);

        if (!isWithinBangladesh(clampedLat, clampedLng)) {
            setInputError("Location must be within Bangladesh.");
            return;
        }

        setInputError("");
        updatePositionAndInputs(clampedLat, clampedLng);
        setFlyTarget([clampedLat, clampedLng]);
    }, [latInput, lngInput, updatePositionAndInputs]);

    // ── Confirm selection ────────────────────────────────────
    const handleConfirm = useCallback(() => {
        if (!position) return;
        onSelect(position[0], position[1]);
        onClose();
    }, [position, onSelect, onClose]);

    // ── Use my location ──────────────────────────────────────
    const handleGeolocate = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            updatePositionAndInputs(lat, lng);
            if (isWithinBangladesh(lat, lng)) {
                setFlyTarget([lat, lng]);
            }
        });
    }, [updatePositionAndInputs]);

    const defaultCenter: LatLngExpression =
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0 && isWithinBangladesh(initialPosition[0], initialPosition[1])
            ? initialPosition
            : [23.8103, 90.4125];

    const maxBounds: LatLngBoundsExpression = [BD_BOUNDS.southWest, BD_BOUNDS.northEast];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="p-0 border-0 shadow-none bg-transparent max-w-4xl w-[95vw] h-[92vh] max-h-[92vh] rounded-none overflow-visible">
                <span className="sr-only">
                    <DialogTitle>Pick a Location</DialogTitle>
                </span>

                <div className="flex flex-col h-[86vh] max-h-[86vh] rounded-2xl overflow-hidden shadow-2xl bg-card relative">
                    {/* ── Map (full area) ── */}
                    <div className="flex-1 relative overflow-hidden">
                        {mounted && open && (
                            <MapContainer
                                center={defaultCenter}
                                zoom={position ? 14 : 6}
                                scrollWheelZoom
                                zoomControl={false}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={6}
                                className="h-full w-full"
                            >
                                <ForceResize open={open} />
                                <FlyToPosition position={flyTarget} />
                                {/* OpenStreetMap — free, no API key, no watermark */}
                                <TileLayer
                                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    maxZoom={19}
                                />
                                <ClickHandler onPick={handleMapPick} />
                                {position && <Marker position={position} />}
                            </MapContainer>
                        )}

                        {/* ── Search bar overlay ── */}
                        <div ref={searchRef} className="absolute top-4 left-1/2 -translate-x-1/2 w-[min(480px,calc(100%-32px))] z-[1000]">
                            <div className={`flex items-center bg-background ${showSuggestions && suggestions.length > 0 ? 'rounded-t-xl' : 'rounded-xl'} shadow-lg px-4 gap-2 h-12`}>
                                {searching ? (
                                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                                ) : (
                                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                                )}
                                <input
                                    type="text"
                                    placeholder="Search location in Bangladesh…"
                                    value={query}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && suggestions.length > 0)
                                            selectSuggestion(suggestions[0]);
                                        if (e.key === "Escape") setShowSuggestions(false);
                                    }}
                                    className="flex-1 border-none outline-none text-[15px] bg-transparent text-foreground placeholder:text-muted-foreground"
                                />
                                {query && (
                                    <button
                                        onClick={() => {
                                            setQuery("");
                                            setSuggestions([]);
                                            setShowSuggestions(false);
                                        }}
                                        className="p-1 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="bg-background rounded-b-xl shadow-xl overflow-hidden border-t border-border">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={s.place_id}
                                            onClick={() => selectSuggestion(s)}
                                            className={`flex items-center gap-3 w-full px-4 py-3 border-none bg-transparent cursor-pointer text-left transition-colors hover:bg-muted ${i < suggestions.length - 1 ? 'border-b border-border/50' : ''}`}
                                        >
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-[13px] text-foreground leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                                                {s.display_name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── My Location button ── */}
                        <button
                            onClick={handleGeolocate}
                            title="Use my location"
                            className="absolute top-4 right-4 z-[1000] w-10 h-10 rounded-full bg-background shadow-md flex items-center justify-center cursor-pointer transition-colors hover:bg-muted"
                        >
                            <Navigation className="w-[18px] h-[18px] text-primary" />
                        </button>

                        {/* ── Click hint pill ── */}
                        {!position && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] bg-black/65 text-white px-4 py-1.5 rounded-full text-[13px] pointer-events-none backdrop-blur-sm whitespace-nowrap">
                                Click on the map or search to pin a location
                            </div>
                        )}
                    </div>

                    {/* ── Bottom panel ── */}
                    <div className="bg-card p-4 sm:px-5 border-t border-border/50 flex flex-col gap-3 z-10">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-foreground text-[13px] font-semibold tracking-wide">
                                {position ? "Selected Location" : "No location selected"}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                            <div className="flex flex-1 w-full gap-3">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                                        LATITUDE
                                    </label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={latInput}
                                        onChange={(e) => {
                                            setLatInput(e.target.value);
                                            setInputError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && applyManualCoords()}
                                        placeholder="e.g. 23.8103"
                                        className="h-9 bg-background font-mono text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                                        LONGITUDE
                                    </label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={lngInput}
                                        onChange={(e) => {
                                            setLngInput(e.target.value);
                                            setInputError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && applyManualCoords()}
                                        placeholder="e.g. 90.4125"
                                        className="h-9 bg-background font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={applyManualCoords}
                                className="h-9 px-4 w-full sm:w-auto text-primary bg-primary/10 hover:bg-primary/20 shrink-0"
                            >
                                Go
                            </Button>
                        </div>

                        {inputError && (
                            <p className="text-destructive text-xs m-0">{inputError}</p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1 mt-1 border-t border-border/40">
                            <Button variant="ghost" size="sm" onClick={onClose} className="h-9">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={!position}
                                size="sm"
                                className="h-9 font-semibold shadow-md"
                            >
                                <Check className="w-4 h-4 mr-1.5" />
                                Confirm Location
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

