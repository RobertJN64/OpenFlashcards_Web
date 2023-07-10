import json
import os

stopflag = False


def load_progress(cards_name, cards):
    progress = {}
    if cards_name + '.progress' in os.listdir('sets'):
        if input("Use existing progress (y / n): ").lower()[0] == "y":
            with open('sets/' + cards_name + '.progress') as f:
                progress = json.load(f)


def main():
    if input("Answer with (term / def): ").lower() == "term":
        mode = MODE_TERM

    progress = load_progress(cards_name, cards)

    if input("Save progress (y / n): ").lower()[0] == "y":
        with open('sets/' + cards_name + '.progress', 'w+', encoding="utf-8") as f:
            json.dump(progress, f, indent=4)
