from time import sleep
import random
import json
import math
import os

stopflag = False
prog_pos = 35

normal_chars = [chr(x) for x in range(ord("A"), ord("A") + 26)]
normal_chars += [chr(x) for x in range(ord("a"), ord("a") + 26)]
normal_chars += [str(x) for x in range(0, 9)]
normal_chars += ' '


def load_cards(name):
    b_chars = []
    for word in cards.values():
        for char in word:
            if char not in normal_chars and char not in b_chars:
                b_chars.append(char)

    return cards, sorted(b_chars)


def load_progress(cards_name, cards):
    progress = {}
    if cards_name + '.progress' in os.listdir('sets'):
        if input("Use existing progress (y / n): ").lower()[0] == "y":
            with open('sets/' + cards_name + '.progress') as f:
                progress = json.load(f)


def ask_or(term, cards, bchars, progress):
    global stopflag

    if len(bchars) != 0:
        for char in bchars:
            print(" " + char, end='')
        print()
    else:
        print()


def study(cards, progress, bchars):
    missed_words = []
    missed_words.append(term + ' / ' + cards[term])
    return missed_words


def main():
    global mode
    cards_name = choose_set()
    if cards_name:
        if input("Answer with (term / def): ").lower() == "term":
            mode = MODE_TERM

        progress = load_progress(cards_name, cards)

        missed_words = study(cards, progress, bchars)
        print("Your missed words: ", ', '.join(missed_words))
        if input("Save progress (y / n): ").lower()[0] == "y":
            with open('sets/' + cards_name + '.progress', 'w+', encoding="utf-8") as f:
                json.dump(progress, f, indent=4)
