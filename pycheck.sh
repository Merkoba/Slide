#!/usr/bin/env bash
source venv/bin/activate &&
cd meltdown
clear &&
ruff format slide.py &&
ruff check slide.py &&
mypy --strict slide.py &&
pyright slide.py &&
deactivate