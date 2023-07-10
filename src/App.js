import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form'

import './App.css';

const AppStatus = {
  WaitingOnStart: Symbol("WaitingOnStart"),
  AskQuestion: Symbol("AsQuestion"),
  Correct: Symbol("Correct"),
  Incorrect: Symbol("Incorrect"),
  Done: Symbol("Done")
}

const MODE_DEF = true; // answer with def
const MODE_TERM = false;  // answer with term

var file_name = 'none';
var cards_raw;
var cards = {};
var progress = {};
var missed_words = [];
var b_chars = [];
var canswer = ""; //correct answer
var k_handler = null;
const normal_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function download_progress() {
  var file = new Blob([JSON.stringify(progress, undefined, 2)]);
  var a = document.createElement("a"),
    url = URL.createObjectURL(file);
  a.href = url;
  a.download = file_name + '.progress'
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

window.addEventListener(
  "keydown",
  (event) => {
    if (['1', '2', '3', '4', 'Enter'].includes(event.key)) {
      if (k_handler != null) {
        k_handler(event.key);
      }
    }
  },
  true,
);

function MainCard() {
  const [current_status, set_current_status] = useState(AppStatus.WaitingOnStart);

  function StartScreen() {
    const [mode, set_mode] = useState(MODE_DEF);
    const [upload_card_status, set_upload_card_status] = useState("Waiting on upload...");
    const [upload_progress_status, set_upload_progress_status] = useState("Waiting on upload...");

    function btn_start() {
      for (var line of cards_raw) {
        line = line.trim();
        if (!line.includes(' | ')) {
          continue
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

      for (const word of Object.values(cards)) {
        for (const char of word) {
          if (!normal_chars.includes(char)) {
            b_chars.push(char);
          }
        }
      }

      set_current_status(AppStatus.AskQuestion);
    }

    k_handler = (x) => {
      if (x === 'Enter') {
        btn_start();
      }
    }

    const handleCardsUpload = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      file_name = e.target.files[0].name.split('.')[0];
      fileReader.onload = e => {

        cards_raw = e.target.result.split('\n');
        var count = 0
        for (var line of cards_raw) {
          line = line.trim();
          if (!line.includes(' | ')) {
            alert("<" + line + "> did not contain ` | `");
          }
          else {
            count += 1;
          }
        }
        set_upload_card_status("Found: " + count + " cards.");
      };
    };

    const handleProgressUpload = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        progress = JSON.parse(e.target.result);
        set_upload_progress_status("Progress loaded...");
      };
    };

    const mode_change = e => {
      set_mode(!mode);
    };

    return (
      <>
        <Card>
          <Card.Body>

            <Card.Title>Load your cards...</Card.Title>
            <input type="file" onChange={handleCardsUpload} />
            <p>{upload_card_status}</p>

            <Card.Title>Upload progress (optional)</Card.Title>
            <input type="file" onChange={handleProgressUpload} />
            <p>{upload_progress_status}</p>
            <br />
            <br />

            <Form.Group>
              <Form.Check onChange={mode_change} value={MODE_DEF} type='radio' label='Answer with Definition' checked={mode === MODE_DEF} />
              <Form.Check onChange={mode_change} value={MODE_TERM} type='radio' label='Answer with Term' checked={mode === MODE_TERM} />
            </Form.Group>
            <br />

            <Button style={{ width: '100%' }} className='btn-success' onClick={btn_start}>Start</Button>
          </Card.Body>
        </Card >

      </>
    )
  }

  function Correct() {
    setTimeout(() => set_current_status(AppStatus.AskQuestion), 1000)
    return (
      <>
        <Card>
          <Card.Body>
            <Card.Title>Correct!</Card.Title>
          </Card.Body>
        </Card >
      </>
    )
  }

  function Incorrect() {
    function continue_to_question() {
      set_current_status(AppStatus.AskQuestion);
    }

    k_handler = (x) => {
      if (x === 'Enter') {
        continue_to_question();
      }
    }

    return (
      <>
        <Card>
          <Card.Body>
            <Card.Title>Incorrect!</Card.Title>
            <br />
            <p className="text-center">{canswer}</p>
            <Button style={{ width: '100%' }} className='btn-danger' onClick={continue_to_question}>Continue</Button>
          </Card.Body>
        </Card >
      </>
    )
  }

  function Done() {
    function e_restart() {
      set_current_status(AppStatus.WaitingOnStart);
    }

    function e_again() {
      for (const key of Object.keys(progress)) {
        progress[key] = {
          "mc": false, "or": false,
          "missed": false
        }; //multichoice, open response
      }
      set_current_status(AppStatus.AskQuestion);
    }

    return (
      <>
        <Card>
          <Card.Body>
            <Card.Title>Done!</Card.Title>
            <br />
            <p>Missed words:&nbsp;{missed_words.join(', ')}</p>
            <br />
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_restart}>New Set!</Button>
            <p></p>
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_again}>Study again!</Button>
          </Card.Body>
        </Card >
      </>
    )
  }

  function ask_mc(term, cards, perc) {
    var answers = [cards[term]];

    function check_answer(x) {
      if (x === 'Enter') {
        return;
      }
      if (answers[x - 1] === cards[term]) {
        if (progress[term]["missed"]) {
          progress[term]["missed"] = false;
        }
        else {
          progress[term]["mc"] = true;
        }
        set_current_status(AppStatus.Correct);
      }
      else {
        if (!missed_words.includes(term + '/' + cards[term])) {
          missed_words.push(term + '/' + cards[term]);
        }
        progress[term]["missed"] = true;
        canswer = cards[term];
        set_current_status(AppStatus.Incorrect);
      }
    }

    k_handler = check_answer;

    function btn_1() { check_answer(1) };
    function btn_2() { check_answer(2) };
    function btn_3() { check_answer(3) };
    function btn_4() { check_answer(4) };

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
        <Card>
          <Card.Body>
            <p style={{ textAlign: 'right' }}>{(perc * 100).toFixed(2)}%</p>
            <Card.Title>{term}</Card.Title>
            <br />
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td><Button style={{ width: '100%' }} onClick={btn_1}>1:&nbsp;{answers[0]}</Button></td>
                  <td></td>
                  <td><Button style={{ width: '100%' }} onClick={btn_2}>2:&nbsp;{answers[1]}</Button></td>
                </tr>
                <tr><td><p></p></td></tr>
                <tr>
                  <td><Button style={{ width: '100%' }} onClick={btn_3}>3:&nbsp;{answers[2]}</Button></td>
                  <td></td>
                  <td><Button style={{ width: '100%' }} onClick={btn_4}>4:&nbsp;{answers[3]}</Button></td>
                </tr>
              </tbody>
            </table>
          </Card.Body>
        </Card>

      </>
    )
  }

  function ask_or(term, cards, perc) {
    var answer = "";

    function submit_answer() {
      if (answer === cards[term]) {
        if (progress[term]["missed"]) {
          progress[term]["missed"] = false;
        }
        else {
          progress[term]["or"] = true;
        }
        set_current_status(AppStatus.Correct);
      }
      else {
        if (!missed_words.includes(term + '/' + cards[term])) {
          missed_words.push(term + '/' + cards[term]);
        }
        progress[term]["missed"] = true;
        canswer = cards[term];
        set_current_status(AppStatus.Incorrect);
      }
    }

    function e_update_input(event) {
      answer = event.target.value;
    }

    k_handler = (x) => {
      if (x === 'Enter') {
        submit_answer();
      }
    }

    var x = '';
    if (b_chars.length > 0) {
      x = <p>{b_chars.join(' ')}</p>
    }

    return (
      <>
        <Card>
          <Card.Body>
            <p style={{ textAlign: 'right' }}>{(perc * 100).toFixed(2)}%</p>
            <Card.Title>{term}</Card.Title>
            <br />
            {x}
            <input onChange={e_update_input} autoFocus style={{ width: '70%' }}></input>
            &nbsp;
            <Button className='btn-success' onClick={submit_answer}>Submit!</Button>
          </Card.Body>
        </Card >
      </>
    )
  }

  function AskQuestion() {
    var mc_list = []
    var or_list = []
    for (const key of Object.keys(progress)) {
      if (!progress[key]['mc']) {
        mc_list.push(key);
      }
      if (!progress[key]['or']) {
        or_list.push(key);
      }
    }

    var term;
    if (mc_list.length > 0) {
      term = mc_list[Math.floor((Math.random() * mc_list.length))];
      return ask_mc(term, cards, 1 - mc_list.length / Object.values(progress).length);
    }
    else if (or_list.length > 0) {
      term = or_list[Math.floor((Math.random() * or_list.length))];
      return ask_or(term, cards, 1 - or_list.length / Object.values(progress).length);
    }
    else {
      function done_handler() {
        set_current_status(AppStatus.Done); //can't update state while rendering
      }

      setTimeout(done_handler, 100);
      return <Done />
    }
  }

  k_handler = null;
  switch (current_status) {
    case AppStatus.WaitingOnStart:
      return <StartScreen />;
    case AppStatus.AskQuestion:
      return <AskQuestion />;
    case AppStatus.Correct:
      return <Correct />;
    case AppStatus.Incorrect:
      return <Incorrect />;
    case AppStatus.Done:
      return <Done />;
    default:
      alert("App status invalid! " + current_status)
      break;
  }
}

const App = () => (
  <>
    <h1 className="text-center">Open Flashcards Web</h1>
    <Container style={{ width: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
      <MainCard />
      <br />
      <Button style={{ float: 'right' }} className='btn-secondary' onClick={download_progress}>Download Progress</Button>
    </Container>

  </>
);

export default App;
