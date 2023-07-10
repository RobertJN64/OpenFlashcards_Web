import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import './App.css';

const app_status = {
  WaitingOnStart: Symbol("WaitingOnStart"),
  AskQuestion: Symbol("AsQuestion"),
  Correct: Symbol("Correct"),
  Incorrect: Symbol("Incorrect"),
  End: Symbol("End"),
}

const MODE_DEF = true; // answer with def
const MODE_TERM = false;  // answer with term

var mode = MODE_DEF; //TODO - allow mode switching
//TODO - missed words
//TODO - stopflag

var cards = {};
var progress = {};
var canswer = ""; //correct answer

// window.addEventListener(
//   "keydown",
//   (event) => {
//     if (['1', '2', '3', '4'].includes(event.key)) {
//       e_btn(event.key);
//     }
//   },
//   true,
// );



function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function MainCard() {
  const [current_status, set_current_status] = useState(app_status.WaitingOnStart);

  function e_start() {
    set_current_status(app_status.AskQuestion);
  }

  function StartScreen() {
    const [upload_card_status, set_upload_card_status] = useState("Waiting on upload...");

    const handleCardsUpload = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        var lines = e.target.result.split('\n');
        for (var line of lines) {
          line = line.trim();
          if (!line.includes(' | ')) {
            alert("<" + line + "> did not contain ` | `");
          }
          var term = line.split(' | ')[0];
          var definition = line.split(' | ')[1];

          if (mode) {
            cards[term] = definition;
          }
          else {
            cards[definition] = term
          }
        }
        console.log(cards);
        set_upload_card_status("Found: " + Object.keys(cards).length + " cards.");

        var delkeys = []
        var addkeys = []
        for (const key of Object.keys(progress)) {
          if (!(key in cards)) {
            delkeys.push(key);
          }
        }

        for (const key of Object.keys(cards)) {
          if (!(key in progress)) {
            addkeys.push(key);
          }
        }

        for (const key of delkeys) {
          delete progress[key];
        }

        for (const key of addkeys) {
          progress[key] = {
            "mc": false, "or": false,
            "missed": false
          }; //multichoice, open response
        }
        console.log(progress);
      };
    };

    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>

            <Card.Title>Load your cards...</Card.Title>
            <br />
            <input type="file" onChange={handleCardsUpload} />
            <p>{upload_card_status}</p>
            <br />
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_start}>Start</Button>
          </Card.Body>
        </Card >

      </>
    )
  }

  function ask_mc(term, cards, perc) {
    var answers = [cards[term]];

    function e_btn(x) {
      if (answers[x - 1] === cards[term]) {
        if (progress[term]["missed"]) {
          progress[term]["missed"] = false;
        }
        else {
          progress[term]["mc"] = true;
        }
        set_current_status(app_status.Correct);
      }
      else {
        progress[term]["missed"] = true;
        canswer = cards[term];
        set_current_status(app_status.Incorrect);
      }
    }

    function e_btn_1() { e_btn(1) };
    function e_btn_2() { e_btn(2) };
    function e_btn_3() { e_btn(3) };
    function e_btn_4() { e_btn(4) };


    while (answers.length < 4) {
      var c = answers[0];
      while (answers.includes(c)) {
        c = Object.values(cards)[Math.floor((Math.random() * Object.values(cards).length))];
      }
      answers.push(c);
    }

    shuffleArray(answers);

    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>
            <p style={{ textAlign: 'right' }}>{perc.toFixed(4) * 100}%</p>
            <Card.Title>{term}</Card.Title>
            <br />
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td><Button style={{ width: '100%' }} onClick={e_btn_1}>{answers[0]}</Button></td>
                  <td></td>
                  <td><Button style={{ width: '100%' }} onClick={e_btn_2}>{answers[1]}</Button></td>
                </tr>
                <tr><td><p></p></td></tr>
                <tr>
                  <td><Button style={{ width: '100%' }} onClick={e_btn_3}>{answers[2]}</Button></td>
                  <td></td>
                  <td><Button style={{ width: '100%' }} onClick={e_btn_4}>{answers[3]}</Button></td>
                </tr>
              </tbody>
            </table>
          </Card.Body>
        </Card>

      </>
    )
  }

  function AskQuestion() {
    var mc_list = []
    for (const key of Object.keys(progress)) {
      if (!progress[key]['mc']) {
        mc_list.push(key);
      }
    }

    if (mc_list.length > 0) {
      var term = mc_list[Math.floor((Math.random() * mc_list.length))];
      return ask_mc(term, cards, 1 - mc_list.length / Object.values(progress).length);
    }
    else {
      set_current_status(app_status.Done); //TODO - OR
    }
  }

  function Correct() {
    setTimeout(() => set_current_status(app_status.AskQuestion), 1000)
    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>
            <Card.Title>Correct!</Card.Title>
          </Card.Body>
        </Card >
      </>
    )
  }

  function Incorrect() {
    function e_inc_cont() {
      set_current_status(app_status.AskQuestion);
    }

    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>
            <Card.Title>Incorrect!</Card.Title>
            <br />
            <p className="text-center">{canswer}</p>
            <Button style={{ width: '100%' }} className='btn-danger' onClick={e_inc_cont}>Continue</Button>
          </Card.Body>
        </Card >
      </>
    )
  }

  function Done() {
    function e_restart() {
      set_current_status(app_status.WaitingOnStart);
    }

    function e_again() {
      for (const key of Object.keys(progress)) {
        progress[key] = {
          "mc": false, "or": false,
          "missed": false
        }; //multichoice, open response
      }
      set_current_status(app_status.AskQuestion);
    }

    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>
            <Card.Title>Done!</Card.Title>
            <br />
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_restart}>New Set!</Button>
            <p></p>
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_again}>Study again!</Button>
          </Card.Body>
        </Card >
      </>
    )
  }

  switch (current_status) {
    case app_status.WaitingOnStart:
      return <StartScreen />
    case app_status.AskQuestion:
      return <AskQuestion />
    case app_status.Correct:
      return <Correct />
    case app_status.Incorrect:
      return <Incorrect />
    case app_status.Done:
      return <Done />
    default:
      alert("App status invalid! " + current_status)
      break;
  }
}

const App = () => (
  <>
    <h1 className="text-center">Open Flashcards Web</h1>
    <MainCard />
  </>
);

export default App;
