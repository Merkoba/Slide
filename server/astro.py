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
FETCH_INTERVAL = 10  # seconds
OUTPUT_FILE = "status.txt"
DRIFT_AMOUNT = 2.0

SOUNDS = [
    "sine",
    "triangle",
    "piano",
]

BANKS = [
    "RhodesPolaris",
]


class SkyScanner:
    def __init__(self) -> None:
        self.stop_event = threading.Event()
        self.thread = None
        self.current_ra = START_RA
        self.is_running = False

    def get_ra_average(self, ra_values):
        # Convert degrees to radians
        ra_rad = np.deg2rad(ra_values)

        # Convert to unit vectors (x, y)
        x = np.cos(ra_rad)
        y = np.sin(ra_rad)

        # Average the vectors
        avg_x = np.mean(x)
        avg_y = np.mean(y)

        # Convert back to angle in degrees
        avg_ra_rad = np.arctan2(avg_y, avg_x)
        avg_ra_deg = np.rad2deg(avg_ra_rad) % 360

        return avg_ra_deg

    def get_dec_average(self, dec_values):
        return np.mean(dec_values)

    def get_star_data(self, ra: float) -> list[dict[str, Any]]:
        custom_simbad = Simbad()
        custom_simbad.add_votable_fields("ids", "V", "B")
        coord = SkyCoord(ra=ra, dec=START_DEC, unit=(u.deg, u.deg), frame="icrs")

        try:
            table = custom_simbad.query_region(coord, radius=SEARCH_RADIUS_DEG * u.deg)

            if table is None:
                return []

            ra_list = []
            dec_list = []

            for row in table:
                ra_list.append({
                    row["ra"]
                })

                dec_list.append({
                    row["dec"]
                })

            return {
                "ra": self.get_ra_average(ra_list),
                "dec": self.get_dec_average(dec_list),
            }

        except Exception as e:
            utils.echo(f"Simbad Query Error: {e}")
            return []

    def generate_strudel_code(self, data: list[Any]) -> str:
        print(data["ra"], data["dec"])


    def run_loop(self) -> None:
        utils.echo("--- Sky Scanner Initialized (Ambient Mode) ---")
        utils.echo(f"Waiting {FETCH_INTERVAL}s before first scan...")

        while not self.stop_event.is_set():
            if self.stop_event.wait(FETCH_INTERVAL):
                break

            try:
                utils.echo(f"\nScanning RA: {self.current_ra:.2f}...")
                stars = self.get_star_data(self.current_ra)

                if stars:
                    utils.echo(f"  > Found {len(stars)} stars.")
                    lead = stars[0]
                    avg_tone = sum(s["tone"] for s in stars) / len(stars)
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
