import time
import math
import threading
import numpy as np
from typing import List, Dict, Any
from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord
import astropy.units as u

# CONFIGURATION
# ------------------------------------------------------------------------------
START_RA = 180.0
START_DEC = 30.0
SEARCH_RADIUS_DEG = 2.0
FETCH_INTERVAL = 60  # seconds
OUTPUT_FILE = "status.txt"
DRIFT_AMOUNT = 2.0

class SkyScanner:
    def __init__(self):
        self._stop_event = threading.Event()
        self._thread = None
        self.current_ra = START_RA
        self.is_running = False

    def normalize_value(self, value: float, min_val: float, max_val: float) -> float:
        if math.isnan(value):
            return 0.5

        norm = (value - min_val) / (max_val - min_val)
        return max(0.0, min(1.0, norm))

    def get_safe_float(self, row, col_name):
        """Safely extracts a float from a masked numpy array row."""
        if col_name not in row.colnames:
            return float("nan")

        val = row[col_name]

        # Check if the specific value is masked (missing)
        if np.ma.is_masked(val):
            return float("nan")

        try:
            return float(val)
        except (ValueError, TypeError):
            return float("nan")

    def get_star_name(self, row: Any) -> str:
        """Tries to find the star's name/ID from available columns."""
        candidates = ["MAIN_ID", "ID", "main_id", "id", "TYC", "HIP", "HD"]

        for c in candidates:
            if c in row.colnames:
                val = row[c]

                if isinstance(val, bytes):
                    return val.decode("utf-8")

                return str(val)

        return str(row[0])

    def get_normalized_star_data(self, ra: float) -> List[Dict[str, Any]]:
        custom_simbad = Simbad()
        custom_simbad.add_votable_fields("ids", "V", "B")
        coord = SkyCoord(ra=ra, dec=START_DEC, unit=(u.deg, u.deg), frame="icrs")

        try:
            table = custom_simbad.query_region(coord, radius=SEARCH_RADIUS_DEG * u.deg)

            if table is None:
                return []

            processed_stars = []

            for row in table:
                v_mag = self.get_safe_float(row, "FLUX_V")

                if math.isnan(v_mag):
                    v_mag = self.get_safe_float(row, "V")

                b_mag = self.get_safe_float(row, "FLUX_B")

                if math.isnan(b_mag):
                    b_mag = self.get_safe_float(row, "B")

                if math.isnan(v_mag):
                    continue

                norm_vol = 1.0 - self.normalize_value(v_mag, -1.5, 12.0)

                if not math.isnan(b_mag):
                    color_index = b_mag - v_mag
                    norm_tone = 1.0 - self.normalize_value(color_index, -0.5, 2.0)
                else:
                    norm_tone = 0.5

                processed_stars.append({
                    "name": self.get_star_name(row),
                    "music_vol": round(norm_vol, 3),
                    "music_tone": round(norm_tone, 3),
                })

            processed_stars.sort(key=lambda x: x["music_vol"], reverse=True)
            return processed_stars

        except Exception as e:
            print(f"Query Logic Error: {e}")
            return []

    def generate_strudel_code(self, stars):
        if not stars:
            return 'stack(note("c2").s("sawtooth").lpf(200).gain(0.3).slow(4)).room(2)'

        lead_star = stars[0]
        avg_tone = sum(s["music_tone"] for s in stars) / len(stars)

        cpm_val = 50 + int(lead_star["music_vol"] * 100)
        cutoff_val = 200 + int(avg_tone * 3800)

        drone_layer = f'  note("c2").s("sawtooth").lpf({cutoff_val}).gain(0.4).slow(2)'

        if lead_star["music_vol"] < 0.3:
            beat_pattern = "bd(3,8)"
        elif lead_star["music_vol"] < 0.7:
            beat_pattern = "bd hh"
        else:
            beat_pattern = "bd [sd, hh] bd hh"

        beat_layer = f'  s("{beat_pattern}").bank("rolandtr909").lpf({cutoff_val * 2}).gain(0.6)'

        scale_degrees = [0, 3, 5, 7, 10, 12]
        melody_notes = []

        for s in stars[:4]:
            scale_idx = int(s["music_tone"] * (len(scale_degrees) - 1))
            degree = scale_degrees[scale_idx]
            melody_notes.append(str(degree))

        seq_str = " ".join(melody_notes)
        effect = ".jux(rev)" if avg_tone > 0.6 else ""

        melody_layer = f'  note("{seq_str}").scale("c3 minor").s("sine").delay(0.5).gain(0.5){effect}'

        strudel_code = f"""
cpm({cpm_val})

stack(
{drone_layer},
{beat_layer},
{melody_layer}
).room(1.5).clip(1)
"""
        return strudel_code.strip()

    def _run_loop(self):
        """Internal method that runs in the thread."""
        print(f"--- Sky Scanner Active (Writing to {OUTPUT_FILE}) ---")

        while not self._stop_event.is_set():
            print(f"\nScanning RA: {self.current_ra:.2f}...")
            stars = self.get_normalized_star_data(self.current_ra)

            if stars:
                print(f"  > Found {len(stars)} stars.")
                lead = stars[0]
                print(f"  > Lead: {lead['name']} (Vol: {lead['music_vol']}, Tone: {lead['music_tone']})")
            else:
                print("  > Deep Space (Silence)")

            code = self.generate_strudel_code(stars)

            with open(OUTPUT_FILE, "w") as f:
                f.write(code)

            self.current_ra = (self.current_ra + DRIFT_AMOUNT) % 360.0

            # Wait for FETCH_INTERVAL, but return immediately if stop is called
            if self._stop_event.wait(FETCH_INTERVAL):
                break

        print("--- Sky Scanner Stopped ---")

    def start(self):
        """Starts the scanning thread if not already running."""
        if self.is_running:
            print("Scanner is already running.")
            return

        self._stop_event.clear()
        self.is_running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stops the scanning thread."""
        if not self.is_running:
            return

        print("Stopping scanner...")
        self._stop_event.set()
        self._thread.join()
        self.is_running = False

def start() -> SkyScanner:
    scanner = SkyScanner()
    scanner.start()
    return scanner