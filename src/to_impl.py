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
    print()
    print()
    print("  " + term + " " * (prog_pos - len(term)) +
          " " + str(round(progress * 100, 2)) + '%')
    print()
    print()
    print()
    if len(bchars) != 0:
        for char in bchars:
            print(" " + char, end='')
        print()
    else:
        print()
    print()
    resp = input('> ')
    if resp == 'stop':
        stopflag = True
    return resp == cards[term]


def p_done():
    print()
    print()
    print("+-----------------------------------------+")
    print("|                                         |")
    print("|                  Done!                  |")
    print("|                                         |")
    print("+-----------------------------------------+")


def study(cards, progress, bchars):
    missed_words = []
    while True:

        if len(mc_list) > 0:
            term = random.choice(mc_list)
            if ask_mc(term, cards, 1 - len(mc_list)/len(progress)):
                if stopflag:
                    break

            else:
                if stopflag:
                    break
                p_incorrect(cards[term])
                if term + ' / ' + cards[term] not in missed_words:
                    missed_words.append(term + ' / ' + cards[term])

        else:
            or_list = []
            for key, value in progress.items():
                if not value["or"]:
                    or_list.append(key)

            if len(or_list) > 0:
                term = random.choice(or_list)
                if ask_or(term, cards, bchars, 1 - len(or_list)/len(progress)):
                    p_correct()
                    if stopflag:
                        break
                    if progress[term]["missed"]:
                        progress[term]["missed"] = False
                    else:
                        progress[term]["or"] = True
                else:
                    if stopflag:
                        break
                    p_incorrect(cards[term])
                    progress[term]["missed"] = True
                    if term + ' / ' + cards[term] not in missed_words:
                        missed_words.append(term + ' / ' + cards[term])

            else:
                p_done()
                break
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
