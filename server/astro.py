import math
import threading
import numpy as np  # type: ignore
import astropy.units as u  # type: ignore
from typing import Any
from astroquery.simbad import Simbad  # type: ignore
from astropy.coordinates import SkyCoord  # type: ignore
from pathlib import Path

import utils

START_RA = 180.0
START_DEC = 30.0
SEARCH_RADIUS_DEG = 2.0
FETCH_INTERVAL = 60  # seconds
OUTPUT_FILE = "status.txt"
DRIFT_AMOUNT = 2.0

# Using softer waveforms for ambient feel
WAVEFORMS = [
    "sine",
    "triangle",
    "superpiano",  # If supported, otherwise falls back smoothly
    "organ",
]

# Using lighter, glitchier drum banks
DRUM_BANKS = [
    "RhodesPolaris",  # Soft kicks
    "AlesisSR16",
]


class SkyScanner:
    def __init__(self) -> None:
        self.stop_event = threading.Event()
        self.thread = None
        self.current_ra = START_RA
        self.is_running = False

    def normalize_value(self, value: float, min_val: float, max_val: float) -> float:
        if math.isnan(value):
            return 0.5

        norm = (value - min_val) / (max_val - min_val)
        return max(0.0, min(1.0, norm))

    def get_safe_float(self, row: Any, col_name: str) -> float:
        if col_name not in row.colnames:
            return float("nan")

        val = row[col_name]

        if np.ma.is_masked(val):
            return float("nan")
        try:
            return float(val)
        except (ValueError, TypeError):
            return float("nan")

    def get_star_name(self, row: Any) -> str:
        candidates = ["MAIN_ID", "ID", "main_id", "id", "TYC", "HIP", "HD"]

        for c in candidates:
            if c in row.colnames:
                val = row[c]

                if isinstance(val, bytes):
                    return val.decode("utf-8")

                return str(val)

        return str(row[0])

    def get_normalized_star_data(self, ra: float) -> list[dict[str, Any]]:
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

                processed_stars.append(
                    {
                        "name": self.get_star_name(row),
                        "music_vol": round(norm_vol, 3),
                        "music_tone": round(norm_tone, 3),
                    }
                )

            processed_stars.sort(key=lambda x: x["music_vol"], reverse=True)  # type: ignore
            return processed_stars

        except Exception as e:
            utils.echo(f"Simbad Query Error: {e}")
            return []

    def generate_strudel_code(self, stars: Any) -> str:
        if not stars:
            return "// Nothing yet"


    def run_loop(self) -> None:
        utils.echo("--- Sky Scanner Initialized (Ambient Mode) ---")
        utils.echo(f"Waiting {FETCH_INTERVAL}s before first scan...")

        while not self.stop_event.is_set():
            if self.stop_event.wait(FETCH_INTERVAL):
                break

            try:
                utils.echo(f"\nScanning RA: {self.current_ra:.2f}...")
                stars = self.get_normalized_star_data(self.current_ra)

                if stars:
                    utils.echo(f"  > Found {len(stars)} stars.")
                    lead = stars[0]
                    avg_tone = sum(s["music_tone"] for s in stars) / len(stars)
                    utils.echo(f"  > Lead: {lead['name']} | Tone: {avg_tone:.2f}")

                code = self.generate_strudel_code(stars)

                with Path(OUTPUT_FILE).open("w", encoding="UTF-8") as f:
                    f.write(code)

            except Exception as e:
                utils.echo(f"Critical Loop Error: {e}")

            self.current_ra = (self.current_ra + DRIFT_AMOUNT) % 360.0

        utils.echo("--- Sky Scanner Stopped ---")

    def start(self) -> None:
        if self.is_running:
            return

        self.stop_event.clear()
        self.is_running = True
        self.thread = threading.Thread(target=self.run_loop, daemon=True)  # type: ignore

        if self.thread:
            self.thread.start()

    def stop(self) -> None:
        if not self.is_running:
            return

        self.stop_event.set()

        if self.thread:
            self.thread.join()

        self.is_running = False


def start() -> SkyScanner:
    scanner = SkyScanner()
    scanner.start()
    return scanner
